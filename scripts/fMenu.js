//DROP MENU----------------------------------------------------------------------------|
function findOutMenu(target) {
    let drop = []
    switch (target.apps) {
        default:
        case "exe":
            //drop = exeDrop
            break
        case "mfs":
            //drop = mfsDrop
            break
        case "dir":
            drop = dirDrop
            break
        case "ver":
            drop = verDrop
            break
    }
    return drop
}

//-------------------------------------------------------------------------------------|
var verDrop = []

verDrop.push(new contextSection("icon"))
verDrop.push(new contextSection("clip"))
verDrop.push(new contextSection("info"))

verDrop[0].item.push(new contextOption("Grid","url('assets/svg/contextMenu/open.svg')",deskGrid))
verDrop[0].item.push(new contextOption("New","url('assets/svg/contextMenu/maximize.svg')",deskNew))

verDrop[1].item.push(new contextOption("Paste","url('assets/svg/contextMenu/paste.svg')",deskPaste))

verDrop[2].item.push(new contextOption("Settings","url('assets/svg/contextMenu/rename.svg')",deskSettings))
verDrop[2].item.push(new contextOption("Info","url('assets/svg/contextMenu/properties.svg')",deskInfo))

var dirDrop = []

dirDrop.push(new contextSection("open"))
dirDrop.push(new contextSection("clip"))
dirDrop.push(new contextSection("prop"))

dirDrop[0].item.push(new contextOption("Open","url('assets/svg/contextMenu/open.svg')",iconOpen))
dirDrop[0].item.push(new contextOption("Open in fullscreen","url('assets/svg/contextMenu/maximize.svg')",iconFullscreen))
dirDrop[0].item.push(new contextOption("Open in new tab","url('assets/svg/contextMenu/newtab.svg')",iconNewtab))

dirDrop[1].item.push(new contextOption("Cut","url('assets/svg/contextMenu/cut.svg')",iconCut))
dirDrop[1].item.push(new contextOption("Copy","url('assets/svg/contextMenu/copy.svg')",iconCopy))
dirDrop[1].item.push(new contextOption("Paste","url('assets/svg/contextMenu/paste.svg')",iconPaste))

dirDrop[2].item.push(new contextOption("Delete","url('assets/svg/contextMenu/delete.svg')",iconDelete))
dirDrop[2].item.push(new contextOption("Rename","url('assets/svg/contextMenu/rename.svg')",iconRename))
dirDrop[2].item.push(new contextOption("Properties","url('assets/svg/contextMenu/properties.svg')",iconProperties))
//-------------------------------------------------------------------------------------|

function makeDropContext(e = null,elmnt,_this) {
    let contextArray = findOutMenu(_this)

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

            //no idea why it only worked like this, but it did
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
idDesktop.oncontextmenu = e => { if(e.target == idDesktop) deskMenu(e) };

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
	idCtextMenu.style.top = e.clientY + idDesktop.scrollTop + "px"
	idCtextMenu.style.left = e.clientX + idDesktop.scrollLeft + "px"

	idCtextMenu.blur()

	makeDropContext(e,idDesktop, desktop)
}

//close all context menus
function closeMenu() {
	idCtextMenu.style.display = ""

	hideDropContext()
}

//-------------------------------------------------------------------------------------|
function iconOpen(e, elmnt, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Open")
        closeMenu()

        loadAPP("./apps/filesystem_explorer/explorer_lau.html", [_this.text, _this.file])
    }
}
function iconFullscreen(e, elmnt, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Fullscreen");
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
        console.log("Delete")

        closeMenu()
        deleteSelectedNodes()
    }
}
function iconRename(e, elmnt, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        console.log("Rename")
        closeMenu()
        let iconText = elmnt.childNodes[1]
        //make h3 editable --------------------|
        iconText.setAttribute("contenteditable", "true")
        iconText.setAttribute("spellcheck", "false")
        
        //select h3 content --------------------|
        selectText(iconText)

        iconText.style.textShadow = "none"

        //restore -> leave icon unmodified
        document.body.oncontextmenu = iconRenamingRestore;
        window.onkeydown = (e) => {if(e.key == "Escape"){
            iconRenamingRestore()
            return false
        }};
        function iconRenamingRestore(){
            shouldSelect = true
            
            _this.statNode()

            iconText.textContent = _this.text
            iconText.setAttribute("contenteditable", "false");
            iconText.style.backgroundColor = ""
            iconText.style.textShadow = ""

            iconText.blur();
            clearSelection();

            document.body.oncontextmenu = null
            document.body.onmousedown = null
            document.body.onclick = null
            iconText.onkeydown = null
            window.onkeydown = null
            window.onkeyup = null
        }

        setTimeout( () => {
            document.body.onmousedown = iconRenaming;
            iconText.onkeydown = (e) => {if(e.key == "Enter" && e.shiftKey == false){
                iconRenaming();
                return false;
            }};
            function iconRenaming(){
                if(
                    iconNameExists(iconText.textContent, _this, currentVertex) == false &&
                    iconText.textContent != "¡Name me!" &&
                    iconText.textContent != "" &&
                    iconText.textContent.match(/[\/"]/g) === null
                ) {
                    //if the name is allowed --------------------|
                    shouldSelect = true;

                    iconText.setAttribute("contenteditable", "false")
                    elmnt.id = "Icon: "+iconText.textContent
                    _this.text = iconText.textContent
                    iconText.style.backgroundColor = ""
                    iconText.style.textShadow = ""

                    //insert into fylesystem
                    let getFile = eval(addressInterpreter(_this.file))
                    let getFrom = eval(addressInterpreter(eval(addressInterpreter(_this.file)).conf.from))
                    //
                    renameKey(getFrom.cont, getFile.name, iconText.textContent)
                    getFrom.cont[iconText.textContent].name = iconText.textContent
                    //
                    _this.file = "" + getFrom.conf.icon.file + "/" + iconText.textContent

                    iconText.blur()
                    clearSelection()

                    document.body.oncontextmenu = null
                    document.body.onmousedown = null
                    document.body.onclick = null
                    iconText.onkeydown = null
                    window.onkeydown = null
                    window.onkeyup = null
                } else {
                    //if the name not allowed --------------------|
                    shouldSelect = false;
                    iconText.style.backgroundColor = "#c90000"

                    //insist -> keep only edited selected
                    document.body.onclick = iconRenamingInsist
                    window.onkeyup = (e) => {if(e.key == "Enter"){
                        iconRenamingInsist()
                        return false
                    }};
                    function iconRenamingInsist(){
                        for (i = iconArray.length - 1; i >= 0; i--){
                            iconArray[i].stat = 0
                            iconArray[i].statNode()
                        }
                        _this.statNode(1)
                        _this.stat = 0
        
                        selectText(iconText)
                    }
                }
            }
        }, 1)
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

        loadAPP("./apps/settings_deskGrid/deskGridOptions_lau.html");

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
        let initialX = parseInt(window.getComputedStyle(document.getElementById("dropContextMenu"),null).getPropertyValue("left"))
        let initialY = parseInt(window.getComputedStyle(document.getElementById("dropContextMenu"),null).getPropertyValue("top"))

        let iconWidth = cfg.desk.grid.width/2
        let iconHeight = cfg.desk.grid.height/2

        let w = cfg.desk.grid.width; let h = cfg.desk.grid.height; let wm = cfg.desk.grid.hMargin; let hm = cfg.desk.grid.vMargin

        let iconPosX = (Math.round((initialX-iconWidth)/(w + wm))*(w + wm) + wm)
        let iconPosY = (Math.round((initialY-iconHeight)/(h + hm))*(h + hm) + hm)
        //--------------------------------------------------------------|

        iconArray.push(new Icon ("background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');", "¡Name me!", "dir", 1, iconPosX, iconPosY))
        let createdIcon = iconArray[iconArray.length - 1]
        repositionIcons([createdIcon],true,false)
        createdIcon.createNode()

        let iconText = document.getElementById("Icon: "+createdIcon.text).childNodes[1]
        //make h3 editable --------------------|
        iconText.setAttribute("contenteditable", "true")
        iconText.setAttribute("spellcheck", "false")

        //select h3 content --------------------|
        selectText(iconText)

        iconText.style.textShadow = "none"

        //delete -> cancel icon creation
        document.body.oncontextmenu = iconNamingDelete
        window.onkeydown = (e) => {if(e.key == "Escape"){
            iconNamingDelete()
            return false
        }};
        function iconNamingDelete(){
            shouldSelect = true
                
            createdIcon.deleteNode()

            document.body.oncontextmenu = null
            document.body.onmousedown = null
            document.body.onclick = null
            iconText.onkeydown = null
            window.onkeydown = null
            window.onkeyup = null
        }

        setTimeout( () => {
            document.body.onmousedown = iconNaming;
            iconText.onkeydown = (e) => {if(e.key == "Enter" && e.shiftKey == false){
                iconNaming();
                return false;
            }};

            function iconNaming(){
                if(
                    iconNameExists(iconText.textContent, createdIcon, currentVertex) == false &&
                    iconText.textContent != "¡Name me!" &&
                    iconText.textContent != "" &&
                    iconText.textContent.match(/[\/"]/g) === null
                ) {
                    //if the name is allowed --------------------|
                    shouldSelect = true
        
                    iconText.setAttribute("contenteditable", "false")
                    document.getElementById("Icon: "+createdIcon.text).id = "Icon: "+iconText.textContent
                    createdIcon.text = iconText.textContent
                    iconText.style.backgroundColor = ""
                    iconText.style.textShadow = ""

                    //insert it into filesystem
                    currentVertex.createNewDir(iconText.textContent, {icon : createdIcon, from : currentVertex.conf.icon.file})
        
                    iconText.blur()
                    clearSelection()
        
                    document.body.oncontextmenu = null
                    document.body.onmousedown = null
                    document.body.onclick = null
                    iconText.onkeydown = null
                    window.onkeydown = null
                    window.onkeyup = null
                } else {
                    //if the name not allowed --------------------|
                    shouldSelect = false
                    iconText.style.backgroundColor = "#c90000"
        
                    //insist -> keep only edited selected
                    document.body.onclick = iconNamingInsist
                    window.onkeyup = (e) => {if(e.key == "Enter" && e.shiftKey == false){
                        iconNamingInsist()
                        return false
                    }};
                    function iconNamingInsist(){
                        for (i = iconArray.length - 1; i >= 0; i--){
                            iconArray[i].stat = 0
                            iconArray[i].statNode()
                        }
                        createdIcon.stat = 1
                        createdIcon.statNode()
                        createdIcon.stat = 0

                        selectText(iconText)
                    }
                }
            }
        }, 1);
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

function iconNameExists(text, _this, from){
    for ([name, file] of Object.entries(from.cont)){
        if (file.name == text && file.conf.icon != _this) {
            return true
        }
    }
    return false
}