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
    constructor(title, program, instances = false, resizable, uiux = 3, state = 1, x, y, w, h, mw, mh){
        this.stat = state; // 0 => minimized | 1/2 => open/_&selected | 3/4 => maximized/_&selected
        this.posX = x;
        this.posY = y;
        
        this.widt = w;
        this.heig = h;
        this.minW = mw;
        this.minH = mh;
        
        this.apps = program; //next depend on this
        
        this.name = title;
        this.inst = instances;
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

var iconArray = [];
var windowArray = [];

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