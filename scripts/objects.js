class Icon {
    constructor(image, name, program = null, state = 0, x, y){
        this.imag = image;
        this.text = name;
        this.exec = program;
        
        this.stat = state;
        
        this.posX = x;
        this.posY = y;
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

var iconArray = []

iconArray.push(new Icon ("background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');", "Folder 1", "explorerExe", 0, 10, 10));
iconArray.push(new Icon ("background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');", "Folder 2", "explorerExe", 0, 10, 130));
iconArray.push(new Icon ("background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');", "Folder 3", "explorerExe", 0, 10, 250));
iconArray.push(new Icon ("background-image: url('assets/svg/desktopIcons/settingsPlaceholder.svg');", "Settings", "settingsExe", 0, 10, 370));
//iconArray.push(new Icon ("background-image: url('assets/svg/desktopIcons/filePlaceholder.svg');", "File 1", "", 0, 10, 490));
//iconArray[4].createNode();

for (i = iconArray.length - 1; i >= 0; i--){
    iconArray[i].drag();
    iconArray[i].menu();
}