import File from "./file.js"
export default class Metafile extends File {
    meta = {
        url: null,
        embed: null,
        download: null,

        title: null,
        image: null,
        description: null,
    }
    constructor(p) {
        super()
        this.name = p.name
        this.cfg = p.cfg

        this.meta.url         = p.meta?.file        || this.meta.url
        this.meta.embed       = p.meta?.embed       || this.meta.embed
        this.meta.download    = p.meta?.download    || this.meta.download

        this.meta.title       = p.meta?.title       || this.meta.title
        this.meta.preview     = p.meta?.preview     || this.meta.preview
        this.meta.description = p.meta?.description || this.meta.description
    }
}