class Metafile {
    constructor(title, file, icon, preview, download, type, app, stream = null, screen = null, marquee = null, reference = null, description = null, tags = null) {
        this.title = title
        this.file = file
        this.stream = stream
        this.screen = screen
        this.marquee = marquee
        this.preview = preview
        this.download = download
        this.reference = reference
        this.description = description
        this.app  = app
        this.type = type
        this.tags = tags
        this.icon = icon
    }
}

class Executable {
    constructor(name, url, conf = null) {
        this.name = name
        this.url = url
        this.conf = conf
    }
}

var iconArray      = []
var windowArray    = []
var taskArray      = []
var audioArray     = []

audioArray.push(new Audio("assets/sound/Norrum - Interfaz Click v1.mp3"))
audioArray.push(new Audio("assets/sound/Norrum - Interfaz Item errOr v1.mp3"))
audioArray.push(new Audio("assets/sound/Norrum - Interfaz Item OK c_ v1.mp3"))
audioArray.push(new Audio("assets/sound/Norrum - Interfaz Item alMost.mp3"))
audioArray.push(new Audio("assets/sound/Norrum - Interfaz Startup 2 v1.mp3"))

/*
windowArray.push(new Window ("Settings", "settingsExe", true, true, 3, 1, 300, 300, 500, 500));
windowArray.push(new Window ("Settings", "settingsExe", true, true, 3, 1, 420, 420, 500, 500));
windowArray.push(new Window ("Explorer ONE", "explorerExe", true, true, 3, 1, 420, 420, 500, 500));
windowArray.push(new Window ("Explorer TWO", "explorerExe", true, true, 3, 1, 420, 420, 500, 500));
*/

//------------------------------------------------------------------------------------------------------------//
norrumSettings = {
    theme: "default"
}