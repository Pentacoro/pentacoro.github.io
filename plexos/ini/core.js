import {plexos} from "./system.js"

import Task from "../lib/classes/system/task.js"
import EventBus from "../lib/classes/system/eventbus.js"
import WorkerPool from "../lib/classes/system/workerpool.js"
import File from "../lib/classes/files/file.js"
import Directory from "../lib/classes/files/directory.js"
import Icon from "../lib/classes/interface/icon.js"
import {runLauncher, getValue, ajaxReturn, storageAvailable} from "../lib/functions/dll.js"
import initialize from "./init.js"

let System = new Task(
    {
		name : "System",
		instantiable : false,
		onEnd : null,
		node : null,
		from : "System"
	}
)

System.mem.lau = {}
System.mem.var.dragging = false
System.mem.var.shSelect = true
System.mem.focused = null
System.bus = new EventBus()
System.ini = {}
System.ini.setVertex = function (address) {
    plexos.vtx = File.at(address)
    let promiseInit = new Promise(async () => {
        await runLauncher("./plexos/app/sys/Theme Manager/themeManager.lau.js")
        await runLauncher("./plexos/app/sys/Desktop/desktop.lau.js",{addr:address})
    })
    promiseInit.then( () => {
        Task.get("Desktop").mem.grid.evaluateIconGrid()
        Task.get("Desktop").mem.renderIcons()
    })
}
System.ini.run = function () {
    initialize()
}
System.ini.recreateFiles = function (dir, newDir) {
    for (let file of Object.values(dir.dir)) {
        let Type = null 
        let Skey = null

        switch (file.cfg.type) {
            case "Directory":
                Type = "Directory"
                Skey = "dir"
                break
            case "Metafile":
                Type = "Metafile"
                Skey = "meta"
                break
            case "JsString":
                Type = "JsString"
                Skey = "data"
                break 
            default:
                Type = "JsString"
                Skey = "data"
                break 
        }

        //recreate file object
        newDir.new(Type,file.name,null,file.cfg,file[Skey])
        let newFile = newDir.dir[file.name]

        //recreate icon object
        let oldIcon = newFile.cfg.icon
        oldIcon.exte = newFile.exte
        newFile.cfg.icon = new Icon (oldIcon)

        if (Type === "Directory") {
            newFile.dir = {}
            System.ini.recreateFiles(dir.dir[file.name], newFile)
        }
    }
}
System.ini.defineCore = function () {
    return new Promise ((resolve, reject) => {
        if (storageAvailable('localStorage')) {
        
            if(window.localStorage.getItem("core")) {
                let jsonCore = JSON.parse(window.localStorage.core)
                let newCore  = Directory.coreTemplate()
        
                System.ini.recreateFiles(jsonCore, newCore)
            
                resolve(newCore)
            } else {
                let corePromise = ajaxReturn("GET","/core.json")
                corePromise
                .then(data=>{
                    if (data.status >= 200 && data.status < 300) throw data
                    plexos.core = Directory.coreTemplate()
                    System.ini.recreateFiles(JSON.parse(data),plexos.core)
                    resolve(plexos.core)
                })
            }
        }
            else {
            // Too bad, no localStorage for us
        }
    }) 
}
plexos.System = System
plexos.core = {}
if (getValue("core")) {
    let corePromise = ajaxReturn("GET",getValue("core"))
    corePromise
    .then(data=>{
        if (data.status >= 200 && data.status < 300) throw data
        plexos.core = Directory.coreTemplate()
        System.ini.recreateFiles(JSON.parse(data),plexos.core)
        plexos.vtx = plexos.core.dir["vertex"]
        System.ini.run()
    })
    .catch(()=>{
        let corePromise = System.ini.defineCore()
        corePromise
        .then(data=>{
            plexos.core = data
            System.ini.run()
        })
    })
} else {
    let corePromise = System.ini.defineCore()
    corePromise
    .then(data=>{
        plexos.core = data
        System.ini.run()
    })
}

System.mem.downloadCoreJSON = function (exportName="core") {
    let jsonCore = JSON.parse(window.localStorage.core)
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonCore));
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}