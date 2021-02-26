function iconOpen(e, elmnt, _this){
    if(
        (e.target.parentElement.id == "iconCM1" || e.target.id == "iconCM1") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Open");
        closeMenu();

        windowArray.push(new Window ("Settings", _this.apps, true, true, 3, 1, 300, 300, 500, 500));
        windowArray[windowArray.length -1].createNode();
    }
}
function iconMaximize(e, elmnt, _this){
    if(
        (e.target.parentElement.id == "iconCM2" || e.target.id == "iconCM2") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Maximize");
        closeMenu();
    }
}
function iconNewtab(e, elmnt, _this){
    if(
        (e.target.parentElement.id == "iconCM3" || e.target.id == "iconCM3") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Newtab");
        closeMenu();
    }
}

function iconCut(e, elmnt, _this){
    if(
        (e.target.parentElement.id == "iconCM4" || e.target.id == "iconCM4") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Cut");
        closeMenu();
    }
}
function iconCopy(e, elmnt, _this){
    if(
        (e.target.parentElement.id == "iconCM5" || e.target.id == "iconCM5") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Copy");
        closeMenu();
    }
}
function iconPaste(e, elmnt, _this){
    if(
        (e.target.parentElement.id == "iconCM6" || e.target.id == "iconCM6") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Paste");
        closeMenu();
    }
}

function iconDelete(e, elmnt, _this){
    if(
        (e.target.parentElement.id == "iconCM7" || e.target.id == "iconCM7") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Delete");
        closeMenu();
        deleteSelectedNodes();
    }
}
function iconRename(e, elmnt, _this){
    if(
        (e.target.parentElement.id == "iconCM8" || e.target.id == "iconCM8") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Rename");
        closeMenu();
        let iconText = elmnt.childNodes[1];
        //make h3 editable --------------------|
        iconText.setAttribute("contenteditable", "true");
        iconText.setAttribute("spellcheck", "false");
        
        //select h3 content --------------------|
        iconText.focus();
        let range = document.createRange();
        range.setStart(iconText, 0);
        range.setEnd(iconText, iconText.childNodes.length);
        window.getSelection().addRange(range);

        iconText.style.textShadow = "none";

        //restore -> leave icon unmodified
        document.body.oncontextmenu = iconRenamingRestore;
        window.onkeydown = (e) => {if(e.key == "Escape"){
            iconRenamingRestore();
            return false;
        }};
        function iconRenamingRestore(){
            shouldSelect = true;
            
            _this.statNode();

            iconText.textContent = _this.text
            iconText.setAttribute("contenteditable", "false"); 
            iconText.style.backgroundColor = "";
            iconText.style.textShadow = "";

            iconText.blur();
            clearSelection();

            document.body.oncontextmenu = null;
            document.body.onmousedown = null;
            document.body.onclick = null;
            iconText.onkeydown = null;
            window.onkeydown = null;
            window.onkeyup = null;
        }

        setTimeout( () => {
            document.body.onmousedown = iconRenaming;
            iconText.onkeydown = (e) => {if(e.key == "Enter" && e.shiftKey == false){
                iconRenaming();
                return false;
            }};
            function iconRenaming(){
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
                    iconText.style.textShadow = "";

                    iconText.blur();
                    clearSelection();

                    document.body.oncontextmenu = null;
                    document.body.onmousedown = null;
                    document.body.onclick = null;
                    iconText.onkeydown = null;
                    window.onkeydown = null;
                    window.onkeyup = null;
                } else {
                    //if the name not allowed --------------------|
                    shouldSelect = false;
                    iconText.style.backgroundColor = "#c90000";

                    //insist -> keep only edited selected
                    document.body.onclick = iconRenamingInsist;
                    window.onkeyup = (e) => {if(e.key == "Enter"){
                        iconRenamingInsist();
                        return false;
                    }};
                    function iconRenamingInsist(){
                        for (i = iconArray.length - 1; i >= 0; i--){
                            iconArray[i].stat = 0;
                            iconArray[i].statNode();
                        }
                        _this.stat = 1;
                        _this.statNode();
                        _this.stat = 0;
        
                        iconText.focus();
                        range.setStart(iconText, 0);
                        range.setEnd(iconText, iconText.childNodes.length);
                        window.getSelection().addRange(range);
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
        closeMenu();
    }
}

//-------------------------------------------------------------------------------------|

function deskIcon(e){
    if(
        (e.target.parentElement.id == "deskCM1" || e.target.id == "deskCM1") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Icon");
        closeMenu();
    }
}
function deskNew(e){
    if(
        (e.target.parentElement.id == "deskCM2" || e.target.id == "deskCM2") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("New");
        closeMenu();

        //Make sure icon appears at center of initial right click-------|
        let initialX = parseInt(window.getComputedStyle(document.getElementById("deskContextMenu"),null).getPropertyValue("left"));
        let initialY = parseInt(window.getComputedStyle(document.getElementById("deskContextMenu"),null).getPropertyValue("top"));

        let iconWidth = parseInt(window.getComputedStyle(document.getElementsByClassName("icon")[0],null).getPropertyValue("width"))/2; //aux half icon width
        let iconHeight = parseInt(window.getComputedStyle(document.getElementsByClassName("icon")[0],null).getPropertyValue("height"))/2; //aux half icon height

        let iconPosX = (Math.round((initialX-iconWidth)/120)*120 + 10);
        let iconPosY = (Math.round((initialY-iconHeight)/120)*120 + 10);
        //--------------------------------------------------------------|

        iconArray.push(new Icon ("background-image: url('assets/svg/desktopIcons/filePlaceholder.svg');", "Name me!", "explorerExe", 1, iconPosX, iconPosY));
        let createdIcon = iconArray[iconArray.length - 1]
        createdIcon.createNode();

        let iconText = document.getElementById(createdIcon.text).childNodes[1];
        //make h3 editable --------------------|
        iconText.setAttribute("contenteditable", "true");
        iconText.setAttribute("spellcheck", "false");

        //select h3 content --------------------|
        iconText.focus();
        let range = document.createRange();
        range.setStart(iconText, 0);
        range.setEnd(iconText, iconText.childNodes.length);
        window.getSelection().addRange(range);

        iconText.style.textShadow = "none";

        //delete -> cancel icon creation
        document.body.oncontextmenu = iconNamingDelete;
        window.onkeydown = (e) => {if(e.key == "Escape"){
            iconNamingDelete();
            return false;
        }};
        function iconNamingDelete(){
            shouldSelect = true;
                
            createdIcon.deleteNode();

            document.body.oncontextmenu = null;
            document.body.onmousedown = null;
            document.body.onclick = null;
            iconText.onkeydown = null;
            window.onkeydown = null;
            window.onkeyup = null;
        }

        setTimeout( () => {
            document.body.onmousedown = iconNaming;
            iconText.onkeydown = (e) => {if(e.key == "Enter" && e.shiftKey == false){
                iconNaming();
                return false;
            }};

            function iconNaming(){
                if(
                    iconNameExists(iconText.textContent, createdIcon) == false &&
                    iconText.textContent != "Name me!" &&
                    iconText.textContent != ""
                ) {
                    //if the name is allowed --------------------|
                    shouldSelect = true;
        
                    iconText.setAttribute("contenteditable", "false");
                    document.getElementById(createdIcon.text).id = iconText.textContent;
                    createdIcon.text = iconText.textContent;
                    iconText.style.backgroundColor = "";
                    iconText.style.textShadow = "";
        
                    iconText.blur();
                    clearSelection();
        
                    document.body.oncontextmenu = null;
                    document.body.onmousedown = null;
                    document.body.onclick = null;
                    iconText.onkeydown = null;
                    window.onkeydown = null;
                    window.onkeyup = null;
                } else {
                    //if the name not allowed --------------------|
                    shouldSelect = false;
                    iconText.style.backgroundColor = "#c90000";
        
                    //insist -> keep only edited selected
                    document.body.onclick = iconNamingInsist;
                    window.onkeyup = (e) => {if(e.key == "Enter" && e.shiftKey == false){
                        iconNamingInsist();
                        return false;
                    }};
                    function iconNamingInsist(){
                        for (i = iconArray.length - 1; i >= 0; i--){
                            iconArray[i].stat = 0;
                            iconArray[i].statNode();
                        }
                        createdIcon.stat = 1;
                        createdIcon.statNode();
                        createdIcon.stat = 0;
        
                        iconText.focus();
                        range.setStart(iconText, 0);
                        range.setEnd(iconText, iconText.childNodes.length);
                        window.getSelection().addRange(range);
                    }
                }
            }
        }, 1);
    }

    function iconNameExists(name, _this){
        for (i = iconArray.length - 1; i >= 0; i--){
            if (iconArray[i].text == name && iconArray[i] != _this) {
                return true;
            }
        }
        return false;
    }
}

function deskPaste(e){
    if(
        (e.target.parentElement.id == "deskCM3" || e.target.id == "deskCM3") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Paste");
        closeMenu();
    }
}
function deskSettings(e){
    if(
        (e.target.parentElement.id == "deskCM4" || e.target.id == "deskCM4") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Settings");
        closeMenu();
    }
}
function deskInfo(e){
    if(
        (e.target.parentElement.id == "deskCM5" || e.target.id == "deskCM5") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Info");
        closeMenu();
    }
}

//-------------------------------------------------------------------------------------|

function iconMenuOpen(elmnt, _this) {
    document.getElementById("iconCM1").onclick = (e) => {iconOpen(e, elmnt, _this)}
    document.getElementById("iconCM2").onclick = (e) => {iconMaximize(e, elmnt, _this)}
    document.getElementById("iconCM3").onclick = (e) => {iconNewtab(e, elmnt, _this)}
    document.getElementById("iconCM4").onclick = (e) => {iconCut(e, elmnt, _this)}
    document.getElementById("iconCM5").onclick = (e) => {iconCopy(e, elmnt, _this)}
    document.getElementById("iconCM6").onclick = (e) => {iconPaste(e, elmnt, _this)}
    document.getElementById("iconCM7").onclick = (e) => {iconDelete(e, elmnt, _this)}
    document.getElementById("iconCM8").onclick = (e) => {iconRename(e, elmnt, _this)}
    document.getElementById("iconCM9").onclick = (e) => {iconProperties(e, elmnt, _this)}
}

function iconMenuClose(){
    document.getElementById("iconCM1").onclick = null;
    document.getElementById("iconCM2").onclick = null;
    document.getElementById("iconCM3").onclick = null;
    document.getElementById("iconCM4").onclick = null;
    document.getElementById("iconCM5").onclick = null;
    document.getElementById("iconCM6").onclick = null;
    document.getElementById("iconCM7").onclick = null;
    document.getElementById("iconCM8").onclick = null;
    document.getElementById("iconCM9").onclick = null;
}

function deskMenuOpen() {
    document.getElementById("deskCM1").onclick = deskIcon;
    document.getElementById("deskCM2").onclick = deskNew;
    document.getElementById("deskCM3").onclick = deskPaste;
    document.getElementById("deskCM4").onclick = deskSettings;
    document.getElementById("deskCM5").onclick = deskInfo;
}

function deskMenuClose() {
    document.getElementById("deskCM1").onclick = null;
    document.getElementById("deskCM2").onclick = null;
    document.getElementById("deskCM3").onclick = null;
    document.getElementById("deskCM4").onclick = null;
    document.getElementById("deskCM5").onclick = null;
}

function clearSelection()
{
 if (window.getSelection) {window.getSelection().removeAllRanges();}
 else if (document.selection) {document.selection.empty();}
}