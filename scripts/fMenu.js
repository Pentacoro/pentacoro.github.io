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
function createMenu(e, target, sections, options) {
    let menu = []
    switch (target.constructor.name) {
        case "Icon":
            menu = drop.fileDrop(e,target,sections,options)
            break
        case "IconDir":
            menu = drop.dirDrop(e,target,sections,options)
            break
        case "Task":
            menu = drop.taskDrop(e,target,sections,options)
            break
        default: menu = drop.taskDrop(e,target,sections,options)
    }
    return menu
}

let subMenus = 0

function makeDropContext(e = null, task, node, contextArray) {
    drawMenu(contextArray, node)

    function drawMenu(arr, node) {
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
                    if (nbttn.able){
                        newButton.onclick = e => {
                            nbttn.func()
                            closeMenu()
                        }
                    } else {
                        newButton.onclick = null
                        newButton.classList.add("disabled")
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

            drawMenu(opt.cont, newSub, true)
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
			e.target.parentElement.parentElement.classList.contains("contextSection") == false &&
            !e.target.contextMenu
		) {
			closeMenu()
			clearSelection()
		}
	} else{
		closeMenu()
	}
});

//open context menu
function openMenu(e, obj, sections, options) {
	if (e.preventDefault) e.preventDefault()
    closeMenu()

    let contextVar = e.contextVar || null
    
    let newMenu = document.createElement("div")
    newMenu.setAttribute("class", "clickContext sub_0 shadow")
    document.getElementById("contextLayer").appendChild(newMenu)

    newMenu.style.top  = e.clientY + "px"
    newMenu.style.left = e.clientX + "px"

    if (contextVar) {
        drop.var.contextVar = contextVar
        contextVar.continuousContext = true
    }

    let contextArray = createMenu(e, obj, sections, options)
	makeDropContext(e, obj, newMenu, contextArray)
}

//close all context menus
function closeMenu() {
    if (drop.var.contextVar) {
        drop.var.contextVar.continuousContext = false
        drop.var = {}
    }
    document.getElementById("contextLayer").innerHTML = ""
    subMenus = 0
    drop.arr = []
}

//-------------------------------------------------------------------------------------|

function iconRename(e, _this){
    let iconText = _this.node.childNodes[1]
    let editFile = at(_this.file)
    let editFrom = at(editFile.conf.from)
    //make h3 editable --------------------|
    iconText.setAttribute("contenteditable", "true")
    iconText.setAttribute("spellcheck", "false")
    
    //select h3 content --------------------|
    let exte = iconText.innerText.match(/\.(?:.(?<!\.))+$/s)
    exte = (exte!=null && exte.length > 0) ? exte[0] : ""
    _this.statNode(1)
    _this.stat = 0
    selectText(iconText,0, iconText.innerText.replace(exte,"").length)

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

        iconText.textContent = _this.name
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
            editFile.conf.icon.name = iconText.textContent
            iconText.style.backgroundColor = ""
            iconText.style.textShadow = ""

            //insert into fylesystem
            if (iconText.textContent != editFile.name) { //if the name changed
                editFile.rename(iconText.textContent)
                if (_this.task) {
                    taskid = _this.task
                    task   = system.mem.task(taskid)
                    task.mem.iconArray = task.mem.iconArray.remove(_this)
                    document.getElementsByClassName("list ID_"+taskid)[0].removeChild(_this.node)

                    editFile.render(taskid)
                    _this = task.mem.iconArray[task.mem.iconArray.length-1]

                    if (at(task.mem.address) === sys.vertex){
                        desktop.mem.refresh()
                    }

                    for (icon of task.mem.iconArray) {
                        if (icon.name == iconText.textContent) {
                            icon.statNode(1)
                            task.pocket.push(icon)
                        }
                    }
                }
            }

            _this.statNode(1)
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
                    for (icon of system.mem.task(_this.task).mem.iconArray){
                        icon.statNode(0)
                        system.mem.task(_this.task).pocket = system.mem.task(_this.task).pocket.remove(icon)
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
    }, 0) //TIMEOUT
}
function iconProperties(e, _this){

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
sys.reg.dropMenu = {}
const drop = sys.reg.dropMenu
drop.var = {}
drop.arr = []
drop.section = function (name) {
    return this.arr[this.arr.findIndex(obj => obj.name == name)]
}
//--------------------n //UNVERSAL TASK CUSTOM MENU
drop.taskDrop = function (e,target,sectionList=null,optionList=null) {
    if (sectionList && optionList) { 
        for (section of sectionList) {
            this.arr.push(new contextSection(section.name))
        }
        this.buildMenu(sectionList, optionList)
    } else {
        this.arr.push(new contextSection("info"))
        this.section("info").item.push(new contextOption("Settings","url('assets/svg/contextMenu/settings2.svg')",(e) => {return}))
        this.section("info").item.push(new contextOption("About","url('assets/svg/contextMenu/about.svg')",(e) => {return}))
    }
    return this.arr
}
//--------------------n //DIR ICON EXPLORER MENU
drop.dirDrop = function (e,target,sectionList,optionList) {
    let envfocus = system.mem.var.envfocus

    this.arr.push(new contextSection("open"))
    if (sectionList) { for (section of sectionList) {
        drop.arr.push(new contextSection(section.name))
    }}
    this.arr.push(new contextSection("clip"))
    this.arr.push(new contextSection("prop"))
    
    this.section("open").item.push(new contextOption("Open","url('assets/svg/contextMenu/open.svg')",() => target.open()))
    this.section("open").item.push(new contextOption("New window","url('assets/svg/contextMenu/maximize.svg')",e => at(target.file).open(),at(target.file)!=undefined))

    if (optionList) this.buildMenu(sectionList, optionList)
    
    this.section("clip").item.push(new contextOption("Cut","url('assets/svg/contextMenu/cut.svg')",() => iconCut(e),at(target.file)!=undefined))
    this.section("clip").item.push(new contextOption("Copy","url('assets/svg/contextMenu/copy.svg')",() => iconCopy(e),at(target.file)!=undefined))
    this.section("clip").item.push(new contextOption("Paste","url('assets/svg/contextMenu/paste.svg')",() => iconPaste(e),at(target.file)!=undefined))
    
    this.section("prop").item.push(new contextOption("Delete","url('assets/svg/contextMenu/delete.svg')",() => deleteSelectedNodes(system.mem.var.envfocus.pocket)))
    this.section("prop").item.push(new contextOption("Rename","url('assets/svg/contextMenu/rename.svg')",() => iconRename(e,target),at(target.file)!=undefined))
    this.section("prop").item.push(new contextOption("Properties","url('assets/svg/contextMenu/properties.svg')",e => iconProperties(e),at(target.file)!=undefined))

    return this.arr
}
//--------------------n //UNIVERSAL FILE MENU
drop.fileDrop = function(e,target,sectionList,optionList) {
    sectionList = sectionList || null
    let envfocus = system.mem.var.envfocus 

    this.arr.push(new contextSection("open"))
    if (sectionList) { for (section of sectionList) {
        drop.arr.push(new contextSection(section.name))
    }}
    this.arr.push(new contextSection("clip"))
    this.arr.push(new contextSection("prop"))

    this.section("open").item.push(new contextOption("Open","url('assets/svg/contextMenu/open.svg')",() => at(target.file).open()!=undefined))

    if (optionList) this.buildMenu(sectionList, optionList)

    this.section("clip").item.push(new contextOption("Cut","url('assets/svg/contextMenu/cut.svg')",() => iconCut(e),at(target.file)!=undefined))
    this.section("clip").item.push(new contextOption("Copy","url('assets/svg/contextMenu/copy.svg')",() => iconCopy(e),at(target.file)!=undefined))
    this.section("clip").item.push(new contextOption("Paste","url('assets/svg/contextMenu/paste.svg')",() => iconPaste(e),at(target.file)!=undefined))
    
    this.section("prop").item.push(new contextOption("Delete","url('assets/svg/contextMenu/delete.svg')",() => deleteSelectedNodes(system.mem.var.envfocus.pocket)))
    this.section("prop").item.push(new contextOption("Rename","url('assets/svg/contextMenu/rename.svg')",() => iconRename(e,target),at(target.file)!=undefined))
    this.section("prop").item.push(new contextOption("Properties","url('assets/svg/contextMenu/properties.svg')",() => iconProperties(e),at(target.file)!=undefined))

    return this.arr
    //--------------------n
}
drop.buildMenu = function (sectionList, optionList) {
    for (option of optionList) { for (section of sectionList) { if (section.name === option.section) {
        this.section(section.name).item.push(this.buildContextObject(option))
    }}}
}
drop.buildContextObject = function (option) {
    //Check wether it's an option or a submenu
            if (typeof option.func === "function") {
        option.able = option.able!=undefined ? option.able : true
        let contextOpt = new contextOption(option.name, option.icon, option.func, option.able)
        return contextOpt
    }  else if (Array.isArray(option.func)) {
        let contextSub = new contextSubmenu(option.name, option.icon, option.func.map(opt=> this.buildContextObject(opt)))
        return contextSub
    }
}

//-------------------------------------------------------------------------------------|