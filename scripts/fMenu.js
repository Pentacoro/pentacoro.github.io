//javascript.js
//f.js
//fIcons.js
//fIconsDir.js
//fDirectories.js
//fWindows.js

class contextOption {
    constructor(name, icon, func, able = true){
        this.name = name
        this.icon = icon
        this.func = func 
        this.able = able
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
function findOutMenu(e, target) {
    let menu = []
    switch (target.apps) {
        default:
        case "lau":
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
            menu = drop.expDrop(e,target)
            break
        case "dir":
            if(!target.task ) menu = drop.dirDrop1(e,target)
            if( target.task ) menu = drop.dirDrop2(e,target)
            break
        case "vtx":
            if( target.from === "sys" ) menu = drop.verDrop(e,target)
            break
    }
    return menu
}

let subMenus = 0

function makeDropContext(e = null, task, node) {
    let contextArray = findOutMenu(e, task)

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
                    let index = [x,y]
                    let nbttn = arr[index[0]].item[index[1]]
                    let subms = subMenus
                    newButton.onclick     = e => {
                        nbttn.func()
                        closeMenu()
                    }
                    newButton.onmouseover = e => closeSubOpt(subms)
                } else if (arr[x].item[y].cont != undefined) {
                    let index = [x,y]
                    let nbttn = arr[index[0]].item[index[1]]
                    let subms = subMenus
                    let arg = x+y+z
                    newButton.onmouseover = e => openSubOpt(nbttn, arg, subms)

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
            for (let subM of document.getElementsByClassName("clickContext")) {
                if (subM.classList[1].match(/[sub_](\d+)/)) {
                    classInt = parseInt(subM.classList[1].match(/(\d+)/)[0])
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

            //make submenu option stay hover colored
            if (!from.classList.contains("hover")) from.classList.add("hover")

            let newSub = document.createElement("div")
            newSub.setAttribute("class", "clickContext sub_" + subMenus + " subMenu shadow")
            document.getElementById("contextLayer").appendChild(newSub)

            //position of submenu
            newSub.style.left  = rect1.left + menu.offsetWidth - 1 + "px"
            newSub.style.top   = rect2.top - 1 + "px"
            newSub.style.minWidth = main.offsetWidth - main.offsetWidth / 3 + "px"

            buildMenu(opt.cont, newSub, true)
        }

        function closeSubOpt(trigger) {
            //
            let delArr = []
            //add every submenu up to trigger to deletion queue
            for (menu of document.getElementsByClassName("clickContext")) {
                classInt = menu.classList[1].match(/(\d+)/)[0]
                if (classInt > trigger) {
                    delArr.push(menu)
                }
            }
            for (item of delArr) {
                item.parentElement.removeChild(item)
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
    drop.arr = []
}

//-------------------------------------------------------------------------------------|

function iconRename(e, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {
        let iconText = _this.node.childNodes[1]
        let editFile = at(_this.file)
        let editFrom = at(editFile.conf.from)
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
            system.mem.var.shSelect = true
            
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
                    system.mem.var.shSelect = true;

                    if (editFrom === sys.vertex) _this.node.id = "Icon: "+iconText.textContent

                    iconText.setAttribute("contenteditable", "false")
                    editFile.conf.icon.text = iconText.textContent
                    iconText.style.backgroundColor = ""
                    iconText.style.textShadow = ""

                    //insert into fylesystem
                    if (iconText.textContent != editFile.name) { //if the name changed
                        editFile.rename(iconText.textContent)
                        if (_this.task) {
                            taskid = _this.task
                            task   = task(taskid)
                            task.mem.explorerInit(task.mem.directory, taskid)

                            if (at(task.mem.directory) === sys.vertex){
                                desktop.mem.refresh()
                            }

                            for (icon of task.mem.iconArray) {
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
                    system.mem.var.shSelect = false
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
                            for (icon of task(_this.task).mem.iconArray){
                                icon.statNode(0)
                                task(_this.task).pocket = task(_this.task).pocket.remove(icon)
                            }
                        } else {
                            for (icon of desktop.mem.iconArr){
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
        }, 0)
    }
}
function iconProperties(e, _this){
    if(
        !(e.target.classList.contains("cmcheck"))
    ) {

    }
}
//-------------------------------------------------------------------------------------|
function dirIconOpen(e, _this){
    task(_this.task).mem.explorerInit(_this.file, _this.task)
}
function dirIconNewWindow(e, _this){
    explorerInit(_this.file, _this.task)
}
//-------------------------------------------------------------------------------------|

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
sys.reg.dropMenu = {arr: []}
const drop = sys.reg.dropMenu
//--------------------n //DESKTOP MENU
drop.verDrop = function (e,target) {
    let envfocus = system.mem.var.envfocus

    drop.arr.push(new contextSection("view"))
    drop.arr.push(new contextSection("file"))
    drop.arr.push(new contextSection("info"))
    
    drop.arr[0].item.push(new contextSubmenu("Grid","url('assets/svg/contextMenu/grid2.svg')",     
        [                                                                            
            new contextOption("Auto Grid","url('assets/svg/contextMenu/autogrid.svg')",() => loadAPP("./apps/settings_deskGrid/deskGridOptions_lau.js")),
            new contextOption("Auto Margin","url('assets/svg/contextMenu/automargin.svg')",() => loadAPP("./apps/settings_deskGrid/deskGridOptions_lau.js")),
            new contextOption("Grid Settings","url('assets/svg/contextMenu/gridsettings.svg')",() => loadAPP("./apps/settings_deskGrid/deskGridOptions_lau.js")),
        ]
    ))
    drop.arr[0].item.push(new contextOption("Refresh","url('assets/svg/contextMenu/refresh.svg')",desktop.mem.refresh))
    
    drop.arr[1].item.push(new contextSubmenu("New","url('assets/svg/contextMenu/new2.svg')",     
        [                                                                            
            new contextOption("Directory","url('assets/svg/contextMenu/directory.svg')",() => desktop.mem.new(e,target,Directory)),
            new contextOption("Metafile","url('assets/svg/contextMenu/metafile.svg')", () => desktop.mem.new(e,target,Metafile)),
        ]
    ))
    drop.arr[1].item.push(new contextOption("Paste","url('assets/svg/contextMenu/paste.svg')",(e) => {return}))
    
    drop.arr[2].item.push(new contextOption("Settings","url('assets/svg/contextMenu/settings2.svg')",(e) => {return}))
    drop.arr[2].item.push(new contextOption("About","url('assets/svg/contextMenu/about.svg')",(e) => {return}))

    return drop.arr
}
//--------------------n //EXPLORER MENU
drop.expDrop = function (e,target) {
    let envfocus = system.mem.var.envfocus

    drop.arr.push(new contextSection("icon"))
    drop.arr.push(new contextSection("clip"))
    drop.arr.push(new contextSection("info"))
    
    drop.arr[0].item.push(new contextOption("View","url('assets/svg/contextMenu/grid.svg')",envfocus.mem.refresh))
    drop.arr[0].item.push(new contextOption("Refresh","url('assets/svg/contextMenu/refresh.svg')",envfocus.mem.refresh))
    
    drop.arr[1].item.push(new contextSubmenu("New","url('assets/svg/contextMenu/new2.svg')",     
        [                                                                            
            new contextOption("Directory","url('assets/svg/contextMenu/directory.svg')",() => envfocus.mem.new(e,task(target.task),Directory)),
            new contextOption("Metafile","url('assets/svg/contextMenu/metafile.svg')", () => envfocus.mem.new(e,task(target.task),Metafile)),
        ]
    ))
    drop.arr[1].item.push(new contextOption("Paste","url('assets/svg/contextMenu/paste.svg')", (e) => {return}))
    
    drop.arr[2].item.push(new contextOption("About","url('assets/svg/contextMenu/about.svg')", (e) => {return}))
    drop.arr[2].item.push(new contextOption("Properties","url('assets/svg/contextMenu/properties.svg')",(e) => {return}))

    return drop.arr
}
//--------------------n //DIR ICON DESKTOP MENU
drop.dirDrop1 = function(e,target) {
    let envfocus = system.mem.var.envfocus 

    drop.arr.push(new contextSection("open"))
    drop.arr.push(new contextSection("clip"))
    drop.arr.push(new contextSection("prop"))
    
    drop.arr[0].item.push(new contextOption("Open","url('assets/svg/contextMenu/open.svg')",() => at(target.file).open()))
    
    drop.arr[1].item.push(new contextOption("Cut","url('assets/svg/contextMenu/cut.svg')",() => iconCut(e)))
    drop.arr[1].item.push(new contextOption("Copy","url('assets/svg/contextMenu/copy.svg')",() => iconCopy(e)))
    drop.arr[1].item.push(new contextOption("Paste","url('assets/svg/contextMenu/paste.svg')",() => iconPaste(e)))
    
    drop.arr[2].item.push(new contextOption("Delete","url('assets/svg/contextMenu/delete.svg')",() => deleteSelectedNodes(system.mem.var.envfocus.pocket)))
    drop.arr[2].item.push(new contextOption("Rename","url('assets/svg/contextMenu/rename.svg')",() => iconRename(e,target)))
    drop.arr[2].item.push(new contextOption("Properties","url('assets/svg/contextMenu/properties.svg')",e => iconProperties(e)))

    return drop.arr
}
//--------------------n //DIR ICON EXPLORER MENU
drop.dirDrop2 = function (e,target) {
    let envfocus = system.mem.var.envfocus

    drop.arr.push(new contextSection("open"))
    drop.arr.push(new contextSection("clip"))
    drop.arr.push(new contextSection("prop"))
    
    drop.arr[0].item.push(new contextOption("Open","url('assets/svg/contextMenu/open.svg')",() => dirIconOpen(e)))
    drop.arr[0].item.push(new contextOption("New window","url('assets/svg/contextMenu/maximize.svg')",e => iconOpen(e)))
    
    drop.arr[1].item.push(new contextOption("Cut","url('assets/svg/contextMenu/cut.svg')",() => iconCut(e)))
    drop.arr[1].item.push(new contextOption("Copy","url('assets/svg/contextMenu/copy.svg')",() => iconCopy(e)))
    drop.arr[1].item.push(new contextOption("Paste","url('assets/svg/contextMenu/paste.svg')",() => iconPaste(e)))
    
    drop.arr[2].item.push(new contextOption("Delete","url('assets/svg/contextMenu/delete.svg')",() => deleteSelectedNodes(system.mem.var.envfocus.pocket)))
    drop.arr[2].item.push(new contextOption("Rename","url('assets/svg/contextMenu/rename.svg')",() => iconRename(e,target)))
    drop.arr[2].item.push(new contextOption("Properties","url('assets/svg/contextMenu/properties.svg')",e => iconProperties(e)))

    return drop.arr
}
//--------------------n //MSF ICON DESKTOP MENU
drop.msfDrop = function(e,target) {
    let envfocus = system.mem.var.envfocus 

    drop.arr.push(new contextSection("open"))
    drop.arr.push(new contextSection("clip"))
    drop.arr.push(new contextSection("prop"))
    
    drop.arr[0].item.push(new contextOption("Open","url('assets/svg/contextMenu/open.svg')",() => iconOpen(e)))
    drop.arr[0].item.push(new contextOption("Open","url('assets/svg/contextMenu/open.svg')",() => iconOpen(e)))
    drop.arr[0].item.push(new contextOption("Open","url('assets/svg/contextMenu/open.svg')",() => iconOpen(e)))
    
    drop.arr[1].item.push(new contextOption("Cut","url('assets/svg/contextMenu/cut.svg')",() => iconCut(e)))
    drop.arr[1].item.push(new contextOption("Copy","url('assets/svg/contextMenu/copy.svg')",() => iconCopy(e)))
    drop.arr[1].item.push(new contextOption("Paste","url('assets/svg/contextMenu/paste.svg')",() => iconPaste(e)))
    
    drop.arr[2].item.push(new contextOption("Delete","url('assets/svg/contextMenu/delete.svg')",() => deleteSelectedNodes(system.mem.var.envfocus.pocket)))
    drop.arr[2].item.push(new contextOption("Rename","url('assets/svg/contextMenu/rename.svg')",() => iconRename(e)))
    drop.arr[2].item.push(new contextOption("Properties","url('assets/svg/contextMenu/properties.svg')",() => iconProperties(e)))

    return drop.arr
    //--------------------n
}

//-------------------------------------------------------------------------------------|