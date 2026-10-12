import File from "./file.js"
import plexos from "../../../ini/system.js"
import Configuration from "./configuration.js"

import Icon from "../interface/icon.js"

export default class TrashCan extends File {
    cfg = {}
    dir = []
    constructor(p) {
        super()
        this.name = p.name
        this.cfg = p.cfg || this.cfg
        this.dir = p.dir || this.dir
    }
    receiveFile(file){
        fileWrap = {
            file : File.stringify(file),
            date : Date.now(),
            path : File.at(file, "parent").path
        }
        File.delete({ path: file.cfg.path })
        this.dir.push(fileWrap)
    }
    restoreFile(fileWrap){
        File.restore(fileWrap)
    }
}