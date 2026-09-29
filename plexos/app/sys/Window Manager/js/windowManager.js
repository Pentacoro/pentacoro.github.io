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
        const registryFile = File.at(`/plexos/reg/applications.proxy`)

        let registryAppEntry = eval(`registryFile.data.${Task.id(window.task).registryPath}`)

        if (registryAppEntry.windowDrawParameters.return().current) return JSON.parse(JSON.stringify(registryAppEntry.windowDrawParameters.return().current))
        return null
    }

    let getRegistryFileParams = function (window) {
        const registryFile = File.at(`/plexos/reg/files.proxy`)

        let registryFileEntry = registryFile.data[filePath]

        if (!ProxyFile.isEmpty(registryFileEntry.applications[appname].windowDrawParameters)) return JSON.parse(JSON.stringify(registryFileEntry.applications[appname].windowDrawParameters.return()))
        return null
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
    const registryFile = File.at(`/plexos/reg/applications.proxy`)
    const appname      = Task.id(window.task).name
    const filePath     = window.appParams.filePath

    switch (window.appParams.saveDrawParameters) {
        case "default":
        case "app" :
        let registryAppEntry = eval(`registryFile.data.${Task.id(window.task).registryPath}`)
            registryAppEntry.windowDrawParameters.current = JSON.parse(JSON.stringify(window.drawParams))
            console.log (registryAppEntry.windowDrawParameters)
            return
        case "file":
        let registryFileEntry = File.at(`/plexos/reg/files.proxy`).data[filePath]
            registryFileEntry.applications[appname].windowDrawParameters = window.drawParams
            return
    }
}