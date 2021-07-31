//DROP MENU----------------------------------------------------------------------------|
function makeDropContext(e = null,elmnt,_this) {
    let contextArray = _this.drop

    let x = 0
    let z = 1
    //for each section
    for(section of contextArray) {
        let newSection = document.createElement("div")
        newSection.classList.add("contextSection")

        let y = 0
        //for each item
        for(item of section.item) {
            let id = "dropCM" + (x + y + z)

            let newButton = document.createElement("div")
            newButton.id = id
            newButton.classList.add("dMenuOption")
            
            let newIcon = document.createElement("div")
            newIcon.style.backgroundImage = item.icon
            let newText = document.createElement("span")
            newText.innerHTML = item.name
    
            newButton.appendChild(newIcon)
            newButton.appendChild(newText)

            newSection.appendChild(newButton)

            //no idea why this only worked like this, but it did
            let pls = [x,y]
            let arg = [e,elmnt,_this]
            newButton.onclick = e => contextArray[pls[0]].item[pls[1]].func(arg[0], arg[1], arg[2])

            y++
        }
        //get on document
        document.getElementById("dropContextMenu").appendChild(newSection)

        z = z + (section.item.length - 1)
        x++
    }
    let bottomSection = document.createElement("div")
    bottomSection.classList.add("contextSection")
    document.getElementById("dropContextMenu").appendChild(bottomSection)
}

function hideDropContext() {
    for(section of document.getElementById("dropContextMenu").children){
        document.getElementById("dropContextMenu").innerHTML = ""
    }
}
//----------------------------------------------------------------------------DROP MENU|

/* 
<div class="contextSection">
<div id="iconCM1" class="iMenuOption"><div style="background-image: url('assets/svg/contextMenu/open.svg');"></div><span>Open</span>
<input type="radio" name="openCheck" class="cmcheck" id="openCheck">
</div>
<div id="iconCM2" class="iMenuOption"><div style="background-image: url('assets/svg/contextMenu/maximize.svg');"></div><span>Open maximized</span>
<input type="radio" name="openCheck" class="cmcheck" id="maxiCheck">
</div>
<div id="iconCM3" class="iMenuOption"><div style="background-image: url('assets/svg/contextMenu/newtab.svg');"></div><span>Open in new tab</span>
<input type="radio" name="openCheck" class="cmcheck" id="newtCheck">
</div>
</div>
*/

//open desk menu on right click background
idBackground.oncontextmenu = e => { if(e.target == idBackground) deskMenu(e) };

//close context menu on mousedown anywhere
window.addEventListener("mousedown", (e) => {
	if (e.target.parentElement.parentElement){
		if(
			e.target.parentElement.classList.contains("contextSection") == false && 
			e.target.parentElement.parentElement.classList.contains("contextSection") == false
		) {
			closeMenu()
			clearSelection()
		}
	} else{
		closeMenu();
	}
});

//open desk menu
function deskMenu(e) {
	e.preventDefault()

	closeMenu()
	idCtextMenu.style.display = "grid"
	idCtextMenu.style.top = e.clientY + idBackground.scrollTop + "px"
	idCtextMenu.style.left = e.clientX + idBackground.scrollLeft + "px"

	idCtextMenu.blur()

	makeDropContext(e,idBackground,idBackground)
}

//close all context menus
function closeMenu() {
	idCtextMenu.style.display = ""

	hideDropContext()
}

//-------------------------------------------------------------------------------------|
idBackground.drop = []

idBackground.drop.push(new contextSection("icon"))
idBackground.drop.push(new contextSection("clip"))
idBackground.drop.push(new contextSection("info"))

idBackground.drop[0].item.push(new contextOption("Grid","url('assets/svg/contextMenu/open.svg')",deskGrid))
idBackground.drop[0].item.push(new contextOption("New","url('assets/svg/contextMenu/maximize.svg')",deskNew))

idBackground.drop[1].item.push(new contextOption("Paste","url('assets/svg/contextMenu/paste.svg')",deskPaste))

idBackground.drop[2].item.push(new contextOption("Settings","url('assets/svg/contextMenu/rename.svg')",deskSettings))
idBackground.drop[2].item.push(new contextOption("Info","url('assets/svg/contextMenu/properties.svg')",deskInfo))
//-------------------------------------------------------------------------------------|

//-------------------------------------------------------------------------------------|
function iconOpen(e, elmnt, _this){
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
function deskGrid(e, elmnt, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Grid");

        loadAPP("./apps/settings_deskGrid/deskGridOptions_launch.html");

        closeMenu();
    }
}
function deskNew(e, elmnt, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("New");
        closeMenu();

        //Make sure icon appears at center of initial right click-------|
        let initialX = parseInt(window.getComputedStyle(document.getElementById("dropContextMenu"),null).getPropertyValue("left"));
        let initialY = parseInt(window.getComputedStyle(document.getElementById("dropContextMenu"),null).getPropertyValue("top"));

        let iconWidth = cfg.desk.grid.width/2;
        let iconHeight = cfg.desk.grid.height/2;

        let w = cfg.desk.grid.width; let h = cfg.desk.grid.height; let wm = cfg.desk.grid.hMargin; let hm = cfg.desk.grid.vMargin;

        let iconPosX = (Math.round((initialX-iconWidth)/(w + wm))*(w + wm) + wm);
        let iconPosY = (Math.round((initialY-iconHeight)/(h + hm))*(h + hm) + hm);
        //--------------------------------------------------------------|

        iconArray.push(new Icon ("background-image: url('assets/svg/desktopIcons/filePlaceholder.svg');", "Name me!", "explorer", 1, iconPosX, iconPosY));
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
function deskPaste(e, elmnt, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Paste");
        closeMenu();
    }
}
function deskSettings(e, elmnt, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Settings");
        closeMenu();
    }
}
function deskInfo(e, elmnt, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Info");
        closeMenu();
    }
}
//-------------------------------------------------------------------------------------|