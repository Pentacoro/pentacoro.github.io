function iconOpen(e, elmnt, _this){
    if(
        (e.target.parentElement.id == "iconCM1" || e.target.id == "iconCM1") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Open");
    }
}
function iconMaximize(e, elmnt, _this){
    if(
        (e.target.parentElement.id == "iconCM2" || e.target.id == "iconCM2") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Maximize");
    }
}
function iconNewtab(e, elmnt, _this){
    if(
        (e.target.parentElement.id == "iconCM3" || e.target.id == "iconCM3") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Newtab");
    }
}

function iconCut(e, elmnt, _this){
    if(
        (e.target.parentElement.id == "iconCM4" || e.target.id == "iconCM4") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Cut");
    }
}
function iconCopy(e, elmnt, _this){
    if(
        (e.target.parentElement.id == "iconCM5" || e.target.id == "iconCM5") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Copy");
    }
}
function iconPaste(e, elmnt, _this){
    if(
        (e.target.parentElement.id == "iconCM6" || e.target.id == "iconCM6") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Paste");
    }
}

function iconDelete(e, elmnt, _this){
    if(
        (e.target.parentElement.id == "iconCM7" || e.target.id == "iconCM7") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Delete");
    }
}
function iconRename(e, elmnt, _this){
    if(
        (e.target.parentElement.id == "iconCM8" || e.target.id == "iconCM8") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Rename");
        let iconText = elmnt.childNodes[3];
        //make h3 editable --------------------|
        iconText.setAttribute("contenteditable", "true");
        iconText.setAttribute("spellcheck", "false");
        iconText.focus();
        window.getSelection().setBaseAndExtent(iconText,0,iconText,1);

        setTimeout( () => {
            document.body.onmousedown = () => {
                if(
                    iconNameExists(iconText.textContent, _this) == false &&
                    iconText.textContent != "Name me!" &&
                    iconText.textContent != ""
                ) {
                    //if the name is allowed --------------------|
                    shouldSelect = true;

                    iconText.setAttribute("contenteditable", "false");
                    elmnt.id = iconText.textContent;
                    _this.text = iconText.textContent;
                    iconText.style.backgroundColor = "";

                    document.body.onmousedown = null;
                } else {
                    //if the name not allowed --------------------|
                    shouldSelect = false;

                    iconText.style.backgroundColor = "#c90000";

                    //insist -> keep only edited selected
                    document.body.onclick = () => {
                        for (i = iconArray.length - 1; i >= 0; i--){
                            iconArray[i].stat = 0;
                            iconArray[i].statNode();
                        }
                        _this.stat = 1;
                        _this.statNode();
                        _this.stat = 0;

                        document.body.onclick = null;
                    }
                    //restore -> leave icon unmodified
                    document.body.oncontextmenu = () => {
                        shouldSelect = true;
                        
                        _this.statNode();

                        iconText.textContent = _this.text
                        iconText.setAttribute("contenteditable", "false"); 
                        iconText.style.backgroundColor = "";

                        document.body.oncontextmenu = null;
                        document.body.onmousedown = null;
                        document.body.onclick = null;
                    }
                }
            }
        }, 1);

        function iconNameExists(name, _this){
            for (i = iconArray.length - 1; i >= 0; i--){
                if (iconArray[i].text == name && iconArray[i] != _this) {
                    return true;
                }
            }
            return false;
        }
    }
}
function iconProperties(e, elmnt, _this){
    if(
        (e.target.parentElement.id == "iconCM9" || e.target.id == "iconCM9") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Properties");
    }
}

