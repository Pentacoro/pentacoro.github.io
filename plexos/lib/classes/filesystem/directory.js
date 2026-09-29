import File from "./file.js"
import plexos from "../../../ini/system.js"
import Configuration from "./configuration.js"

import Icon from "../interface/icon.js"

export default class DirectoryFile extends File {
    static coreTemplate(){ 
        return new DirectoryFile(
        {
            name : "core",
            cfg : new Configuration (
            {
                class : "DirectoryFile",
                icon : new Icon ({class: "DirectoryFile", name:"core", type:"Directory", state:0}),
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