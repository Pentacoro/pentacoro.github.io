import plexos from "./system.js"

import Task from "../lib/classes/system/task.js"
import EventBus from "../lib/classes/system/eventbus.js"
import WorkerPool from "../lib/classes/system/workerpool.js"
import File from "../lib/classes/filesystem/file.js"
import ProxyFile from "../lib/classes/filesystem/proxy.js"
import DirectoryFile from "../lib/classes/filesystem/directory.js"
import Icon from "../lib/classes/interface/icon.js"
import {runLauncher, getValue, ajaxReturn, storageAvailable} from "../lib/functions/dll.js"
import ChangeLog from "../lib/classes/system/changeLog.js"
import initialize from "./init.js"

// SYSTEM TASK
const sys = new Task(
    {
		name : "System",
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
sys.mem.cfg = plexos.Config
sys.mem.downloadCoreJSON = function (exportName="core") { // Ctrl+S: serialized tree, not the live Core Task
    let jsonCore = File.serializeNode(plexos.Core.file)
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonCore))
    let downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href",     dataStr)
    downloadAnchorNode.setAttribute("download", exportName + ".json")
    document.body.appendChild(downloadAnchorNode) // required for firefox
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
}
sys.bus = new EventBus()
sys.ini = {}
sys.ini.openDesktop = async function (address) {
    await runLauncher("./plexos/app/sys/Theme Manager/themeManager.ls")
    await runLauncher("./plexos/app/sys/Window Manager/windowManager.ls")
    await runLauncher("./plexos/app/sys/Desktop/desktop.ls", {path:address})
    let desktop = Task.get("Desktop")
    if (desktop?.mem?.grid?.evaluateIconGrid) {
        desktop.mem.grid.evaluateIconGrid()
        desktop.mem.renderIcons()
    }
}
sys.ini.run = async function () {
    root.mem.booting = true
    await plexos.Core.ini.getPlexosDB()
    plexos.Core.file = await plexos.Core.ini.defineCore()
    initialize()
}

// CORE TASK
const root = new Task(
    {
		name : "Core",
		onEnd : null,
		node : null,
		from : "System"
	}
)
plexos.Core = root
root.file = {}
root.changeLog = new ChangeLog()
root.mem.explorerUndoIndex = -1
root.mem.classCompilers = {
    "ProxyFile": (file) => {
        return ProxyFile.unwrapProxy(file.data)
    }
}
root.ini = {}
root.ini.recreateFiles = async function (dir, newDir) {
    for (let file of Object.values(dir.dir)) {
        let Type = null 
        let Skey = "data"

        switch (file.cfg.class) {
            case "DirectoryFile":
                Type = "DirectoryFile"
                Skey = "dir"
                break
            case "MetaFile":
                Type = "MetaFile"
                Skey = "meta"
                break
            case "StringFile":
                Type = "StringFile"
                break 
            case "ProxyFile":
                Type = "ProxyFile"
                break 
            default:
                Type = "StringFile"
                Skey = "data"
                break 
        }

        //recreate file object
        await File.create({
            path: newDir.cfg.path,
            Type,
            name: file.name,
            conf: file.cfg,
            content: file[Skey],
        })
        let newFile = newDir.dir[file.name]
        
        //recreate icon object
        let oldIcon = newFile.cfg.icon
        oldIcon.exte = newFile.cfg.exte
        newFile.cfg.icon = new Icon (oldIcon)

        if (Type === "DirectoryFile") {
            newFile.dir = {}
            await root.ini.recreateFiles(dir.dir[file.name], newFile)
        }
    }
}
root.ini.getPlexosDB = async function () {
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

root.ini.defineCore = function () {
    return new Promise (async (resolve, reject) => {
        let lastCoreName = await sys.user.config.lastOpenedCore

        //If there's a core url specified in view url
        if (getValue("core")) {
            let core = await root.ini.defineCoreByURL(getValue("core"))
            console.log("Core set by URL")
            //console.log(core)
            resolve(core)
        }
        //If there's no last opened core, retrieve origin's core.json file
        if (lastCoreName === null) {
            let core = await root.ini.defineCoreBySRC()
            console.log("Core set by SRC")
            //console.log(core)
            resolve(core)
        }
        //Retrieve last opened core
        if (lastCoreName) {
            let core = await root.ini.defineCoreByDB(lastCoreName)
            sys.user.config.lastOpenedCore = core.name
            console.log("Core set by DB")
            //console.log(core)
            resolve(core)
        }
    }) 
}
root.ini.defineCoreByURL = async function(URL) {
    return new Promise (async (resolve, reject) => {
        let corePromise = ajaxReturn("GET",URL)
        corePromise
        .then(async data=>{
            if (data.status >= 200 && data.status < 300) throw data
            let newCore = DirectoryFile.coreTemplate()
            root.file = newCore
            await root.ini.recreateFiles(JSON.parse(data),newCore)
            resolve(newCore)
        })
        .catch(e=>{
            throw e
        })
    })
}
root.ini.defineCoreBySRC = async function () {
    return new Promise (async (resolve, reject) => {
        let corePromise = ajaxReturn("GET","/core.json")
        corePromise
        .then(async data=>{
            if (data.status >= 200 && data.status < 300) throw data
            let newCore = DirectoryFile.coreTemplate()
            root.file = newCore
            await root.ini.recreateFiles(JSON.parse(data),newCore)
            resolve(newCore)
        })
    })
}
root.ini.defineCoreByDB = async function(lastCoreName) {
    let dbCore = sys.user.localCores.filter(core=>core.name === lastCoreName)[0]
    let newCore = DirectoryFile.coreTemplate()
    root.file = newCore
    await root.ini.recreateFiles(dbCore,newCore)
    plexos.System.user.config.lastOpenedCore = newCore.name
    return newCore
}
root.mem.saveCore = async function () {
    await plexos.db.saveCore(root.file)
}

sys.ini.run()