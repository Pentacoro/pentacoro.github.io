import Task from "../lib/classes/system/task.js"
import EventBus from "../lib/classes/system/eventbus.js"
import WorkerPool from "../lib/classes/system/workerpool.js"
import File from "../lib/classes/files/file.js"
import Directory from "../lib/classes/files/directory.js"
import Icon from "../lib/classes/interface/icon.js"
import dll from "../lib/functions/dll.js"
import initialize from "./init.js"

system = new Task(
    {
		name : "system",
		inst : false,
		appEnd : null,
		node : null,
		from : "sys"
	}
)

system.mem.lau = {}
system.mem.var.dragging = false
system.mem.var.shSelect = true
system.mem.var.envfocus = null
system.mem.focus = function (env) {
    if (system.mem.var.envfocus && env != system.mem.var.envfocus){
        system.mem.var.envfocus.blur()
    }
    system.mem.var.envfocus = env
    system.mem.var.envfocus.focus()
}
system.bus = new EventBus()
system.ini = {}
system.ini.setVertex = function (address) {
    plexos.vtx = File.at(address)
    let promiseInit = new Promise(async () => {
        await dll.runLauncher("./plexos/app/sys/Desktop/desktop_lau.js",{addr:address})
    })
    promiseInit.then( () => {
        Task.get("Desktop").mem.grid.evaluateIconGrid()
        Task.get("Desktop").mem.renderIcons()
    })
}
system.ini.run = function () {
    initialize()
}
system.ini.recreateFiles = function (dir, newDir) {
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
            system.ini.recreateFiles(dir.dir[file.name], newFile)
        }
    }
}
system.ini.defineCore = function () {
    return new Promise ((resolve, reject) => {
        if (dll.storageAvailable('localStorage')) {
        
            if(window.localStorage.getItem("core")) {
                let jsonCore = JSON.parse(window.localStorage.core)
                let newCore  = Directory.coreTemplate()
        
                system.ini.recreateFiles(jsonCore, newCore)
            
                resolve(newCore)
            } else {
                let corePromise = dll.ajaxReturn("GET","/core.json")
                corePromise
                .then(data=>{
                    if (data.status >= 200 && data.status < 300) throw data
                    plexos.core = Directory.coreTemplate()
                    system.ini.recreateFiles(JSON.parse(data),core)
                    resolve(core)
                })
            }
        }
            else {
            // Too bad, no localStorage for us
        }
    }) 
}

plexos.core = {}
if (dll.getValue("core")) {
    let corePromise = dll.ajaxReturn("GET",dll.getValue("core"))
    corePromise
    .then(data=>{
        if (data.status >= 200 && data.status < 300) throw data
        plexos.core = Directory.coreTemplate()
        system.ini.recreateFiles(JSON.parse(data),core)
        plexos.vtx = plexos.core.dir["vertex"]
        system.ini.run()
    })
    .catch(()=>{
        let corePromise = system.ini.defineCore()
        corePromise
        .then(data=>{
            plexos.core = data
            system.ini.run()
        })
    })
} else {
    let corePromise = system.ini.defineCore()
    corePromise
    .then(data=>{
        plexos.core = data
        system.ini.run()
    })
}

function downloadCoreJSON(exportName="core") {
    let jsonCore = JSON.parse(window.localStorage.core)
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonCore));
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}