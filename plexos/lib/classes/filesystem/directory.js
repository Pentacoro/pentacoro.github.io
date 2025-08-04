import {plexos} from "/plexos/ini/system.js"
import Configuration from "./configuration.js"

import Icon from "../interface/icon.js"
import File from "./file.js"

import Metafile from "./metafile.js"
import StringFile from "./string.js"
import ProxyFile from "./proxy.js"

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
    (   type, 
        name, 
        icon = null, 
        conf = null, 
        cont = null,
        log = true,
    ) {
        let parent = this

        let defaults = File.classDefaults(type)
        let confType = defaults.confType
        let skeyName = defaults.skeyName
        let Type = {}
        switch (type) {
            case "Directory":   Type = Directory; break
            case "Metafile":    Type = Metafile; break
            case "StringFile":  Type = StringFile; break
            case "ProxyFile":   Type = ProxyFile; break
        }

        name = name + (((confType!="Directory") && !name.includes(".")) ? "." + name.match(/(?:.(?<!\.))+$/s)[0] : "")

        this.dir[name] = new Type
        (
            {
                name : name,
                cfg  : conf || new Configuration (
                {
                    class : confType,
                    move : true,
                    exte : (confType=="Directory") ? "dir" : name.match(/(?:.(?<!\.))+$/s)[0],
                    icon : icon || new Icon (
                                            {
                                                class : confType, 
                                                name : name, 
                                                exte : name.match(/(?:.(?<!\.))+$/s)[0],
                                                state : 0  
                                            }
                                        ),
                }),
                [skeyName] : cont
            }
        )

        this.dir[name].cfg.path = this.cfg.path+ "/" + name
        this.dir[name].cfg["icon"].file = this.cfg.path+ "/" + name

        if (log) plexos.Core.logChange("create",this.dir[name].cfg.path)

        return this.dir[name]
    }
}