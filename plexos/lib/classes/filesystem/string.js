import File from "./file.js"
export default class StringFile extends File {
    data = {}
    constructor(p) {
        super()
        this.name = p.name
        this.cfg = p.cfg
        this.data = p.data || ""
    }
    write(data) {
        this.data = data
        this.cfg.date.Modified = Date.now()
    }
    read() {
        this.cfg.date.Accessed = Date.now()
        return this.data
    }
}