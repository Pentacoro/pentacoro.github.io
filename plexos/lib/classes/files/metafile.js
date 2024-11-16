class Metafile extends File {
    meta = {
        title : null,
        app  : null,
        type : null,
        tags : null,
        file : null,
        stream : null,
        screen : null,
        marquee : null,
        preview : null,
        download : null,
        reference : null,
        description : null,
    }
    constructor(p) {
        super()
        this.name = p.name
        this.cfg = p.cfg

        this.meta.title         = p.name
        this.meta.app           = p.meta?.app            || this.meta.app
        this.meta.type          = p.meta?.type           || this.meta.type
        this.meta.tags          = p.meta?.tags           || this.meta.tags
        this.meta.file          = p.meta?.file           || this.meta.file
        this.meta.stream        = p.meta?.stream         || this.meta.stream
        this.meta.screen        = p.meta?.screen         || this.meta.screen
        this.meta.marquee       = p.meta?.marquee        || this.meta.marquee
        this.meta.preview       = p.meta?.preview        || this.meta.preview
        this.meta.download      = p.meta?.download       || this.meta.download
        this.meta.reference     = p.meta?.reference      || this.meta.reference
        this.meta.description   = p.meta?.description    || this.meta.description
    }
}