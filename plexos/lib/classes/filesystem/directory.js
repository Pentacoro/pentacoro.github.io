import plexos from "/plexos/ini/system.js"
import Configuration from "./configuration.js"

import Icon from "../interface/icon.js"
import File from "./file.js"

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
}