//javascript.js
//f.js
//fIcons.js
//fIconsDir.js
//fDirectories.js
//fWindows.js

class contextOption {
    constructor(name, icon, func){
        this.name = name
        this.icon = icon
        this.func = func 
    }
}
class contextSubmenu {
    constructor(name, icon, cont){
        this.name = name
        this.icon = icon
        this.cont = [new contextSection("sub")]
        this.cont[0].item = cont 
    }
}
class contextSection {
    constructor(name = null, item = []){
        this.name = name
        this.item = item
    }
}

//DROP MENU----------------------------------------------------------------------------|
function findOutMenu(target) {
    let drop = []
    switch (target.apps) {
        default:
        case "exe":
            //drop = exeDrop
            break
        case "ifr":
            //drop = mfsDrop
            break
        case "img":
            //drop = mfsDrop
            break
        case "vid":
            //drop = mfsDrop
            break
        case "snd":
            //drop = mfsDrop
            break
        case "exp":
            drop = expDrop
            break
        case "dir":
            if(!target.task ) drop = dirDrop1
            if( target.task ) drop = dirDrop2
            break
        case "ver":
            drop = verDrop
            break
    }
    return drop
}

let subMenus = 0

function makeDropContext(e = null,_this, node) {
    let contextArray = findOutMenu(_this)

    buildMenu(contextArray, node)

    function buildMenu(arr, node) {
        //id-number-magic
        let x = 0
        let z = 1
        
        //for each section
        for(section of arr) {
            let newSection = document.createElement("div")
            newSection.classList.add("contextSection")

            //id-number-magic
            let y = 0

            //for each item
            for(item of section.item) {
                let id = "drop_" + subMenus + "_" + (x + y + z)

                let newButton = document.createElement("div")
                newButton.id = id
                newButton.classList.add("dropOpt")
                
                let newIcon = document.createElement("div")
                newIcon.style.backgroundImage = item.icon
                let newText = document.createElement("span")
                newText.innerHTML = item.name
        
                newButton.appendChild(newIcon)
                newButton.appendChild(newText)

                newSection.appendChild(newButton)

                if (arr[x].item[y].func != undefined) {
                    //no idea why it only worked like this, but it did 
                    //FUTURE ASCENDED SEBAS: because it catches variables in place with let declaration
                    let pls = [x,y]
                    let arg = [e,_this]
                    let sub = subMenus
                    newButton.onclick     = e => arr[pls[0]].item[pls[1]].func(arg[0], arg[1], arg[2])
                    newButton.onmouseover = e => closeSubOpt(sub)
                } else if (arr[x].item[y].cont != undefined) {
                    let pls = [x,y]
                    let arg = x+y+z
                    let sub = subMenus
                    newButton.onmouseover  = e => openSubOpt(arr[pls[0]].item[pls[1]], arg, sub)

                    let newLast = document.createElement("span")
                    newLast.setAttribute("class", "last")
                    //newLast.setAttribute("style", "font-weight: bold")
                    newLast.setAttribute("style", "text-align: right;")
                    newLast.innerHTML = "❯"
                    newButton.appendChild(newLast)
                }

                //id-number-magic
                y++
            }

            //get on document
            node.appendChild(newSection)

            //id-number-magic
            z = z + (section.item.length - 1)
            x++
        }
        //bottom border
        let bottomSection = document.createElement("div")
        bottomSection.classList.add("contextSection")
        node.appendChild(bottomSection)
        
        function openSubOpt(opt, optPos, sub) {
            //check if submenu isn't open already
            for (drop of document.getElementsByClassName("clickContext")) {
                if (drop.classList[1].match(/[sub_](\d+)/)) {
                    classInt = parseInt(drop.classList[1].match(/(\d+)/)[0])
                    if (classInt > sub) return
                }
            }
            //references to main menu and submenu option
            let main  = document.getElementsByClassName("clickContext sub_0")[0]
            let menu  = document.getElementsByClassName("clickContext sub_" + subMenus)[0]
            let rect1 = menu.getBoundingClientRect()
            let from  = document.getElementById("drop_" + subMenus + "_" + optPos)
            let rect2 = from.getBoundingClientRect()

            subMenus++

            if (!from.classList.contains("hover")) from.classList.add("hover")

            let newSub = document.createElement("div")
            newSub.setAttribute("class", "clickContext sub_" + subMenus)
            document.getElementById("contextLayer").appendChild(newSub)

            //position of submenu
            newSub.style.left  = rect1.left + menu.offsetWidth - 1 + "px"
            newSub.style.top   = rect2.top - 1 + "px"
            newSub.style.width = main.offsetWidth - main.offsetWidth / 3 + "px"

            buildMenu(opt.cont, newSub, true)
        }

        function closeSubOpt(trigger) {
            //
            let delArr = []
            for (menu of document.getElementsByClassName("clickContext")) {
                classInt = menu.classList[1].match(/(\d+)/)[0]
                if (classInt > trigger) {
                    delArr.push(menu)
                }
            }
            for (men of delArr) {
                men.parentElement.removeChild(men)
            }
            //remove hover class from previous menu
            for (sect of document.getElementsByClassName("sub_"+(trigger))[0].children){
                for (opt of sect.children) {
                    if (opt.classList.contains("hover")) opt.classList.remove("hover")
                }
            }
        
            subMenus = trigger
        }
    }
}

function hideDropContext() {
    let menu = document.getElementsByClassName("clickContext")[0]
    menu.parentElement.removeChild(menu)
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
		closeMenu()
	}
});

//open context menu
function openMenu(e, obj) {
	e.preventDefault()

	closeMenu()

    let newMenu = document.createElement("div")
    newMenu.setAttribute("class", "clickContext sub_0")
    document.getElementById("contextLayer").appendChild(newMenu)

    newMenu.style.top  = e.clientY + "px"
    newMenu.style.left = e.clientX + "px"

	makeDropContext(e, obj, newMenu)
}

//close all context menus
function closeMenu() {
    document.getElementById("contextLayer").innerHTML = ""
    subMenus = 0
}

//-------------------------------------------------------------------------------------|
function iconOpen(e, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        //console.log("Open")
        closeMenu()

        loadAPP("./apps/filesystem_explorer/explorer_lau.html", [_this.text, _this.file])
    }
}
function iconFullscreen(e, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        //console.log("Fullscreen");
        closeMenu();
    }
}
function iconNewtab(e, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        //console.log("Newtab");
        closeMenu();
    }
}
function iconCut(e, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        //console.log("Cut");
        closeMenu();
    }
}
function iconCopy(e, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        //console.log("Copy");
        closeMenu();
    }
}
function iconPaste(e, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        //console.log("Paste");
        closeMenu();
    }
}
function iconDelete(e, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        //console.log("Delete")

        closeMenu()
        deleteSelectedNodes(envfocus.pocket)
    }
}
function iconRename(e, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        //console.log("Rename")
        closeMenu()
        let iconText = _this.node.childNodes[1]
        let editFile = addressInterpreter(_this.file)
        let editFrom = addressInterpreter(editFile.conf.from)
        //make h3 editable --------------------|
        iconText.setAttribute("contenteditable", "true")
        iconText.setAttribute("spellcheck", "false")
        
        //select h3 content --------------------|
        selectText(iconText)

        iconText.style.textShadow = "none"
        iconText.style.display = "block"

        //restore -> leave icon unmodified
        document.body.oncontextmenu = iconRenamingRestore
        window.onkeydown = (e) => {if(e.key == "Escape"){
            iconRenamingRestore()
            return false
        }}
        function iconRenamingRestore(){
            shouldSelect = true
            
            _this.statNode()

            iconText.textContent = _this.text
            iconText.setAttribute("contenteditable", "false");
            iconText.style.backgroundColor = ""
            iconText.style.textShadow = ""

            iconText.blur();
            clearSelection();

            nullifyOnEvents(iconText)
        }

        setTimeout( () => {
            document.body.onmousedown = iconRenaming
            iconText.onkeydown = (e) => {
                if(e.key == "Enter" && e.shiftKey == false){
                    iconRenaming()
                    return false
                }
            }
            function iconRenaming(){
                if(
                    !iconNameExists(iconText.textContent, editFile.conf.icon, editFrom) &&
                    validIconName(iconText.textContent)
                ) {
                    //if the name is allowed --------------------|
                    shouldSelect = true;

                    if (editFrom === currentVertex) _this.node.id = "Icon: "+iconText.textContent

                    iconText.setAttribute("contenteditable", "false")
                    editFile.conf.icon.text = iconText.textContent
                    iconText.style.backgroundColor = ""
                    iconText.style.textShadow = ""

                    //insert into fylesystem
                    if (iconText.textContent != editFile.name) { //if the name changed
                        editFile.renameMe(iconText.textContent)
                        if (_this.task) {
                            taskid = _this.task
                            task   = findTask(taskid)
                            task.memory.explorerInit(task.memory.directory, taskid)

                            if (addressInterpreter(task.memory.directory) === currentVertex){
                                deskRefresh(e, currentVertex)
                            }

                            for (icon of task.memory.iconArray) {
                                if (icon.text == iconText.textContent) {
                                    icon.statNode(1)
                                    task.pocket.push(icon)
                                }
                            }
                        }
                    }

                    iconText.blur()
                    clearSelection()

                    nullifyOnEvents(iconText)
                } else {
                    //if the name not allowed --------------------|
                    shouldSelect = false
                    iconText.style.backgroundColor = "#c90000"

                    //insist -> keep only edited selected
                    document.body.onclick = iconRenamingInsist
                    window.onkeyup = (e) => {
                        if(e.key == "Enter"){
                            iconRenamingInsist()
                            return false
                        }
                    }
                    function iconRenamingInsist(){
                        if (_this.task) {
                            for (icon of findTask(_this.task).memory.iconArray){
                                icon.statNode(0)
                                findTask(_this.task).pocket = findTask(_this.task).pocket.remove(icon)
                            }
                        } else {
                            for (icon of desktop.memory.iconArray){
                                icon.statNode(0)
                                desktop.pocket = desktop.pocket.remove(icon)
                            }
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
function iconProperties(e, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        //console.log("Properties");
        closeMenu();
    }
}
//-------------------------------------------------------------------------------------|
function dirIconOpen(e, _this){
    closeMenu()
    findTask(_this.task).memory.explorerInit(_this.file, _this.task)
}
function dirIconNewWindow(e, _this){
    closeMenu()
    explorerInit(_this.file, _this.task)
}
//-------------------------------------------------------------------------------------|
function deskGrid(e, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        //console.log("Grid");

        loadAPP("./apps/settings_deskGrid/deskGridOptions_lau.html");

        closeMenu();
    }
}
function deskRefresh(e, _this){
    closeMenu()

    desktop.pocket = []

    document.getElementById("desktop").children[2].innerHTML = ""

    for (icon of desktop.memory.iconArray) {
        icon.createNode()
        icon.statNode(0)
    }

}
function deskNew(e, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        //console.log("New")

        //Make sure icon appears at center of initial right click-------|
        let initialX = parseInt(window.getComputedStyle(document.getElementsByClassName("clickContext sub_0")[0],null).getPropertyValue("left"))
        let initialY = parseInt(window.getComputedStyle(document.getElementsByClassName("clickContext sub_0")[0],null).getPropertyValue("top"))

        closeMenu()
        let editFile = addressInterpreter(_this.file)
        let editFrom = addressInterpreter(editFile.conf.from)

        let iconWidth = cfg.desk.grid.width/2
        let iconHeight = cfg.desk.grid.height/2

        let w = cfg.desk.grid.width; let h = cfg.desk.grid.height; let wm = cfg.desk.grid.hMargin; let hm = cfg.desk.grid.vMargin

        let iconPosX = (Math.round((initialX-iconWidth)/(w + wm))*(w + wm) + wm)
        let iconPosY = (Math.round((initialY-iconHeight)/(h + hm))*(h + hm) + hm)
        //--------------------------------------------------------------|

        let iconArray = desktop.memory.iconArray

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

            nullifyOnEvents(_this)
        }

        setTimeout( () => {
            document.body.onmousedown = iconNaming;
            iconText.onkeydown = (e) => {if(e.key == "Enter" && e.shiftKey == false){
                iconNaming();
                return false;
            }};

            function iconNaming(){
                if(
                    !iconNameExists(iconText.textContent, editFile.conf.icon, editFrom) &&
                    validIconName(iconText.textContent)
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

                    //insert it into desktop memory
                    desktop.memory.iconArray.push(createdIcon)
        
                    iconText.blur()
                    clearSelection()
        
                    nullifyOnEvents(_this)
                } else {
                    //if the name not allowed --------------------|
                    shouldSelect = false
                    iconText.style.backgroundColor = "#c90000"
        
                    //insist -> keep only edited selected
                    document.body.onclick = iconNamingInsist
                    window.onkeyup = (e) => {if(e.key == "Enter" && e.shiftKey == false){
                        iconNamingInsist()
                        return false
                    }}
                    function iconNamingInsist(){
                        for (icon of desktop.memory.iconArray){
                            icon.statNode(0)
                        }
                        createdIcon.statNode(1)
                        createdIcon.stat = 0

                        selectText(iconText)
                    }
                }
            }
        }, 1);
    }
}
function deskPaste(e, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        //console.log("Paste");
        closeMenu();
    }
}
function deskSettings(e, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        //console.log("Settings");
        closeMenu();
    }
}
function deskInfo(e, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        //console.log("Info");
        closeMenu();
    }
}
//-------------------------------------------------------------------------------------|

function nullifyOnEvents(rawr) {
    document.body.oncontextmenu = null
    document.body.onmousedown = null
    document.body.onclick = null
    rawr.onkeydown = null
    window.onkeydown = null
    window.onkeyup = null
}

//-------------------------------------------------------------------------------------|
//--------------------n
var verDrop = []

verDrop.push(new contextSection("view"))
verDrop.push(new contextSection("file"))
verDrop.push(new contextSection("info"))

verDrop[0].item.push(new contextOption("Grid","url('assets/svg/contextMenu/open.svg')",deskGrid))
verDrop[0].item.push(new contextOption("Refresh","url('assets/svg/contextMenu/open.svg')",deskRefresh))

verDrop[1].item.push(new contextSubmenu("New","url('assets/svg/contextMenu/maximize.svg')",     
    [                                                                            
        new contextOption("Directory","url('assets/svg/contextMenu/maximize.svg')",deskNew),
        new contextOption("Launcher","url('assets/svg/contextMenu/maximize.svg')",deskNew),
        new contextOption("Metafile","url('assets/svg/contextMenu/maximize.svg')", deskNew),
    ]
))
verDrop[1].item.push(new contextOption("Paste","url('assets/svg/contextMenu/paste.svg')",deskPaste))

verDrop[2].item.push(new contextOption("Settings","url('assets/svg/contextMenu/rename.svg')",deskSettings))
verDrop[2].item.push(new contextOption("Info","url('assets/svg/contextMenu/properties.svg')",deskInfo))
//--------------------n
var expDrop = []

expDrop.push(new contextSection("icon"))
expDrop.push(new contextSection("clip"))
expDrop.push(new contextSection("info"))


expDrop[0].item.push(new contextOption("View","url('assets/svg/contextMenu/open.svg')",deskGrid))
expDrop[0].item.push(new contextOption("Refresh","url('assets/svg/contextMenu/open.svg')",deskRefresh))

expDrop[1].item.push(new contextSubmenu("New","url('assets/svg/contextMenu/maximize.svg')",     
    [                                                                            
        new contextOption("Directory","url('assets/svg/contextMenu/maximize.svg')",deskNew),
        new contextOption("Launcher","url('assets/svg/contextMenu/maximize.svg')",deskNew),
        new contextOption("Metafile","url('assets/svg/contextMenu/maximize.svg')", deskNew),
    ]
))
expDrop[1].item.push(new contextOption("Paste","url('assets/svg/contextMenu/paste.svg')",deskPaste))

expDrop[2].item.push(new contextOption("Info","url('assets/svg/contextMenu/properties.svg')",deskInfo))
expDrop[2].item.push(new contextOption("Properties","url('assets/svg/contextMenu/properties.svg')",deskSettings))
//--------------------n
var dirDrop1 = []

dirDrop1.push(new contextSection("open"))
dirDrop1.push(new contextSection("clip"))
dirDrop1.push(new contextSection("prop"))

dirDrop1[0].item.push(new contextOption("Open","url('assets/svg/contextMenu/open.svg')",iconOpen))

dirDrop1[1].item.push(new contextOption("Cut","url('assets/svg/contextMenu/cut.svg')",iconCut))
dirDrop1[1].item.push(new contextOption("Copy","url('assets/svg/contextMenu/copy.svg')",iconCopy))
dirDrop1[1].item.push(new contextOption("Paste","url('assets/svg/contextMenu/paste.svg')",iconPaste))

dirDrop1[2].item.push(new contextOption("Delete","url('assets/svg/contextMenu/delete.svg')",iconDelete))
dirDrop1[2].item.push(new contextOption("Rename","url('assets/svg/contextMenu/rename.svg')",iconRename))
dirDrop1[2].item.push(new contextOption("Properties","url('assets/svg/contextMenu/properties.svg')",iconProperties))
//--------------------n
var dirDrop2 = []

dirDrop2.push(new contextSection("open"))
dirDrop2.push(new contextSection("clip"))
dirDrop2.push(new contextSection("prop"))

dirDrop2[0].item.push(new contextOption("Open","url('assets/svg/contextMenu/open.svg')",dirIconOpen))
dirDrop2[0].item.push(new contextOption("Open in new window","url('assets/svg/contextMenu/maximize.svg')",iconOpen))

dirDrop2[1].item.push(new contextOption("Cut","url('assets/svg/contextMenu/cut.svg')",iconCut))
dirDrop2[1].item.push(new contextOption("Copy","url('assets/svg/contextMenu/copy.svg')",iconCopy))
dirDrop2[1].item.push(new contextOption("Paste","url('assets/svg/contextMenu/paste.svg')",iconPaste))

dirDrop2[2].item.push(new contextOption("Delete","url('assets/svg/contextMenu/delete.svg')",iconDelete))
dirDrop2[2].item.push(new contextOption("Rename","url('assets/svg/contextMenu/rename.svg')",iconRename))
dirDrop2[2].item.push(new contextOption("Properties","url('assets/svg/contextMenu/properties.svg')",iconProperties))
//--------------------n
//-------------------------------------------------------------------------------------|