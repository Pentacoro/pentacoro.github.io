class Icon {
    stat = 0
    coor = 
    {
        px : -1,
        py : -1,
        tx : -1,
        ty : -1,
        ax : null,
        ay : null
    }
    constructor(p){
        this.stat = p.stat || this.stat
        this.coor = p.coor || this.coor

        this.file = p.file || ""
        this.imag = p.imag
        this.name = p.name
        this.type = p.type
        this.exte = p.exte || (this.type==="Directory") ? "dir" : (this.name.match(/\.(?:.(?<!\.))+$/s)!=null) ? this.name.match(/(?:.(?<!\.))+$/s)[0] : ""

        this.drop = []
    }
    clic(){
        this.node.oncontextmenu = e => ContextMenu.open(e,this)
        this.node.onmousedown = e => this.drag(e);
        this.node.ondblclick = e => File.at(this.file).open()
    }
    gray(coin){
        if ( coin ) {
            this.node.classList.add("blur")
        } else {
            this.node.classList.remove("blur")      
        }
    }
}