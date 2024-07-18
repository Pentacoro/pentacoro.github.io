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
system.init = {}
system.init.setVertex = function (address) {
    plexos.vtx = File.at(address)
    let promiseInit = new Promise(async () => {
        await jsc.runLauncher("./apps/filesystem_desktop/desktop_lau.js",{addr:address})
    })
    promiseInit.then( () => {
        Task.openInstance("Desktop").mem.grid.evaluateIconGrid()
        Task.openInstance("Desktop").mem.renderIcons()
    })
}

function storageAvailable(type) {
    let storage
    try {
        storage = window[type]
        let x = '__storage_test__'
        storage.setItem(x, x)
        storage.removeItem(x)
        return true
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0)
    }
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

function recreateFiles(dir, newDir) {
    for (file of Object.values(dir.cont)) {
        let Type = null 
        let Skey = null

        switch (file.conf.type) {
            case "Directory":
                Type = Directory
                Skey = "cont"
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
        newDir.new(Type,file.name,null,file.conf,file[Skey])
        let newFile = newDir.cont[file.name]

        //recreate icon object
        let oldIcon = newFile.conf.icon
        oldIcon.exte = newFile.exte
        newFile.conf.icon = new Icon (oldIcon)

        if (Type === Directory) {
            newFile.cont = {}
            recreateFiles(dir.cont[file.name], newFile)
        }
    }
}

function defineCore(){
    
    if (storageAvailable('localStorage')) {
        
        // Yippee! We can use localStorage awesomeness
        window.addEventListener("keydown", e => {
            if (e.key === "," && e.ctrlKey) {  
                e.preventDefault()
                window.localStorage.core = JSON.stringify(core)
                console.log("Saved to localStorage")
            } 
        })
        window.addEventListener("keydown", e => {
            if (e.key === "." && e.ctrlKey) {  
                e.preventDefault()
                delete window.localStorage.core
                console.log("Cleared localStorage")
            } 
        })
        window.addEventListener("keydown", e => {
            if (e.key === "s" && e.ctrlKey) {  
                e.preventDefault()
                console.log("Downloading Core JSON")
                downloadCoreJSON()
            } 
        })
        window.addEventListener("keyrelease", e => {
            if (e.ctrlKey) window.onkeydown = null
        })
        
        if(window.localStorage.getItem("core")) {
            let jsonCore = JSON.parse(window.localStorage.core)
            let newCore  = new Directory(
                {
                    name : "core",
                    conf : new Configuration (
                    {
                        icon : new Icon(
                            {
                                imag : "assets/svg/desktopIcons/vertexPH.svg", 
                                name : "core", 
                                apps : "dir", 
                                stat : 0  
                            }
                        ),
                        from : "",
                        type : "Directory",
                        vert : true,
                        plex : true,
                        move : false
                    })
                }
            )
    
            recreateFiles(jsonCore, newCore)
        
            return newCore
        } else {
            let core = new Directory(
                {
                    name : "core",
                    conf : new Configuration (
                    {
                        icon : new Icon ({imag:"assets/svg/desktopIcons/vertexPH.svg", name:"core", type:"Directory", stat:0}),
                        from : "",
                        type : "Directory",
                        vert : true,
                        move : false
                    })
                }
            )
    
            core.new   
            (
                Directory,
                "vertex",  
                null,
                new Configuration ({
                    icon : new Icon ({imag:"assets/svg/desktopIcons/vertexPH.svg", name:"vertex", type:"Directory", stat:0}),
                    from : "",
                    type : "Directory",
                    vert : true,
                    move : false
                })
            )
            core.new   
            (
                Directory,
                "trash",
                null,
                new Configuration ({
                    icon : new Icon ({imag:"assets/svg/desktopIcons/trashPH.svg", name:"trash", type:"Directory", stat:0}),
                    from : "",
                    type : "Directory",
                    plex : true,
                    move : false
                })
            )
            core.new   
            (
                Directory,
                "stash",
                null,
                new Configuration ({
                    icon : new Icon ({imag:"assets/svg/desktopIcons/stashPH.svg", name:"stash", type:"Directory", stat:0}),
                    from : "",
                    type : "Directory",
                    plex : true,
                    move : false
                })
            )
            core.new   
            (
                Directory,
                "config",
                null,
                new Configuration ({
                    icon : new Icon ({imag:"assets/svg/desktopIcons/systemPH.svg", name:"config", type:"Directory", stat:0}),
                    from : "",
                    type : "Directory",
                    plex : true,
                    move : false
                })
            )
        
            core.cont["vertex"].new(Directory, "Folder 1")
            core.cont["vertex"].new(Directory, "Folder 2")
            core.cont["vertex"].new(Directory, "Folder 3")
        
            core.cont["vertex"].cont["Folder 1"].new(Directory, "uwu")
            core.cont["vertex"].cont["Folder 1"].new(Directory, "unu")
            core.cont["vertex"].cont["Folder 1"].new(Directory, "owo")
        
            core.cont["vertex"].cont["Folder 1"].cont["owo"].new(Directory, "rawr")

            return core
        }
    }
        else {
        // Too bad, no localStorage for us
    }
}