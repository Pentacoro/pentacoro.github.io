class Configuration {
    constructor(p){
        this.type = p.type
        this.addr = p.addr     || ""
        this.exte = p.exte     || ((p.type==="Directory") ? "dir" : "")
        this.icon = p.icon     || null
        this.move = p.move     || true
        this.parent = p.parent || ""
        this.vertex = p.vertex || p.vert || false
        this.system = p.system || p.plex || false
        this.hidden = p.hidden || false
    }
}