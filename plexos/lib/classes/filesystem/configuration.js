export default class Configuration {
    constructor(p){
        this.path = p.path     || ""
        this.exte = p.exte     || ((p.class==="Directory") ? "dir" : "")
        this.icon = p.icon     || null
        this.icon.image = null
        this.move = p.move     || true
        this.edit = p.edit     || true
        this.class  = p.class
        this.hidden = p.hidden || false

        this.date = {}
        this.date.Created  = p.date?.Created  || Date.now()
        this.date.Modified = ((p.class==="DirectoryFile"||p.class==="MetaFile") ? undefined : p.date?.Modified || Date.now())
        this.date.Accessed = ((p.class==="DirectoryFile") ? undefined : p.date?.Accessed || Date.now())
    }
}