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
        this.node.oncontextmenu = e => ContextMenu.open(e,this)
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
    
                expression += ".dir[\""+nextDir+"\"]"
    
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
                    expression += ".dir[\""+string+"\"]"
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
                defaults.iconImag = "plexos/res/images/svg/desktopIcons/defaultDIR.svg"
                defaults.confType = "Directory"
                defaults.skeyName = "cont"
                break
            case Metafile: 
                defaults.iconImag = "plexos/res/images/svg/desktopIcons/defaultMSF.svg"
                defaults.confType = "Metafile"
                defaults.skeyName = "meta"
                break
            case JsString:
                defaults.iconImag = "plexos/res/images/svg/desktopIcons/defaultTXT.svg"
                defaults.confType = "JsString"
                defaults.skeyName = "data"
        }
    
        return defaults
    }

    static validName = function (string) {
        if (
            string.slice(-1) != "." &&
            string != "" &&
            string.match(/[\/"]/g) === null
        ) {return true}
        return false
    }

    static nameAvailable = function (text, _this, from){
        for ([name, file] of Object.entries(from.dir)){
            if (file.name == text && file.cfg.icon != _this) {
                return true
            }
        }
        return false
    }

    delete() {
        let parent = File.at(this.cfg.from)
        let child = this

        delete parent.dir[child.name]
        parent.checkCont()
    }
    move(dest) {
        
    }
    rename(rename) {
        let parent  = File.at(this.cfg.from)
        let newAddress = "" + parent.cfg.icon.file + "/" + rename
        let oldAddress = this.cfg.icon.file

        this.cfg.addr = newAddress
        this.cfg.icon.file = newAddress

        if (this.dir) rerouteChildren(this)

        function rerouteChildren(parent) {
            for ([name, file] of Object.entries(parent.dir)) {
                file.cfg.addr = file.cfg.addr.replace(oldAddress, newAddress)
                file.cfg.from = file.cfg.from.replace(oldAddress, newAddress)
                file.cfg.icon.file = file.cfg.icon.file.replace(oldAddress, newAddress)
                rerouteChildren(file)
            }
        }

        dll.renameKey(parent.dir, this.name, rename)
        let renamedFile = parent.dir[rename]
        let extension = (this.cfg.type==="Directory") ? "dir" : (rename.match(/\.(?:.(?<!\.))+$/s)!=null) ? rename.match(/(?:.(?<!\.))+$/s)[0] : ""
        renamedFile.name = rename
        renamedFile.cfg.exte = extension
        renamedFile.cfg.icon.exte = extension
    }

    render(taskid=null) {
        if (File.at(this.cfg.from) === plexos.vtx) { //if is on current vertex / render on desktop
            if  (Task.openInstance("Desktop")?.mem.getIcon(this.name)) Task.openInstance("Desktop")?.mem.getIcon(this.name).poseNode()
            else Task.openInstance("Desktop")?.mem.createDesktopIcons([this])
        }
        if (taskid) { //if is on any other directory / render on explorer
            Task.id(taskid).mem.createExplorerIcons([this])
        }
    }

    open() {
        dll.runLauncher(cfg.apps[this.cfg.exte], {name:this.name, addr:this.cfg.addr}, system.mem.var.envfocus)
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
        this.cfg = p.cfg

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
        this.cfg = p.cfg
        this.data = p.data || ""
    }
}