class File {
    delete() {
        let parent = at(this.conf.from)
        let child = this

        delete parent.cont[child.name]
        parent.checkCont()
    }
    moveMe(dest) {
        
    }
    rename(rename) {
        let parent  = at(this.conf.from)
        let newAddress = "" + parent.conf.icon.file + "/" + rename
        let oldAddress = this.conf.icon.file

        this.conf.addr = newAddress
        this.conf.icon.file = newAddress

        if (this.cont) rerouteChildren(this)

        function rerouteChildren(parent) {
            for ([name, file] of Object.entries(parent.cont)) {
                file.conf.addr = file.conf.addr.replace(oldAddress, newAddress)
                file.conf.from = file.conf.from.replace(oldAddress, newAddress)
                file.conf.icon.file = file.conf.icon.file.replace(oldAddress, newAddress)
                rerouteChildren(file)
            }
        }

        renameKey(parent.cont, this.name, rename)
        parent.cont[rename].name = rename
        //
    }

    render() {
        if (at(this.conf.from) === sys.vertex) { //if is on current vertex / render on desktop
            repositionIcons([this.conf.icon],true,false)
            desktop.mem.iconArr.push(this.conf.icon)
            this.conf.icon.createNode()
        } else if (isDirOpen(this.conf.from)) { //if is on any other directory / render on explorer
            for (task of sys.taskArr) {
                if (task.apps === "exp" && task.mem.directory === this.conf.from) task.mem.createExplorerIcons([this])
            }
        }
    }

    open() {
        loadAPP(cfg.exec[this.conf.type], [this.name, this.conf.addr], system.mem.var.envfocus)
    }
}

class Metafile extends File {
    constructor(title, conf, file, preview, type, app, download = null, stream = null, screen = null, marquee = null, reference = null, description = null, tags = null) {
        super()
        this.name = title
        this.conf = conf
        this.meta = {
            title : title,
            file : file,
            stream : stream,
            screen : screen,
            marquee : marquee,
            preview : preview,
            download : download,
            reference : reference,
            description : description,
            app  : app,
            type : type,
            tags : tags,
        }
    }
}

class Executable extends File {
    constructor(name, conf, lurl = "") {
        super()
        this.name = name
        this.conf = conf
        this.lurl = lurl
    }
}

class JSobject extends File {
    constructor(name, conf, data = {}) {
        super()
        this.name = name
        this.conf = conf
        this.data = data
    }
}

function filetypeDefaults(Type) {
    let defaults = {
        iconImag : null,
        confType : null,
        skeyName : null,
    }
    
    switch (Type) {
        case Directory:
            defaults.iconImag = "assets/svg/desktopIcons/defaultDIR.svg"
            defaults.confType = "dir"
            defaults.appsExec = "exp"
            defaults.skeyName = "cont"
            break
        case Executable:
            defaults.iconImag = "assets/svg/desktopIcons/folderPlaceholder.svg"
            defaults.confType = "lau"
            defaults.appsExec = "lau"
            defaults.skeyName = "lurl"
            break 
        case Metafile: 
            defaults.iconImag = "assets/svg/desktopIcons/defaultMSF.svg"
            defaults.confType = "msf"
            defaults.appsExec = "ifr"
            defaults.skeyName = "meta"
            break
        case JSobject:
            defaults.iconImag = "assets/svg/desktopIcons/folderPlaceholder.svg"
            defaults.confType = "obj"
            defaults.appsExec = "jse"
            defaults.skeyName = "data"
            break 
    }

    return defaults
}

/*
sys.wndwArr.push(new Window ("Settings", "settingsExe", true, true, 3, 1, 300, 300, 500, 500));
sys.wndwArr.push(new Window ("Settings", "settingsExe", true, true, 3, 1, 420, 420, 500, 500));
sys.wndwArr.push(new Window ("Explorer ONE", "explorerExe", true, true, 3, 1, 420, 420, 500, 500));
sys.wndwArr.push(new Window ("Explorer TWO", "explorerExe", true, true, 3, 1, 420, 420, 500, 500));
*/

//------------------------------------------------------------------------------------------------------------//