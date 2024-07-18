//javascript.js
//f.js
//fIcon.js
//fIconDir.js
//fDesktop.js
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
            conf : new Configuration (
            {
                icon : new Icon ({imag:"assets/svg/desktopIcons/vertexPH.svg", name:"core", type:"Directory", stat:0}),
                from : "",
                type : "Directory",
                vert : true,
                move : false
            })
        })
    }
    conf = {}
    cont = {}
    constructor(p) {
        super()
        this.name = p.name
        this.conf = p.conf || this.conf
        this.cont = p.cont || this.cont
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
            this.cont[childName] = new Type({name : childName, conf : (new Configuration (childConf))})
        } else { 
            //if no conf argument passed, create default filetype
            this.cont[childName] = new Type
            (
                {
                    name : childName,
                    conf : new Configuration (
                    {
                        from : (parent===core) ? "" : "" + parent.conf["from"] + "/" + parent.name,
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
        this.cont[childName].conf.addr = this.cont[childName].conf["from"] + "/" + childName
        this.cont[childName].conf["icon"].file = this.cont[childName].conf["from"] + "/" + childName

        if (childCont) {
            this.cont[childName][skeyName] = childCont
        }

        try {
            parent.checkCont()
        } catch (e) {
            console.log(e)
        }

        return this.cont[childName]
    }

    checkCont(){ //this function swaps default dir icons whether it contains files or not
        if (Object.keys(this.cont).length > 0 && this.conf.icon.imag == File.typeDefaults(Directory).iconImag) {
            this.conf.icon.imag = File.typeDefaults(Directory).iconImag.replace("DIR", "DIRc")
        } else if (Object.keys(this.cont).length == 0 && this.conf.icon.imag == File.typeDefaults(Directory).iconImag.replace("DIR", "DIRc")) {
            this.conf.icon.imag = File.typeDefaults(Directory).iconImag
        }
    }
}

//--------------------------------------------------------------------------|

jsc.isDirOpen = function (addr) {
    for (task of plexos.Tasks) {
        if (task.apps === "exp" && task.mem.address === addr) return true
    }
    return false
}

jsc.validIconName = function (string) {
    if (
        string.slice(-1) != "." &&
        string != "" &&
        string.match(/[\/"]/g) === null
    ) {return true}
    return false
}

jsc.iconNameExists = function (text, _this, from){
    for ([name, file] of Object.entries(from.cont)){
        if (file.name == text && file.conf.icon != _this) {
            return true
        }
    }
    return false
}