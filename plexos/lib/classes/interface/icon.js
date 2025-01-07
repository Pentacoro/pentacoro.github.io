import File from "../filesystem/file.js"

export default class Icon {
    state = 0
    constructor(p){
        this.state = p.state || this.state

        this.file = p.file || ""
        this.image = p.image || p.imag
        this.class = p.class || p.class
        this.name = p.name
        this.exte = p.exte || (this.class==="Directory") ? "dir" : (this.name.match(/\.(?:.(?<!\.))+$/s)!=null) ? this.name.match(/(?:.(?<!\.))+$/s)[0] : ""

        this.drop = []
    }
    setImage(url){
        this.image = url
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