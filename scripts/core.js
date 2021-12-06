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
    window.addEventListener("keypress", e => {
        if (e.key === "+") {
            e.preventDefault()
            window.localStorage.core = JSON.stringify(core)
            console.log("rawr")
        }
    })
    window.addEventListener("keypress", e => {
        if (e.key === "-") {
            e.preventDefault()
            delete window.localStorage.core
            console.log("roar")
        }
    })
    if(window.localStorage.getItem("core")) {
        let jsonCore = JSON.parse(window.localStorage.core)
        let newCore  = new Directory ("core")
        var core     = new Directory ("core")

        recreateFiles(jsonCore, newCore)

        function recreateFiles(dir, newDir) {
            for (file of Object.values(dir.cont)) {
                let Type = null 
                let Skey = null

                switch (file.conf.type) {
                    case "dir":
                        Type = Directory
                        Skey = "cont"
                        break
                    case "msf":
                        Type = Metafile
                        Skey = "meta"
                        break
                    case "lau":
                        Type = Executable
                        Skey = "lurl"
                        break 
                    case "obj":
                        Type = JSobject 
                        Skey = "data"
                        break
                }

                //recreate file object
                newDir.new(Type,file.name,file.conf,file[Skey])
                let newFile = newDir.cont[file.name]

                //recreate icon object
                let oldIcon = newFile.conf.icon
                newFile.conf.icon = new Icon (oldIcon.imag, oldIcon.text, oldIcon.apps, oldIcon.stat, 0, 0, oldIcon.coor)
                newFile.conf.icon.file = newFile.conf.addr

                if (Type === Directory) {
                    newFile.cont = {}
                    recreateFiles(dir.cont[file.name], newFile)
                }
            }
        }
    
        core.cont = newCore.cont
    } else {
        var core = new Directory ("core")

        core.new   
        (
            Directory,
            "vertex",  
            {
                icon : new Icon ("background-image: url('assets/svg/desktopIcons/vertexPH.svg');", "vertex", "dir", 0),
                from : "",
                type : "dir",
                vert : true,
                move : false
            }
        )
        core.new   
        (
            Directory,
            "trash",  
            {
                icon : new Icon ("background-image: url('assets/svg/desktopIcons/trashPH.svg');", "trash", "dir", 0),
                from : "",
                type : "dir",
                plex : true,
                move : false
            }
        )
        core.new   
        (
            Directory,
            "stash",  
            {
                icon : new Icon ("background-image: url('assets/svg/desktopIcons/stashPH.svg');", "stash", "dir", 0),
                from : "",
                type : "dir",
                plex : true,
                move : false
            }
        )
        core.new   
        (
            Directory,
            "config",  
            {
                icon : new Icon ("background-image: url('assets/svg/desktopIcons/systemPH.svg');", "config", "dir", 0),
                from : "",
                type : "dir",
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
  