class Icon {
    stat = 0
    coor = 
    {
        px : -1,
        py : -1,
        tx : -1,
        ty : -1,
        ax : null,
        ay : null
    }
    constructor(p){
        this.stat = p.stat || this.stat
        this.coor = p.coor || this.coor

        this.file = p.file || ""
        this.imag = p.imag
        this.name = p.name
        this.type = p.type
        this.exte = p.exte || (this.type==="Directory") ? "dir" : (this.name.match(/\.(?:.(?<!\.))+$/s)!=null) ? this.name.match(/(?:.(?<!\.))+$/s)[0] : ""

        this.drop = []
    }
    clic(){
        this.node.oncontextmenu = e => openMenu(e,this)
        this.node.onmousedown = e => this.drag(e);
        this.node.ondblclick = e => File.at(this.file).open()
    }
    gray(coin){
        if ( coin ) {
            this.node.classList.add("blur")
        } else {
            this.node.classList.remove("blur")      
        }
    }
}

class File {
    static at(addr = "") {
        //string: where we'll devour addr one dir at a time as we build expression
        let string = addr
        //steps: where we'll store each of the dirs extracted from string (useless for now)
        let steps = []
        //expression: where we'll build the object reference from the core to later be eval()
        let expression = "core"
        
        //find first "/"
        let to = string.indexOf("/")
    
        iterate(to)
    
        function iterate(to){
            if (to > 0) { //if "/" is not the first char
                let nextDir = string.splice(0, to)[1] //get clean dir name
    
                string = string.splice(0, to - 1)[0] //repeat splice for return
                string = string.splice(0,1)[0] //razor out "/"
    
                steps.push(nextDir)
    
                expression += ".cont[\""+nextDir+"\"]"
    
                if (string.length > 0) {
                    to = string.indexOf("/")
                    iterate(to)
                } else { 
                    return expression 
                }
    
            } else if (to == 0) { //if "/" is the first char
                string = string.splice(0,1)[0] //razor out "/"
                if (string.length > 0) {
                    to = string.indexOf("/")
                    iterate(to)
                } else { 
                    return expression 
                }
    
            } else if (to < 0){ //if there's no "/" char
                if (string.length > 0) {
                    expression += ".cont[\""+string+"\"]"
                    steps.push(string)
                    return expression
                } else if (string === ""){ 
                    return expression 
                }
    
            }
        }
    
        return eval(expression)
    }

    static typeDefaults(Type) {
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
            case JsString:
                defaults.iconImag = "assets/svg/desktopIcons/defaultTXT.svg"
                defaults.confType = "JsString"
                defaults.skeyName = "data"
        }
    
        return defaults
    }

    delete() {
        let parent = File.at(this.conf.from)
        let child = this

        delete parent.cont[child.name]
        parent.checkCont()
    }
    move(dest) {
        
    }
    rename(rename) {
        let parent  = File.at(this.conf.from)
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

        jsc.renameKey(parent.cont, this.name, rename)
        let renamedFile = parent.cont[rename]
        let extension = (this.conf.type==="Directory") ? "dir" : (rename.match(/\.(?:.(?<!\.))+$/s)!=null) ? rename.match(/(?:.(?<!\.))+$/s)[0] : ""
        renamedFile.name = rename
        renamedFile.conf.exte = extension
        renamedFile.conf.icon.exte = extension
    }

    render(taskid=null) {
        if (File.at(this.conf.from) === plexos.vtx) { //if is on current vertex / render on desktop
            if  (Task.openInstance("Desktop")?.mem.getIcon(this.name)) Task.openInstance("Desktop")?.mem.getIcon(this.name).poseNode()
            else Task.openInstance("Desktop")?.mem.createDesktopIcons([this])
        }
        if (taskid) { //if is on any other directory / render on explorer
            Task.id(taskid).mem.createExplorerIcons([this])
        }
    }

    open() {
        jsc.runLauncher(cfg.apps[this.conf.exte], {name:this.name, addr:this.conf.addr}, system.mem.var.envfocus)
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

class JsString extends File {
    data = {}
    constructor(p) {
        super()
        this.name = p.name
        this.conf = p.conf
        this.data = p.data || ""
    }
}