class Icon {
    constructor(image, name, program = null, state = 0, x, y){
        this.stat = state;
        this.posX = x;
        this.posY = y;

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
    constructor(title, program, instances = false, resizable, uiux = 3, state = 1, x, y, width, height){
        this.stat = state;
        this.posX = x;
        this.posY = y;
        
        this.widt = width;
        this.heig = height;
        
        this.name = title;
        
        this.apps = program; //next 3 depend on this
        this.inst = instances;
        this.flex = resizable;
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

var iconArray = [];

var windowArray = [];


iconArray.push(new Icon ("background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');", "Folder 1", "explorerExe", 0, 10, 10));
iconArray.push(new Icon ("background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');", "Folder 2", "explorerExe", 0, 10, 130));
iconArray.push(new Icon ("background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');", "Folder 3", "explorerExe", 0, 10, 250));
iconArray.push(new Icon ("background-image: url('assets/svg/desktopIcons/settingsPlaceholder.svg');", "Settings", "settingsExe", 0, 10, 370));


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