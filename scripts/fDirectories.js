class Configuration {
    constructor(p){
        this.type = p.type
        this.addr = p.addr || ""
        this.from = p.from || ""
        this.exte = (p.exte!=undefined) ? p.exte : (p.type==="Directory") ? "dir" : ""
        this.icon = (p.icon!=undefined) ? p.icon : null
        this.move = (p.move!=undefined) ? p.move : true
        this.vert = (p.vert!=undefined) ? p.vert : false
        this.plex = (p.plex!=undefined) ? p.plex : false
    }
}

class Directory extends File {
    static coreTemplate(){ 
        return new Directory(
        {
            name : "core",
            cfg : new Configuration (
            {
                icon : new Icon ({imag:"plexos/res/images/svg/desktopIcons/vertexPH.svg", name:"core", type:"Directory", stat:0}),
                from : "",
                type : "Directory",
                vert : true,
                move : false
            })
        })
    }
    cfg = {}
    dir = {}
    constructor(p) {
        super()
        this.name = p.name
        this.cfg = p.cfg || this.cfg
        this.dir = p.dir || this.dir
    }

    new
    (   Type, 
        childName, 
        childIcon = null, 
        childConf = null, 
        childCont = null,
    ) {
        let parent = this

        let defaults = File.typeDefaults(Type)
        let iconImag = defaults.iconImag
        let confType = defaults.confType
        let skeyName = defaults.skeyName

        childName = childName + (((confType!="Directory") && !childName.includes(".")) ? "." + childName.match(/(?:.(?<!\.))+$/s)[0] : "")

        if (childConf) { 
            //if conf argument passed use it
            this.dir[childName] = new Type({name : childName, cfg : (new Configuration (childConf))})
        } else { 
            //if no conf argument passed, create default filetype
            this.dir[childName] = new Type
            (
                {
                    name : childName,
                    cfg : new Configuration (
                    {
                        from : (parent===core) ? "" : "" + parent.cfg["from"] + "/" + parent.name,
                        type : confType,
                        move : true,
                        exte : (confType=="Directory") ? "dir" : childName.match(/(?:.(?<!\.))+$/s)[0],
                        icon : childIcon || new Icon (
                                                {
                                                    imag : iconImag, 
                                                    name : childName, 
                                                    type : confType, 
                                                    exte : childName.match(/(?:.(?<!\.))+$/s)[0],
                                                    stat : 0  
                                                }
                                            ),
                    })
                }
            )
        }
        this.dir[childName].cfg.addr = this.dir[childName].cfg["from"] + "/" + childName
        this.dir[childName].cfg["icon"].file = this.dir[childName].cfg["from"] + "/" + childName

        if (childCont) {
            this.dir[childName][skeyName] = childCont
        }

        try {
            parent.checkCont()
        } catch (e) {
            console.log(e)
        }

        return this.dir[childName]
    }

    checkCont(){ //this function swaps default dir icons whether it contains files or not
        if (Object.keys(this.dir).length > 0 && this.cfg.icon.imag == File.typeDefaults(Directory).iconImag) {
            this.cfg.icon.imag = File.typeDefaults(Directory).iconImag.replace("DIR", "DIRc")
        } else if (Object.keys(this.dir).length == 0 && this.cfg.icon.imag == File.typeDefaults(Directory).iconImag.replace("DIR", "DIRc")) {
            this.cfg.icon.imag = File.typeDefaults(Directory).iconImag
        }
    }

    static isOpen = function (addr) {
        for (task of plexos.Tasks) {
            if (task.apps === "exp" && task.mem.address === addr) return true
        }
        return false
    }
}