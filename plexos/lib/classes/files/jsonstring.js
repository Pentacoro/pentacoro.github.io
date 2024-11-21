import File from "./file.js"
export default class JsString extends File {
    data = {}
    constructor(p) {
        super()
        this.name = p.name
        this.cfg = p.cfg
        this.data = p.data || ""
    }
}