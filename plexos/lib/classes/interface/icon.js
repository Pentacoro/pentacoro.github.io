import File from "../filesystem/file.js"

export default class Icon {
    state = 0
    constructor(p){
        this.state = p.state || this.state
        this.image = p.image || p.imag
        this.class = p.class
        this.name = p.name
        this.file = p.file || ""
        this.exte = p.exte || ((this.class==="Directory") ? "dir" : (this.name.match(/\.(?:.(?<!\.))+$/s)!=null) ? this.name.match(/(?:.(?<!\.))+$/s)[0] : "")

        this.drop = []
    }
    setImage(url){
        this.image = url
        File.at(this.file).render()
    }
    getImage(){
        if (this.image) return this.image

        switch (this.exte) {
            case "dir": 
                if (Object.keys(File.at(this.file).dir).length > 0) return File.classDefaults("Directory").iconImag.replace("DIR", "DIRc")
                else return File.classDefaults("Directory").iconImag
            case "txt" || "js" || "css" || "html":
                return File.classDefaults("String").iconImag
            case "proxy":
                return File.classDefaults("Proxy").iconImag
            case "meta":
                return File.classDefaults("Metafile").iconImag
            case "web":
                return File.at(this.file).meta.icon
            case "img":
                return File.at(this.file).meta.url
        }
    }
}