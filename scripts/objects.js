class Icon {
    constructor(image, name, program, state, x, y){
        this.imag = image;
        this.text = name;
        this.exec = program;
        
        this.slct = state
        this.posX = x;
        this.posY = y;
    }
    dragging(){
        dragIcon(document.getElementById(this.name));
    }
    open(){
        openIcon(this);
    }
    delete(){
        suprIcon(this);
    }
}

var iconArray = []

iconArray.push(new Icon ("sumn", "Settings", "settingsExe", false, 1000, 400));

console.log(iconArray);












var gear = document.getElementById("settings");
gear.object = iconArray[0];
gear.onlcick = function() {
    yay(this.object);
}