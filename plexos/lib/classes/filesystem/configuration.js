export default class Configuration {
    constructor(p){
        this.type = p.type
        this.path = p.path     || ""
        this.exte = p.exte     || ((p.type==="Directory") ? "dir" : "")
        this.icon = p.icon     || null
        this.move = p.move     || true
        this.edit = p.edit     || true
        this.hidden = p.hidden || false

        this.date = {}
        this.date.Created  = p.date?.Created  || Date.now()
        this.date.Modified = ((p.type==="Directory"||p.type==="Metafile") ? undefined : p.date?.Modified || Date.now())
        this.date.Accessed = ((p.type==="Directory") ? undefined : p.date?.Accessed || Date.now())
    }
}