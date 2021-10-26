class Icon {
    constructor(image, name, program = null, state = 0, x = 0, y = 0){
        this.stat = state
        this.coor = {px: x, py: y, tx: x, ty: y, ax: null, ay: null}

        this.file = {}
        this.imag = image
        this.text = name
        this.apps = program

        this.drop = []

        function findOutMenu(_this) {
            switch (_this.apps) {
                default:
                case "exe":
                case "vertex":
                case "explorer":
                    _this.drop.push(new contextSection("open"))
                    _this.drop.push(new contextSection("clip"))
                    _this.drop.push(new contextSection("prop"))

                    _this.drop[0].item.push(new contextOption("Open","url('assets/svg/contextMenu/open.svg')",iconOpen))
                    _this.drop[0].item.push(new contextOption("Open in fullscreen","url('assets/svg/contextMenu/maximize.svg')",iconMaximize))
                    _this.drop[0].item.push(new contextOption("Open in new tab","url('assets/svg/contextMenu/newtab.svg')",iconNewtab))

                    _this.drop[1].item.push(new contextOption("Cut","url('assets/svg/contextMenu/cut.svg')",iconCut))
                    _this.drop[1].item.push(new contextOption("Copy","url('assets/svg/contextMenu/copy.svg')",iconCopy))
                    _this.drop[1].item.push(new contextOption("Paste","url('assets/svg/contextMenu/paste.svg')",iconPaste))

                    _this.drop[2].item.push(new contextOption("Delete","url('assets/svg/contextMenu/delete.svg')",iconDelete))
                    _this.drop[2].item.push(new contextOption("Rename","url('assets/svg/contextMenu/rename.svg')",iconRename))
                    _this.drop[2].item.push(new contextOption("Properties","url('assets/svg/contextMenu/properties.svg')",iconProperties))
                    break;  
            }
        }

        findOutMenu(this)
    }
    createNode(){
        crteIconNode(this)
    }
    deleteNode(){
        dlteIconNode(this)
    }
    statNode(){
        statIconNode(document.getElementById(this.text), this)
    }
    poseNode(){
        poseIconNode(document.getElementById(this.text), this)
    }
    drag(){
        dragIcon(document.getElementById(this.text), this)
    }
    menu(){
        menuIcon(document.getElementById(this.text), this)
    }
}

class Window {
    constructor(name, task, resizable, uiux = 3, state = 1, x, y, w, h, mw, mh){
        this.stat = state // 0 => minimized | 1/2 => open/selected | 3/4 => maximized/selected
        this.posX = x
        this.posY = y
        
        this.widt = w
        this.heig = h
        this.minW = mw
        this.minH = mh
        
        this.task = task //next depend on this
        
        this.name = name
        this.resi = resizable
        this.uiux = uiux
    }
    createNode(){
        crteWndwNode(this)
    }
    deleteNode(){
        dlteWndwNode(this)
    }
    statNode(){
        statWndwNode(document.getElementById("windowNumber" + windowArray.indexOf(this)), this)
    }
    poseNode(){
        poseWndwNode(document.getElementById("windowNumber" + windowArray.indexOf(this)), this)
    }
    drag(){
        dragWndw(document.getElementById("windowNumber" + windowArray.indexOf(this)), this)
    }
    size(){
        sizeWndw(document.getElementById("windowNumber" + windowArray.indexOf(this)), this)
    }
    menu(){
        menuWndw(document.getElementById("windowNumber" + windowArray.indexOf(this)), this)
    }
}

class Directory {
    constructor(name, conf = {}, cont = {}) {
        this.name = name
        this.conf = conf
        this.cont = cont
    }

    createNewDir(childName, childConf = null, childCont = null) {
        let parent = this
        if (childConf) { 
            //if conf argument passed use it
            this.cont[childName] = new Directory(childName,childConf)
            this.cont[childName].conf["icon"].file = this.cont[childName].conf["from"] + "/" + childName
        } else { 
            //if no conf argument passed, create default folder
            this.cont[childName] = new Directory(
                                                    childName, 
                                                    {
                                                        icon : new Icon (
                                                                            "background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');", 
                                                                            childName, 
                                                                            "explorer", 
                                                                            0  
                                                                        ),
                                                        from : "" + parent.conf["from"] + "/" + parent.name
                                                    }
                                                )
            this.cont[childName].conf["icon"].file = this.cont[childName].conf["from"] + "/" + childName
        }

        if (childCont) {
            this.cont[childName].cont = childCont
        }

        //if the parent is a vertex && icon doesn't have coord values then put them on deskGrid
        if (this.conf.vert && this.cont[childName].conf.icon.coor.px == 0) {
            repositionIcons([this.cont[childName].conf.icon],true,false)
            iconArray.push(this.cont[childName].conf.icon)
            this.cont[childName].conf.icon.createNode()
        }
    }

    deleteMe() {
        let parent = this.conf.from
        let child = this

        delete parent.cont[child.name]
    }
}

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

class Task {
    constructor(apps, inst = true, appEnd) {
        this.apps = apps
        this.inst = inst
        this.id = genRanHex(16)
        checkUniqueID(this)

        let id = this.id
        //end task
        this.end = function() {
            
            appEnd()
            windowArray[parseInt(document.getElementsByClassName(id)[0].id.match(/(\d+)/)[0])].deleteNode()

            taskArray.splice(taskArray.indexOf(this),1)
        }
    }
}

class contextOption {
    constructor(name, icon, func){
        this.name = name
        this.icon = icon
        this.func = func 
    }
}
class contextSection {
    constructor(name = null, item = []){
        this.name = name
        this.item = item
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