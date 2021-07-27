//-------------------------------------------------------------------------------------|
function iconOpen(e, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Open");
        closeMenu();

        windowArray.push(new Window ("Settings", _this.apps, true, 3, 1, 300, 300, 500, 500));
        windowArray[windowArray.length -1].createNode();
    }
}
function iconMaximize(e, elmnt, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Maximize");
        closeMenu();
    }
}
function iconNewtab(e, elmnt, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Newtab");
        closeMenu();
    }
}
function iconCut(e, elmnt, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Cut");
        closeMenu();
    }
}
function iconCopy(e, elmnt, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Copy");
        closeMenu();
    }
}
function iconPaste(e, elmnt, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Paste");
        closeMenu();
    }
}
function iconDelete(e, elmnt, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Delete");
        closeMenu();
        deleteSelectedNodes();
    }
}
function iconRename(e, elmnt, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Rename");
        closeMenu();
        let iconText = elmnt.childNodes[1];
        //make h3 editable --------------------|
        iconText.setAttribute("contenteditable", "true");
        iconText.setAttribute("spellcheck", "false");
        
        //select h3 content --------------------|
        selectText(iconText)

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
        
                        selectText(iconText)
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
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Properties");
        closeMenu();
    }
}
//-------------------------------------------------------------------------------------|
function deskGrid(e){
    if(
        (e.target.parentElement.id == "deskCM1" || e.target.id == "deskCM1") &&
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Grid");

        loadAPP("./apps/settings_deskGrid/deskGridOptions_launch.html");

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

        let iconWidth = cfg.desk.grid.width/2;
        let iconHeight = cfg.desk.grid.height/2;

        let w = cfg.desk.grid.width; let h = cfg.desk.grid.height; let wm = cfg.desk.grid.hMargin; let hm = cfg.desk.grid.vMargin;

        let iconPosX = (Math.round((initialX-iconWidth)/(w + wm))*(w + wm) + wm);
        let iconPosY = (Math.round((initialY-iconHeight)/(h + hm))*(h + hm) + hm);
        //--------------------------------------------------------------|

        iconArray.push(new Icon ("background-image: url('assets/svg/desktopIcons/filePlaceholder.svg');", "Name me!", "explorerExe", 1, iconPosX, iconPosY));
        let createdIcon = iconArray[iconArray.length - 1]
        createdIcon.createNode();

        let iconText = document.getElementById(createdIcon.text).childNodes[1];
        //make h3 editable --------------------|
        iconText.setAttribute("contenteditable", "true");
        iconText.setAttribute("spellcheck", "false");

        //select h3 content --------------------|
        selectText(iconText)

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

                        selectText(iconText)
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
function iconMenuFunctions(e,elmnt,_this,n){
    switch(n){
        case 1:
            iconOpen(e,_this);
            break;
        case 2:
            iconMaximize(e,elmnt,_this);
            break;
        case 3:
            iconNewtab(e,elmnt,_this);
            break;
        case 4:
            iconCut(e,elmnt,_this);
            break;
        case 5:
            iconCopy(e,elmnt,_this);
            break;
        case 6:
            iconPaste(e,elmnt,_this);
            break;
        case 7:
            iconDelete(e,elmnt,_this);
            break;
        case 8:
            iconRename(e,elmnt,_this);
            break;
        case 9:
            iconProperties(e,elmnt,_this);
    }
}
function deskMenuFunctions(e,n){
    switch(n){
        case 1:
            deskGrid(e);
            break;
        case 2:
            deskNew(e);
            break;
        case 3:
            deskPaste(e);
            break;
        case 4:
            deskSettings(e);
            break;
        case 5:
            deskInfo(e);
    }
}

function iconMenuOpen(elmnt, _this) {
    let iMenuOptions = document.getElementsByClassName("iMenuOption");
    for (option of iMenuOptions){
        let n = option.id.match(/(\d+)/)[0];
        n = parseInt(n);
        option.onclick = (e) => {iconMenuFunctions(e,elmnt,_this,n)}
    }
}

function iconMenuClose() {
    let iMenuOptions = document.getElementsByClassName("iMenuOption");
    for (option of iMenuOptions){
        option.onclick = null;
    }
}

function deskMenuOpen() {
    let dMenuOptions = document.getElementsByClassName("dMenuOption");
    for (option of dMenuOptions){
        let n = option.id.match(/(\d+)/)[0];
        n = parseInt(n);
        option.onclick = (e) => {deskMenuFunctions(e,n)}
    }
}

function deskMenuClose() {
    let dMenuOptions = document.getElementsByClassName("dMenuOption");
    for (option of dMenuOptions){
        option.onclick = null;
    }
}
//-------------------------------------------------------------------------------------|