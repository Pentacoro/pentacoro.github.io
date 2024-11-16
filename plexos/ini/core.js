const system = new Task(
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
system.ini = {}
system.ini.setVertex = function (address) {
    plexos.vtx = File.at(address)
    let promiseInit = new Promise(async () => {
        await dll.runLauncher("./plexos/app/sys/Desktop/desktop_lau.js",{addr:address})
    })
    promiseInit.then( () => {
        Task.openInstance("Desktop").mem.grid.evaluateIconGrid()
        Task.openInstance("Desktop").mem.renderIcons()
    })
}
system.ini.run = function () {
    dll.remoteEval("/plexos/ini/init.js")
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

system.ini.recreateFiles = function (dir, newDir) {
    for (file of Object.values(dir.dir)) {
        let Type = null 
        let Skey = null

        switch (file.cfg.type) {
            case "Directory":
                Type = Directory
                Skey = "dir"
                break
            case "Metafile":
                Type = Metafile
                Skey = "meta"
                break
            case "JsString":
                Type = JsString
                Skey = "data"
                break 
            default:
                Type = JsString
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

        if (Type === Directory) {
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
                    core = Directory.coreTemplate()
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

if (dll.getValue("core")) {
    let corePromise = dll.ajaxReturn("GET",dll.getValue("core"))
    corePromise
    .then(data=>{
        if (data.status >= 200 && data.status < 300) throw data
        core = Directory.coreTemplate()
        system.ini.recreateFiles(JSON.parse(data),core)
        plexos.vtx = core.dir["vertex"]
        system.ini.run()
    })
    .catch(()=>{
        let corePromise = system.ini.defineCore()
        corePromise
        .then(data=>{
            core = data
            system.ini.run()
        })
    })
} else {
    let corePromise = system.ini.defineCore()
    corePromise
    .then(data=>{
        core = data
        system.ini.run()
    })
}