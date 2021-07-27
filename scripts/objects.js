class Icon {
    constructor(image, name, program = null, state = 0, x, y){
        this.stat = state;
        this.coor = {px: x, py: y, tx: x, ty: y, ax: null, ay: null};
        repositionIcons([this],true,false);

        this.imag = image;
        this.text = name;
        this.apps = program;
    }
    createNode(){
        crteIconNode(this);
    }
    deleteNode(){
        dlteIconNode(this);
    }
    statNode(){
        statIconNode(document.getElementById(this.text), this);
    }
    poseNode(){
        poseIconNode(document.getElementById(this.text), this);
    }
    drag(){
        dragIcon(document.getElementById(this.text), this);
    }
    menu(){
        menuIcon(document.getElementById(this.text), this);
    }
}

class Window {
    constructor(name, task, resizable, uiux = 3, state = 1, x, y, w, h, mw, mh){
        this.stat = state; // 0 => minimized | 1/2 => open/selected | 3/4 => maximized/selected
        this.posX = x;
        this.posY = y;
        
        this.widt = w;
        this.heig = h;
        this.minW = mw;
        this.minH = mh;
        
        this.task = task; //next depend on this
        
        this.name = name;
        this.resi = resizable;
        this.uiux = uiux;
    }
    createNode(){
        crteWndwNode(this);
    }
    deleteNode(){
        dlteWndwNode(this);
    }
    statNode(){
        statWndwNode(document.getElementById("windowNumber" + windowArray.indexOf(this)), this);
    }
    poseNode(){
        poseWndwNode(document.getElementById("windowNumber" + windowArray.indexOf(this)), this);
    }
    drag(){
        dragWndw(document.getElementById("windowNumber" + windowArray.indexOf(this)), this);
    }
    size(){
        sizeWndw(document.getElementById("windowNumber" + windowArray.indexOf(this)), this);
    }
    menu(){
        menuWndw(document.getElementById("windowNumber" + windowArray.indexOf(this)), this);
    }
}

class Directory {
    constructor(name, cont, conf) {
        this.name = name;
        this.cont = cont;
        this.conf = conf;
    }
}

class Metafile {
    constructor(title, file, icon, preview, download, type, app, stream = null, screen = null, marquee = null, reference = null, description = null, tags = null) {
        this.title = title;
        this.file = file;
        this.stream = stream;
        this.screen = screen;
        this.marquee = marquee;
        this.preview = preview;
        this.download = download;
        this.reference = reference;
        this.description = description;
        this.app  = app;
        this.type = type;
        this.tags = tags;
        this.icon = icon;
    }
}

class Executable {
    constructor(url, type, param) {
        this.url = url
        this.type = type
        this.param = param
    }
}

class Task {
    constructor(apps, inst = true, appEnd) {
        this.apps = apps
        this.inst = inst
        this.id = genRanHex(16)
        checkUniqueID(this)

        //end task
        let id = this.id
        this.end = function() {
            appEnd()
            windowArray[parseInt(document.getElementsByClassName(id)[0].id.match(/(\d+)/)[0])].deleteNode()

            taskArray.splice(taskArray.indexOf(this),1)
        }
    }
}

var iconArray = []
var windowArray = []
var taskArray = []
var audioArray = []

audioArray.push(new Audio("assets/sound/Norrum - Interfaz Click v1.mp3"))
audioArray.push(new Audio("assets/sound/Norrum - Interfaz Item errOr v1.mp3"))
audioArray.push(new Audio("assets/sound/Norrum - Interfaz Item OK c_ v1.mp3"))
audioArray.push(new Audio("assets/sound/Norrum - Interfaz Startup 2 v1.mp3"))

iconArray.push(new Icon ("background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');", "Folder 1", "explorerExe", 0, 12, 12));
iconArray.push(new Icon ("background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');", "Folder 2", "explorerExe", 0, 12, 132));
iconArray.push(new Icon ("background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');", "Folder 3", "explorerExe", 0, 12, 252));
iconArray.push(new Icon ("background-image: url('assets/svg/desktopIcons/settingsPlaceholder.svg');", "Settings", "settingsExe", 0, 12, 372));

/*
windowArray.push(new Window ("Settings", "settingsExe", true, true, 3, 1, 300, 300, 500, 500));
windowArray.push(new Window ("Settings", "settingsExe", true, true, 3, 1, 420, 420, 500, 500));
windowArray.push(new Window ("Explorer ONE", "explorerExe", true, true, 3, 1, 420, 420, 500, 500));
windowArray.push(new Window ("Explorer TWO", "explorerExe", true, true, 3, 1, 420, 420, 500, 500));
*/

for (i = iconArray.length - 1; i >= 0; i--){
    iconArray[i].createNode();
}

for (wndw of windowArray){
    wndw.createNode();
}

//------------------------------------------------------------------------------------------------------------//
norrumSettings = {
    theme: "default"
}