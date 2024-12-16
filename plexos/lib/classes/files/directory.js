import {plexos} from "/plexos/ini/system.js"
import Configuration from "./configuration.js"
import Icon from "../interface/icon.js"
import File from "./file.js"
import Metafile from "./metafile.js"
import JsString from "./jsonstring.js"

export default class Directory extends File {
    static coreTemplate(){ 
        return new Directory(
        {
            name : "core",
            cfg : new Configuration (
            {
                icon : new Icon ({imag:"plexos/res/images/svg/desktopIcons/defaultDIRc.svg", name:"core", type:"Directory", stat:0}),
                type : "Directory",
                move : false,
                parent : "",
                vertex : true,
                system : true
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
        switch (Type) {
            case "Directory": Type = Directory; break
            case "Metafile":  Type = Metafile; break
            case "JsString":  Type = JsString; break
        }

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
                        parent : (parent===plexos.core) ? "" : "" + parent.cfg["parent"] + "/" + parent.name,
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
        this.dir[childName].cfg.addr = this.dir[childName].cfg["parent"] + "/" + childName
        this.dir[childName].cfg["icon"].file = this.dir[childName].cfg["parent"] + "/" + childName

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
        if (Object.keys(this.dir).length > 0 && this.cfg.icon.imag == File.typeDefaults("Directory").iconImag) {
            this.cfg.icon.imag = File.typeDefaults("Directory").iconImag.replace("DIR", "DIRc")
        } else if (Object.keys(this.dir).length == 0 && this.cfg.icon.imag == File.typeDefaults("Directory").iconImag.replace("DIR", "DIRc")) {
            this.cfg.icon.imag = File.typeDefaults("Directory").iconImag
        }
    }

    static isOpen = function (addr) {
        for (let task of plexos.Tasks) {
            if (task.name === "Explorer" && task.mem.address === addr) return task
        }
        return false
    }

    isNameAvailable = function (text, icon){
        for (let [name, file] of Object.entries(from.dir)){
            if (file.name == text && file.cfg.icon != icon) {
                return false
            }
        }
        return true
    }
}