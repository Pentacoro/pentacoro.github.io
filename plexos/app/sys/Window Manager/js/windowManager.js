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
windowManager.getInitialDrawParams = function(window) {
    const appname      = Task.id(window.task).name
    const filePath     = window.appParams.filePath

    let getRegistryAppParams = function (window) {
        const taskRef = Task.id(window.task)
        if (!taskRef?.appID || !plexos.Core?.registry) return null
        let registryAppEntry = plexos.Core.registry.getAppParams(taskRef.appID)
        const draw = registryAppEntry?.windowDrawParameters
        if (!draw) return null
        const current = draw.current ? ProxyFile.unwrapProxy(draw.current) : null
        if (current && Object.keys(current).length) return JSON.parse(JSON.stringify(current))
        return null
    }

    let getRegistryFileParams = function (window) {
        if (!filePath) return null
        const data = ProxyFile.unwrapProxy(File.at(`/plexos/reg/files.proxy`).data) || {}
        const stored = data[filePath]?.applications?.[appname]?.windowDrawParameters
        if (!stored || typeof stored !== "object" || Object.keys(stored).length === 0) return null
        return JSON.parse(JSON.stringify(stored))
    }
    switch (window.appParams.saveDrawParameters) {
        case "default":
        case "app" :
            return getRegistryAppParams(window)
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
                registryAppEntry.windowDrawParameters.current = JSON.parse(JSON.stringify(window.drawParams))
            }
            return
        case "file":
            if (!filePath) return
            File.at(`/plexos/reg/files.proxy`).data[filePath].applications[appname].windowDrawParameters = JSON.parse(JSON.stringify(window.drawParams))
            return
    }
}