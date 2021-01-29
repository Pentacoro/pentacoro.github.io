class Icon {
    constructor(image, name, program, state, x, y){
        this.imag = image;
        this.text = name;
        this.exec = program;
        
        this.stat = state;
        this.posX = x;
        this.posY = y;
    }
    createNode(){
        createIconNode(this)
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
}

var iconArray = []

iconArray.push(new Icon ("sumn", "Folder", "explorerExe", 1, 10, 10));
iconArray.push(new Icon ("sumn", "Folder Test 2", "explorerExe", 1, 10, 130));
iconArray.push(new Icon ("sumn", "Folder Test 3", "explorerExe", 1, 10, 250));
iconArray.push(new Icon ("sumn", "Settings", "settingsExe", 1, 10, 370));

for (i = iconArray.length - 1; i >= 0; i--){
    iconArray[i].drag();
}