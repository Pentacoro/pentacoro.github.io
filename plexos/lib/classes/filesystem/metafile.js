import File from "./file.js"
export default class Metafile extends File {
    meta = {
        url: null,
        embed: null,
        download: null,

        title: null,
        image: null,
        description: null,
        icon: null,

        newtab: false,
    }
    constructor(p) {
        super()
        this.name = p.name
        this.cfg = p.cfg
        this.meta.newtab      = p.meta?.newtab      || this.meta.newtab

        this.meta.url         = p.meta?.url         || this.meta.url
        this.meta.embed       = p.meta?.embed       || this.meta.embed
        this.meta.download    = p.meta?.download    || this.meta.download

        this.meta.title       = p.meta?.title       || this.meta.title
        this.meta.image       = p.meta?.image       || this.meta.image
        this.meta.description = p.meta?.description || this.meta.description
        this.meta.icon        = p.meta?.icon        || this.meta.icon
    }
}