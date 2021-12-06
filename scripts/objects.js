class Metafile {
    constructor(title, conf, file, preview, type, app, download = null, stream = null, screen = null, marquee = null, reference = null, description = null, tags = null) {
        this.name = title
        this.conf = conf
        this.meta = {
            title : title,
            file : file,
            stream : stream,
            screen : screen,
            marquee : marquee,
            preview : preview,
            download : download,
            reference : reference,
            description : description,
            app  : app,
            type : type,
            tags : tags,
        }
    }
}

class Executable {
    constructor(name, conf, lurl = "") {
        this.name = name
        this.conf = conf
        this.lurl = lurl
    }
}

class JSobject {
    constructor(name, conf, data = {}) {
        this.name = name
        this.conf = conf
        this.data = data
    }
}

/*
sys.wndwArr.push(new Window ("Settings", "settingsExe", true, true, 3, 1, 300, 300, 500, 500));
sys.wndwArr.push(new Window ("Settings", "settingsExe", true, true, 3, 1, 420, 420, 500, 500));
sys.wndwArr.push(new Window ("Explorer ONE", "explorerExe", true, true, 3, 1, 420, 420, 500, 500));
sys.wndwArr.push(new Window ("Explorer TWO", "explorerExe", true, true, 3, 1, 420, 420, 500, 500));
*/

//------------------------------------------------------------------------------------------------------------//