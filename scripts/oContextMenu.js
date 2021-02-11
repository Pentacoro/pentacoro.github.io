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
        console.log(elmnt.childNodes[3]);
        elmnt.childNodes[3].setAttribute("contenteditable", "true");
        elmnt.childNodes[3].setAttribute("spellcheck", "false");
        elmnt.childNodes[3].focus();
        window.getSelection().setBaseAndExtent(elmnt.childNodes[3],0,elmnt.childNodes[3],1);

        setTimeout( () => {
            document.body.onmousedown = () => {
                if(
                    iconNameExists(elmnt.childNodes[3].textContent, _this) == false &&
                    elmnt.childNodes[3].textContent != "Name me!" &&
                    elmnt.childNodes[3].textContent != ""
                ) {
                    elmnt.childNodes[3].setAttribute("contenteditable", "false");
                    elmnt.id = elmnt.childNodes[3].textContent;
                    _this.text = elmnt.childNodes[3].textContent;
                    elmnt.childNodes[3].style.backgroundColor = "";
                    shouldSelect = true;
                    document.body.onmousedown = null;
                } else {
                    elmnt.childNodes[3].style.backgroundColor = "#c90000";
                    shouldSelect = false;
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
                    document.body.oncontextmenu = () => {
                        elmnt.childNodes[3].textContent = _this.text
                        elmnt.childNodes[3].setAttribute("contenteditable", "false"); 
                        elmnt.childNodes[3].style.backgroundColor = "";
                        shouldSelect = true;
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