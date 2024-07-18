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
        case "IconDesk":
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

                newButton.onclick = e => e.preventDefault()
                if (arr[x].item[y].func != undefined) {
                    let index = [x,y]
                    let nbttn = arr[index[0]].item[index[1]]
                    let subms = subMenus
                    if (nbttn.able){
                        newButton.onclick = e => {
                            e.preventDefault()
                            nbttn.func()
                            closeMenu()
                        }
                    } else {
                        newButton.classList.add("disabled")
                    }
                    newButton.onmouseover = e => closeSubOpt(subms)
                } else if (arr[x].item[y].cont != undefined) {
                    let index = [x,y]
                    let nbttn = arr[index[0]].item[index[1]]
                    let subms = subMenus
                    let arg = x+y+z
                    newButton.onmouseover = e => {
                        closeSubOpt(subms)
                        openSubOpt(nbttn, arg, subms)
                    }
                    let newLast = document.createElement("span")
                    newLast.setAttribute("class", "last")
                    //newLast.setAttribute("style", "font-weight: bold")
                    newLast.setAttribute("style", "text-align: right;")
                    newLast.innerHTML = "❯"
                    newButton.appendChild(newLast)
                }
                newButton.onmousedown = e => e.preventDefault()
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

//close context menu on mousedown anywhere
window.addEventListener("mousedown", (e) => {
	if (e.target.parentElement.parentElement){
		if(
			e.target.parentElement.classList.contains("contextSection") == false && 
			e.target.parentElement.parentElement.classList.contains("contextSection") == false &&
            !e.target.contextMenu
		) {
			closeMenu()
			jsc.clearSelection()
		}
	} else{
		closeMenu()
        jsc.clearSelection()
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
        if (contextVar.continuousContext!=undefined) contextVar.continuousContext = true
        contextVar.targetElement.dispatchEvent(eventMenuOpen)
        drop.contextVar = contextVar
    }

    let contextArray = createMenu(e, obj, sections, options)
	makeDropContext(e, obj, newMenu, contextArray)
}

//close all context menus
function closeMenu() {
    if (drop.contextVar) {
        if (drop.contextVar.continuousContext!=undefined) drop.contextVar.continuousContext = false
        drop.contextVar.targetElement.dispatchEvent(eventMenuClose)
        drop.contextVar = null
    }
    document.getElementById("contextLayer").innerHTML = ""
    subMenus = 0
    drop.arr = []
}

//-------------------------------------------------------------------------------------|

function iconProperties(e, _this){}
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
plexos.reg.dropMenu = {}
const drop = plexos.reg.dropMenu
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
    this.section("open").item.push(new contextOption("New window","url('assets/svg/contextMenu/maximize.svg')",e => File.at(target.file).open(),File.at(target.file)!=undefined))

    if (optionList) this.buildMenu(sectionList, optionList)
    
    this.section("clip").item.push(new contextOption("Cut","url('assets/svg/contextMenu/cut.svg')",() => iconCut(e),File.at(target.file)!=undefined))
    this.section("clip").item.push(new contextOption("Copy","url('assets/svg/contextMenu/copy.svg')",() => iconCopy(e),File.at(target.file)!=undefined))
    this.section("clip").item.push(new contextOption("Paste","url('assets/svg/contextMenu/paste.svg')",() => iconPaste(e),File.at(target.file)!=undefined))
    
    this.section("prop").item.push(new contextOption("Delete","url('assets/svg/contextMenu/delete.svg')",() => Task.deleteSelectedNodes(system.mem.var.envfocus.pocket)))
    this.section("prop").item.push(new contextOption("Rename","url('assets/svg/contextMenu/rename.svg')",(e) => target.rename(e),File.at(target.file)!=undefined))
    this.section("prop").item.push(new contextOption("Properties","url('assets/svg/contextMenu/properties.svg')",e => iconProperties(e),File.at(target.file)!=undefined))

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

    this.section("open").item.push(new contextOption("Open","url('assets/svg/contextMenu/open.svg')",() => File.at(target.file).open()!=undefined))

    if (optionList) this.buildMenu(sectionList, optionList)

    this.section("clip").item.push(new contextOption("Cut","url('assets/svg/contextMenu/cut.svg')",() => iconCut(e),File.at(target.file)!=undefined))
    this.section("clip").item.push(new contextOption("Copy","url('assets/svg/contextMenu/copy.svg')",() => iconCopy(e),File.at(target.file)!=undefined))
    this.section("clip").item.push(new contextOption("Paste","url('assets/svg/contextMenu/paste.svg')",() => iconPaste(e),File.at(target.file)!=undefined))
    
    this.section("prop").item.push(new contextOption("Delete","url('assets/svg/contextMenu/delete.svg')",() => Task.deleteSelectedNodes(system.mem.var.envfocus.pocket)))
    this.section("prop").item.push(new contextOption("Rename","url('assets/svg/contextMenu/rename.svg')",() => target.rename(e),File.at(target.file)!=undefined))
    this.section("prop").item.push(new contextOption("Properties","url('assets/svg/contextMenu/properties.svg')",() => iconProperties(e),File.at(target.file)!=undefined))

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