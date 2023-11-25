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
        parent.cont[rename].conf.exte = rename.match(/(?:.(?<!\.))+$/s)[0]
        parent.cont[rename].conf.icon.exte = rename.match(/(?:.(?<!\.))+$/s)[0]
        //
    }

    render(taskid=null) {
        if (at(this.conf.from) === sys.vertex) { //if is on current vertex / render on desktop
            this.conf.icon.createNode()
        }
        if (taskid) { //if is on any other directory / render on explorer
            system.mem.task(taskid).mem.createExplorerIcons([this])
        }
    }

    open() {
        loadAPP(cfg.apps[this.conf.exte], {name:this.name, addr:this.conf.addr}, system.mem.var.envfocus)
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

class String extends File {
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
            defaults.confType = "Directory"
            defaults.skeyName = "cont"
            break
        case Metafile: 
            defaults.iconImag = "assets/svg/desktopIcons/defaultMSF.svg"
            defaults.confType = "Metafile"
            defaults.skeyName = "meta"
            break
        case String:
            defaults.iconImag = "assets/svg/desktopIcons/defaultTXT.svg"
            defaults.confType = "String"
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