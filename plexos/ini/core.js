import {plexos} from "./system.js"

import Task from "../lib/classes/system/task.js"
import EventBus from "../lib/classes/system/eventbus.js"
import WorkerPool from "../lib/classes/system/workerpool.js"
import File from "../lib/classes/filesystem/file.js"
import Directory from "../lib/classes/filesystem/directory.js"
import Icon from "../lib/classes/interface/icon.js"
import {runLauncher, getValue, ajaxReturn, storageAvailable} from "../lib/functions/dll.js"
import initialize from "./init.js"

let sys = new Task(
    {
		name : "System",
		instantiable : false,
		onEnd : null,
		node : null,
		from : "System"
	}
)
plexos.System = sys
sys.mem.lau = {}
sys.mem.var.dragging = false
sys.mem.var.shSelect = true
sys.mem.focused = null
sys.mem.cfg = plexos.cfg
sys.mem.downloadCoreJSON = function (exportName="core") {
    let jsonCore = sys.core
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonCore))
    let downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href",     dataStr)
    downloadAnchorNode.setAttribute("download", exportName + ".json")
    document.body.appendChild(downloadAnchorNode) // required for firefox
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
}
sys.bus = new EventBus()
sys.core= {}
sys.ini = {}
sys.ini.openDesktop = function (address) {
    let promiseInit = new Promise(async () => {
        await runLauncher("./plexos/app/sys/Theme Manager/themeManager.lau.js")
        await runLauncher("./plexos/app/sys/Desktop/desktop.lau.js",{path:address})
    })
    promiseInit.then( () => {
        Task.get("Desktop").mem.grid.evaluateIconGrid()
        Task.get("Desktop").mem.renderIcons()
    })
}
sys.ini.recreateFiles = function (dir, newDir) {
    for (let file of Object.values(dir.dir)) {
        let Type = null 
        let Skey = null

        switch (file.cfg.class) {
            case "Directory":
                Type = "Directory"
                Skey = "dir"
                break
            case "Metafile":
                Type = "Metafile"
                Skey = "meta"
                break
            case "String":
                Type = "String"
                Skey = "data"
                break 
            case "Proxy":
                Type = "Proxy"
                Skey = "data"
                break 
            default:
                Type = "String"
                Skey = "data"
                break 
        }

        //recreate file object
        newDir.new(Type,file.name,null,file.cfg,file[Skey],false)
        let newFile = newDir.dir[file.name]

        //recreate icon object
        let oldIcon = newFile.cfg.icon
        oldIcon.exte = newFile.exte
        newFile.cfg.icon = new Icon (oldIcon)

        if (Type === "Directory") {
            newFile.dir = {}
            sys.ini.recreateFiles(dir.dir[file.name], newFile)
        }
    }
}
sys.ini.getPlexosDB = async function () {
    //get config
    plexos.Config = await new Promise ((resolve, reject) => {
        plexos.db.getConfig()
        .then(config => {
            resolve(config)
        })
        .catch(async e => {
            console.log(e)
            await plexos.db.setConfig({
                defaultUser: "User",
                lastUserLog: "User",
                bootRoutine: "default",
                theme: "default",
            })
            let config = await plexos.db.getConfig()
            resolve(config)
        })
    }) 
    console.log(plexos.Config)
    //get user
    sys.user   = await new Promise ((resolve, reject) => {
        plexos.db.getUser(plexos.Config.lastUserLog)
        .then(async user => {
            resolve(user)
        })
        .catch(async e => {
            console.log(e)
            await plexos.db.saveUser({
                name: "User",
                localCores: [],
                remoteCores: {},
                config: {
                    lastOpenedCore: null,
                    profileImage: null,
                    password: null,
                }
            })
            let user = await plexos.db.getUser(plexos.Config.lastUserLog)
            resolve(user)
        })
    })
    console.log(sys.user)
}

sys.ini.defineCore = function () {
    return new Promise (async (resolve, reject) => {
        let lastCoreName = await sys.user.config.lastOpenedCore

        //If there's a core url specified in view url
        if (getValue("core")) {
            let core =await  sys.ini.defineCoreByURL(getValue("core"))
            console.log("Core set by URL")
            //console.log(core)
            resolve(core)
        }
        //If there's no last opened core, retrieve origin's core.json file
        if (lastCoreName === null) {
            let core = await sys.ini.defineCoreBySRC()
            console.log("Core set by SRC")
            //console.log(core)
            resolve(core)
        }
        //Retrieve last opened core
        if (lastCoreName) {
            let core = await sys.ini.defineCoreByDB(lastCoreName)
            sys.user.config.lastOpenedCore = core.name
            console.log("Core set by DB")
            //console.log(core)
            resolve(core)
        }
    }) 
}
sys.ini.defineCoreByURL = async function(URL) {
    return new Promise (async (resolve, reject) => {
        let corePromise = ajaxReturn("GET",URL)
        corePromise
        .then(data=>{
            if (data.status >= 200 && data.status < 300) throw data
            let newCore = Directory.coreTemplate()
            sys.ini.recreateFiles(JSON.parse(data),newCore)
            resolve(newCore)
        })
        .catch(e=>{
            throw e
        })
    })
}
sys.ini.defineCoreBySRC = async function () {
    return new Promise (async (resolve, reject) => {
        let corePromise = ajaxReturn("GET","/core.json")
        corePromise
        .then(data=>{
            if (data.status >= 200 && data.status < 300) throw data
            let newCore = Directory.coreTemplate()
            sys.ini.recreateFiles(JSON.parse(data),newCore)
            resolve(newCore)
        })
    })
}
sys.ini.defineCoreByDB = async function(lastCoreName) {
    let dbCore = sys.user.localCores.filter(core=>core.name === lastCoreName)[0]
    let newCore = Directory.coreTemplate()
    sys.ini.recreateFiles(dbCore,newCore)
    plexos.System.user.config.lastOpenedCore = newCore.name
    return newCore
}
sys.ini.run = async function () {
    await sys.ini.getPlexosDB()
    sys.core = await sys.ini.defineCore()
    initialize()
}

let windowManager = new Task(
    {
		name : "Window Manager",
		instantiable : false,
		onEnd : null,
		node : document.getElementById("windowLayer"),
		from : "System"
	}
)
windowManager.mem.windows = []
windowManager.on("desktop-open", ()=>{
    windowManager.node.style.width  = document.getElementById("desktopLayer").offsetWidth + "px"
    windowManager.node.style.height = document.getElementById("desktopLayer").offsetHeight + "px"
    windowManager.node.style.top  = document.getElementById("desktopLayer").offsetTop + "px"
    windowManager.node.style.left = document.getElementById("desktopLayer").offsetLeft + "px"
})
windowManager.on("viewport-resize", ()=>{
    windowManager.node.style.width  = document.getElementById("desktopLayer").offsetWidth + "px"
    windowManager.node.style.height = document.getElementById("desktopLayer").offsetHeight + "px"
    windowManager.node.style.top  = document.getElementById("desktopLayer").offsetTop + "px"
    windowManager.node.style.left = document.getElementById("desktopLayer").offsetLeft + "px"
})
windowManager.on("window-stylized", window => {
    if (window && window.appParams.sizeDrawMethod !== "fit-content") {
        if (window.drawParams.posX===0||window.drawParams.posY===0) {
            let drawPos = window.definePosition()
            window.drawParams.posX = drawPos.posX
            window.drawParams.posY = drawPos.posY
        }

        window.poseNode()
        window.node.classList.remove("building")
}
windowManager.on("window-scripted", window => {
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
})
})
windowManager.getInitialDrawParams = function(window) {
    const appname   = Task.id(window.task).name

    let getRegistryAppParams = function (window) {
        let registryAppEntry = File.at(`/plexos/reg/applications.proxy`).data[appname]
        if (registryAppEntry.windowDrawParameters === undefined) {
            registryAppEntry.windowDrawParameters = null
        }
        return JSON.parse(JSON.stringify(registryAppEntry.windowDrawParameters))
    }

    let getRegistryFileParams = function (window) {
        let registryFileEntry = File.at(`/plexos/reg/files.proxy`).data[window.appParams.filePath]
        if (registryFileEntry === undefined) {
            File.at(`/plexos/reg/files.proxy`).data[window.appParams.filePath] = {}
            registryFileEntry = File.at(`/plexos/reg/files.proxy`).data[window.appParams.filePath]
            registryFileEntry.applications = {}
            registryFileEntry.applications[appname] = {}
            registryFileEntry.applications[appname].windowDrawParameters = null
        } 
        if (registryFileEntry.applications === undefined) {
            registryFileEntry.applications = {}
            registryFileEntry.applications[appname] = {}
            registryFileEntry.applications[appname].windowDrawParameters = null
        } 
        if (registryFileEntry.applications[appname] === undefined) {
            registryFileEntry.applications[appname] = {}
            registryFileEntry.applications[appname].windowDrawParameters = null
        } 
        if (registryFileEntry.applications[appname].windowDrawParameters === undefined) {
            registryFileEntry.applications[appname].windowDrawParameters = null
        } 
        return JSON.parse(JSON.stringify(registryFileEntry.applications[appname].windowDrawParameters))
    }
    switch (window.appParams.saveDrawParameters) {
        case "default":
        case "app":
            return getRegistryAppParams(window)
        case "file":
        if (window.appParams.filePath) {
            return getRegistryFileParams(window)
        } else {
            return getRegistryAppParams(window) 
        }
    }
}
windowManager.setInitialDrawParams = function(window) {
    const appname   = Task.id(window.task).name
    switch (window.appParams.saveDrawParameters) {
        case "default":
        case "app":
        let registryAppEntry = File.at(`/plexos/reg/applications.proxy`).data[appname]
            registryAppEntry.windowDrawParameters = JSON.parse(JSON.stringify(window.drawParams))
            return

        case "file" :
        let registryFileEntry = File.at(`/plexos/reg/files.proxy`).data[window.appParams.filePath]
            registryFileEntry.applications[appname].windowDrawParameters = window.drawParams
            return
    }
}

sys.ini.run()