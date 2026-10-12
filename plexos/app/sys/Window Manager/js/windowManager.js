import plexos from "/plexos/ini/system.js"
import {getTask} from "/plexos/lib/functions/dll.js"
import Task from "/plexos/lib/classes/system/task.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import Window from "/plexos/lib/classes/interface/window.js"
import ProxyFile from "/plexos/lib/classes/filesystem/proxy.js"

const windowManager = getTask(/TASKID/)
let mem  = windowManager.mem

windowManager.mem.windows = []
windowManager.cmd("event.on", {eventName: "desktop-open", callback: ()=>{
    windowManager.node.style.width  = document.getElementById("desktopLayer").offsetWidth + "px"
    windowManager.node.style.height = document.getElementById("desktopLayer").offsetHeight + "px"
    windowManager.node.style.top  = document.getElementById("desktopLayer").offsetTop + "px"
    windowManager.node.style.left = document.getElementById("desktopLayer").offsetLeft + "px"
}})
windowManager.cmd("event.on", {eventName: "viewport-resize", callback: ()=>{
    windowManager.node.style.width  = document.getElementById("desktopLayer").offsetWidth + "px"
    windowManager.node.style.height = document.getElementById("desktopLayer").offsetHeight + "px"
    windowManager.node.style.top  = document.getElementById("desktopLayer").offsetTop + "px"
    windowManager.node.style.left = document.getElementById("desktopLayer").offsetLeft + "px"
}})
windowManager.cmd("event.on", {eventName: "window-stylized", callback: (window) => {
    if (window && window.appParams.sizeDrawMethod !== "fit-content") {
        if (window.drawParams.posX===0||window.drawParams.posY===0) {
            let drawPos = window.definePosition()
            window.drawParams.posX = drawPos.posX
            window.drawParams.posY = drawPos.posY
        }

        window.poseNode()
        window.node.classList.remove("building")
    }
}})
windowManager.cmd("event.on", {eventName: "window-scripted", callback: (window) => {
    if (window && window.appParams.sizeDrawMethod === "fit-content") {
        //window.drawParams.width  = window.node.offsetWidth
        //window.drawParams.height = window.node.offsetHeight
        window.appParams.minW   += window.node.offsetWidth
        window.appParams.minH   += window.node.offsetHeight

        if (window.drawParams.posX===0||window.drawParams.posY===0) {
            let drawPos = window.definePosition()
            window.drawParams.posX = drawPos.posX
            window.drawParams.posY = drawPos.posY
        }

        window.poseNode()
        window.node.classList.remove("building")
    }
}})
function currentUserName() {
    return plexos.System.user?.name || "User"
}

function cloneDraw(value) {
    if (!value || typeof value !== "object" || Object.keys(value).length === 0) return null
    return JSON.parse(JSON.stringify(value))
}

function isLegacyDrawParams(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false
    return ("posX" in value) || ("posY" in value) || ("width" in value) || ("height" in value) || ("maximized" in value)
}

function readUserDrawParams(current) {
    const bag = current ? ProxyFile.unwrapProxy(current) : null
    if (!bag || typeof bag !== "object") return null
    if (isLegacyDrawParams(bag)) return cloneDraw(bag)
    return cloneDraw(bag[currentUserName()])
}

// windowDrawParameters.current is keyed by username; a leftover flat posX bag is treated as legacy.
function writeUserDrawParams(parent, params) {
    const user = currentUserName()
    const snapshot = JSON.parse(JSON.stringify(params))
    const existing = parent.current ? ProxyFile.unwrapProxy(parent.current) : null
    if (!existing || isLegacyDrawParams(existing)) parent.current = {}
    parent.current[user] = snapshot
}

windowManager.getInitialDrawParams = function(window) {
    const appname      = Task.id(window.task).name
    const filePath     = window.appParams.filePath

    let getRegistryAppParams = function (window) {
        const taskRef = Task.id(window.task)
        if (!taskRef?.appID || !plexos.Core?.registry) return null
        let registryAppEntry = plexos.Core.registry.getAppParams(taskRef.appID)
        return readUserDrawParams(registryAppEntry?.windowDrawParameters?.current)
    }

    let getRegistryFileParams = function (window) {
        if (!filePath) return null
        const data = ProxyFile.unwrapProxy(File.at(`/plexos/reg/files.proxy`).data) || {}
        const stored = data[filePath]?.applications?.[appname]?.windowDrawParameters
        if (!stored || typeof stored !== "object") return null
        if (isLegacyDrawParams(stored)) return cloneDraw(stored)
        return readUserDrawParams(stored.current)
    }
    switch (window.appParams.saveDrawParameters) {
        case "default":
        case "app" :
            return getRegistryAppParams(window)
        case "window": {
            const taskRef = Task.id(window.task)
            const key = window.appParams.windowKey
            if (!taskRef?.appID || !plexos.Core?.registry || !key) return null
            let registryAppEntry = plexos.Core.registry.getAppParams(taskRef.appID)
            const saved = readUserDrawParams(registryAppEntry?.windowDrawParameters?.windows?.[key]?.current)
            if (!saved) return null
            return { posX: saved.posX, posY: saved.posY, width: 0, height: 0, maximized: false }
        }
        case "file":
        if (filePath) {
            return getRegistryFileParams(window)
        } else {
            return getRegistryAppParams(window) 
        }
    }
}
windowManager.setInitialDrawParams = function(window) {
    const appname      = Task.id(window.task).name
    const filePath     = window.appParams.filePath
    const taskRef      = Task.id(window.task)

    switch (window.appParams.saveDrawParameters) {
        case "default":
        case "app" :
            if (!taskRef?.appID || !plexos.Core?.registry) return
            {
                const pointer = plexos.Core.registry.resolveIndex(taskRef.appID)
                const registryAppEntry = File.at(`/plexos/reg/applications.proxy`).data[pointer.bucket][pointer.name]
                if (!registryAppEntry.windowDrawParameters) registryAppEntry.windowDrawParameters = {}
                writeUserDrawParams(registryAppEntry.windowDrawParameters, window.drawParams)
            }
            return
        case "window": {
            if (!taskRef?.appID || !plexos.Core?.registry || !window.appParams.windowKey) return
            const pointer = plexos.Core.registry.resolveIndex(taskRef.appID)
            const registryAppEntry = File.at(`/plexos/reg/applications.proxy`).data[pointer.bucket][pointer.name]
            if (!registryAppEntry.windowDrawParameters) registryAppEntry.windowDrawParameters = {}
            if (!registryAppEntry.windowDrawParameters.windows) registryAppEntry.windowDrawParameters.windows = {}
            const key = window.appParams.windowKey
            if (!registryAppEntry.windowDrawParameters.windows[key]) registryAppEntry.windowDrawParameters.windows[key] = {}
            writeUserDrawParams(registryAppEntry.windowDrawParameters.windows[key], {
                posX: window.drawParams.posX,
                posY: window.drawParams.posY,
            })
            return
        }
        case "file":
            if (!filePath) return
            {
                const fileAppEntry = File.at(`/plexos/reg/files.proxy`).data[filePath].applications[appname]
                const stored = fileAppEntry.windowDrawParameters
                    ? ProxyFile.unwrapProxy(fileAppEntry.windowDrawParameters)
                    : null
                if (!stored || isLegacyDrawParams(stored)) fileAppEntry.windowDrawParameters = {}
                writeUserDrawParams(fileAppEntry.windowDrawParameters, window.drawParams)
            }
            return
    }
}