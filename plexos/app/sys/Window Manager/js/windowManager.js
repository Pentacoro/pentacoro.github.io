import plexos from "/boot/plexos.js"
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
    const desktop = document.getElementById("desktopLayer")
    // Landing hides the desktop, and a hidden layer reports 0×0. Copying that
    // collapses #windowLayer on the first resize.
    if (!desktop || getComputedStyle(desktop).display === "none") return
    windowManager.node.style.width  = desktop.offsetWidth + "px"
    windowManager.node.style.height = desktop.offsetHeight + "px"
    windowManager.node.style.top  = desktop.offsetTop + "px"
    windowManager.node.style.left = desktop.offsetLeft + "px"
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

const drawKeys = ["posX", "posY", "width", "height", "maximized"]

// Just a window's size and place, leaving out anything stored beside them (like a windows bag)
function pickDraw(value) {
    const bag = value ? ProxyFile.unwrapProxy(value) : null
    if (!bag || typeof bag !== "object" || !drawKeys.some(key => key in bag)) return null
    return cloneDraw(Object.fromEntries(drawKeys.filter(key => key in bag).map(key => [key, bag[key]])))
}

// Saved draw parameters are per user, one key above them: <entry>[<user>].windowDrawParameters.
// Older cores kept them in <entry>.windowDrawParameters, either flat or under .current[<user>]. Those still
// read as a fallback until this user saves their own.
function legacyDraw(bag) {
    const old = bag ? ProxyFile.unwrapProxy(bag) : null
    if (!old || typeof old !== "object") return null
    return pickDraw(old) || pickDraw(old.current) || pickDraw(old.current?.[currentUserName()])
}

function assignDraw(bag, params) {
    for (const key of drawKeys) if (key in params) bag[key] = params[key]
}

windowManager.getInitialDrawParams = function(window) {
    const appname      = Task.id(window.task).name
    const filePath     = window.appParams.filePath
    const user         = currentUserName()

    let getRegistryAppParams = function (window) {
        const taskRef = Task.id(window.task)
        if (!taskRef?.appID || !plexos.Core?.registry) return null
        const registryAppEntry = plexos.Core.registry.getAppParams(taskRef.appID)
        return pickDraw(registryAppEntry?.[user]?.windowDrawParameters) || legacyDraw(registryAppEntry?.windowDrawParameters)
    }

    let getRegistryFileParams = function (window) {
        if (!filePath) return null
        const data = ProxyFile.unwrapProxy(File.at(`@/plexos/reg/files.proxy`).data) || {}
        const app = data[filePath]?.applications?.[appname]
        return pickDraw(app?.[user]?.windowDrawParameters) || legacyDraw(app?.windowDrawParameters)
    }
    switch (window.appParams.saveDrawParameters) {
        case "default":
        case "app" :
            return getRegistryAppParams(window)
        case "window": {
            const taskRef = Task.id(window.task)
            const key = window.appParams.windowKey
            if (!taskRef?.appID || !plexos.Core?.registry || !key) return null
            const registryAppEntry = plexos.Core.registry.getAppParams(taskRef.appID)
            const saved = pickDraw(registryAppEntry?.[user]?.windowDrawParameters?.windows?.[key])
                || legacyDraw(registryAppEntry?.windowDrawParameters?.windows?.[key])
            if (!saved) return null
            if (window.appParams.sizeDrawMethod !== "fit-content" && saved.width > 0 && saved.height > 0) {
                return { posX: saved.posX, posY: saved.posY, width: saved.width, height: saved.height, maximized: !!saved.maximized }
            }
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
    const user         = currentUserName()
    const appEntry = () => {
        const pointer = plexos.Core.registry.resolveIndex(taskRef.appID)
        return File.at(`@/plexos/reg/applications.proxy`).data[pointer.bucket][pointer.name]
    }

    // The proxy creates each missing level as it's read, so these paths can be written straight away
    switch (window.appParams.saveDrawParameters) {
        case "default":
        case "app" :
            if (!taskRef?.appID || !plexos.Core?.registry) return
            assignDraw(appEntry()[user].windowDrawParameters, window.drawParams)
            return
        case "window": {
            if (!taskRef?.appID || !plexos.Core?.registry || !window.appParams.windowKey) return
            assignDraw(appEntry()[user].windowDrawParameters.windows[window.appParams.windowKey],
                (window.appParams.sizeDrawMethod === "fit-content")
                    ? { posX: window.drawParams.posX, posY: window.drawParams.posY }
                    : window.drawParams
            )
            return
        }
        case "file":
            if (!filePath) return
            assignDraw(File.at(`@/plexos/reg/files.proxy`).data[filePath].applications[appname][user].windowDrawParameters, window.drawParams)
            return
    }
}