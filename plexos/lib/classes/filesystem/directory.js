import {plexos} from "/plexos/ini/system.js"
import Configuration from "./configuration.js"

import Icon from "../interface/icon.js"
import File from "./file.js"

import Metafile from "./metafile.js"
import String from "./string.js"
import Proxy from "./proxy.js"

export default class Directory extends File {
    static coreTemplate(){ 
        return new Directory(
        {
            name : "core",
            cfg : new Configuration (
            {
                class : "Directory",
                icon : new Icon ({class: "Directory", name:"core", type:"Directory", state:0}),
                move : false,
                edit : false,
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
        events = true,
    ) {
        let parent = this

        let defaults = File.classDefaults(Type)
        let iconImag = defaults.iconImag
        let confType = defaults.confType
        let skeyName = defaults.skeyName
        switch (Type) {
            case "Directory": Type = Directory; break
            case "Metafile":  Type = Metafile; break
            case "String":    Type = String; break
            case "Proxy":     Type = Proxy; break
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
                        class : confType,
                        move : true,
                        exte : (confType=="Directory") ? "dir" : childName.match(/(?:.(?<!\.))+$/s)[0],
                        icon : childIcon || new Icon (
                                                {
                                                    class : confType, 
                                                    name : childName, 
                                                    exte : childName.match(/(?:.(?<!\.))+$/s)[0],
                                                    state : 0  
                                                }
                                            ),
                    })
                }
            )
        }
        this.dir[childName].cfg.path = this.cfg.path+ "/" + childName
        this.dir[childName].cfg["icon"].file = this.cfg.path+ "/" + childName

        if (childCont) {
            this.dir[childName][skeyName] = childCont
        }

        //create a new registry entry for this file
        if (events) File.at("/plexos/reg/files.proxy").data = {}

        return this.dir[childName]
    }
}