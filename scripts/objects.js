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
    meta = {
        title : null,
        app  : null,
        type : null,
        tags : null,
        file : null,
        stream : null,
        screen : null,
        marquee : null,
        preview : null,
        download : null,
        reference : null,
        description : null,
    }
    constructor(p) {
        super()
        this.name = p.name
        this.conf = p.conf

        this.meta.title         = p.name
        this.meta.app           = p.meta?.app            || this.meta.app
        this.meta.type          = p.meta?.type           || this.meta.type
        this.meta.tags          = p.meta?.tags           || this.meta.tags
        this.meta.file          = p.meta?.file           || this.meta.file
        this.meta.stream        = p.meta?.stream         || this.meta.stream
        this.meta.screen        = p.meta?.screen         || this.meta.screen
        this.meta.marquee       = p.meta?.marquee        || this.meta.marquee
        this.meta.preview       = p.meta?.preview        || this.meta.preview
        this.meta.download      = p.meta?.download       || this.meta.download
        this.meta.reference     = p.meta?.reference      || this.meta.reference
        this.meta.description   = p.meta?.description    || this.meta.description
    }
}

class Executable extends File {
    lurl = ""
    constructor(p) {
        super()
        this.name = p.name
        this.conf = p.conf
        this.lurl = p.lurl || this.lurl
    }
}

class JSobject extends File {
    data = {}
    constructor(p) {
        super()
        this.name = p.name
        this.conf = p.conf
        this.data = p.data || this.data
    }
}

class Text extends File {
    data = {}
    constructor(p) {
        super()
        this.name = p.name
        this.conf = p.conf
        this.data = p.data || ""
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
            defaults.skeyName = "cont"
            break
        case Executable:
            defaults.iconImag = "assets/svg/desktopIcons/defaultLAU.svg"
            defaults.confType = "lau"
            defaults.skeyName = "lurl"
            break 
        case Metafile: 
            defaults.iconImag = "assets/svg/desktopIcons/defaultMSF.svg"
            defaults.confType = "msf"
            defaults.skeyName = "meta"
            break
        case JSobject:
            defaults.iconImag = "assets/svg/desktopIcons/defaultOBJ.svg"
            defaults.confType = "obj"
            defaults.skeyName = "data"
            break 
        case Text:
            defaults.iconImag = "assets/svg/desktopIcons/defaultTXT.svg"
            defaults.confType = "txt"
            defaults.skeyName = "data"
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