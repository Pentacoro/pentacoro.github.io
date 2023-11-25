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
    window.addEventListener("keyrelease", e => {
        if (e.ctrlKey) window.onkeydown = null
    })
    
    if(window.localStorage.getItem("core")) {
        let jsonCore = JSON.parse(window.localStorage.core)
        let newCore  = new Directory(
            {
                name : "core",
                conf : 
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
                    type : "dir",
                    vert : true,
                    move : false
                }
            }
        )

        recreateFiles(jsonCore, newCore)

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
                    case "String":
                        Type = String
                        Skey = "data"
                        break 
                    default:
                        Type = String
                        Skey = "data"
                        break 
                }

                //recreate file object
                newDir.new(Type,file.name,null,file.conf,file[Skey])
                let newFile = newDir.cont[file.name]

                //recreate icon object
                let oldIcon = newFile.conf.icon
                newFile.conf.icon = new Icon (
                    {
                        imag : oldIcon.imag, 
                        name : oldIcon.name, 
                        apps : oldIcon.apps, 
                        stat : 0,
                        coor : oldIcon.coor
                    }
                )
                newFile.conf.icon.file = newFile.conf.addr

                if (Type === Directory) {
                    newFile.cont = {}
                    recreateFiles(dir.cont[file.name], newFile)
                }
            }
        }
    
        var core = newCore
    } else {
        var core = new Directory(
            {
                name : "core",
                conf : 
                {
                    icon : new Icon ({imag:"assets/svg/desktopIcons/vertexPH.svg", name:"core", type:"Directory", stat:0}),
                    from : "",
                    type : "Directory",
                    vert : true,
                    move : false
                }
            }
        )

        core.new   
        (
            Directory,
            "vertex",  
            null,
            {
                icon : new Icon ({imag:"assets/svg/desktopIcons/vertexPH.svg", name:"vertex", type:"Directory", stat:0}),
                from : "",
                type : "Directory",
                vert : true,
                move : false
            }
        )
        core.new   
        (
            Directory,
            "trash",
            null,
            {
                icon : new Icon ({imag:"assets/svg/desktopIcons/trashPH.svg", name:"trash", type:"Directory", stat:0}),
                from : "",
                type : "Directory",
                plex : true,
                move : false
            }
        )
        core.new   
        (
            Directory,
            "stash",
            null,
            {
                icon : new Icon ({imag:"assets/svg/desktopIcons/stashPH.svg", name:"stash", type:"Directory", stat:0}),
                from : "",
                type : "Directory",
                plex : true,
                move : false
            }
        )
        core.new   
        (
            Directory,
            "config",
            null,
            {
                icon : new Icon ({imag:"assets/svg/desktopIcons/systemPH.svg", name:"config", type:"Directory", stat:0}),
                from : "",
                type : "Directory",
                plex : true,
                move : false
            }
        )
    
        core.cont["vertex"].new(Directory, "Folder 1")
        core.cont["vertex"].new(Directory, "Folder 2")
        core.cont["vertex"].new(Directory, "Folder 3")
    
        core.cont["vertex"].cont["Folder 1"].new(Directory, "uwu")
        core.cont["vertex"].cont["Folder 1"].new(Directory, "unu")
        core.cont["vertex"].cont["Folder 1"].new(Directory, "owo")
    
        core.cont["vertex"].cont["Folder 1"].cont["owo"].new(Directory, "rawr")
    }
}
    else {
    // Too bad, no localStorage for us
}
  