export default class Configuration {
    constructor(p){
        this.path = p.path     || ""
        this.exte = p.exte     || ((p.class==="Directory") ? "dir" : "")
        this.icon = p.icon     || null
        this.move = p.move     || true
        this.edit = p.edit     || true
        this.class  = p.class
        this.hidden = p.hidden || false

        this.date = {}
        this.date.Created  = p.date?.Created  || Date.now()
        this.date.Modified = ((p.class==="Directory"||p.class==="Metafile") ? undefined : p.date?.Modified || Date.now())
        this.date.Accessed = ((p.class==="Directory") ? undefined : p.date?.Accessed || Date.now())
    }
}