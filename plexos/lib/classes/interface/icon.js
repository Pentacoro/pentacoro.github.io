import File from "../files/file.js"

export default class Icon {
    stat = 0
    constructor(p){
        this.stat = p.stat || this.stat
        this.coor = p.coor || null

        this.file = p.file || ""
        this.imag = p.imag
        this.name = p.name
        this.type = p.type
        this.exte = p.exte || (this.type==="Directory") ? "dir" : (this.name.match(/\.(?:.(?<!\.))+$/s)!=null) ? this.name.match(/(?:.(?<!\.))+$/s)[0] : ""

        this.drop = []
    }
    setImage(url){
        this.imag = url
        File.at(this.file).render()
    }
    clic(){
        this.node.oncontextmenu = e => ContextMenu.open(e,this)
        this.node.onmousedown = e => this.drag(e)
        this.node.ondblclick = e => File.at(this.file).open()
    }
    gray(bool){
        if ( bool ) {
            this.node.classList.add("blur")
        } else {
            this.node.classList.remove("blur")      
        }
    }
}