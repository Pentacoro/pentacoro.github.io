import {plexos} from "/plexos/ini/system.js"
import Task from "../system/task.js" //file explorer deletion
import File from "../files/file.js"

export default class ContextMenu {
    static configAddr = "/config/context"
    static contextVar = null
    static subMenus   = 0
    static target     = null
    static node       = null
    static menu       = []

    //open context menu
    static open = function(e, target, menu=null) {
        if (e.preventDefault) e.preventDefault()
        ContextMenu.close()

        ContextMenu.target = target
        let contextVar = e.contextVar || null
        
        let newMenu = document.createElement("div")
        newMenu.setAttribute("class", "clickContext sub_0 shadow")
        document.getElementById("contextLayer").appendChild(newMenu)
        ContextMenu.node = newMenu

        newMenu.style.top  = e.clientY + "px"
        newMenu.style.left = e.clientX + "px"

        //handle hover context transfer
        if (contextVar) {
            if (contextVar.continuousContext!=undefined) contextVar.continuousContext = true
            //contextVar.targetElement.dispatchEvent(contextMenuOpen)
            ContextMenu.contextVar = contextVar
        }

        let contextArray = ContextMenu.applyTemplates(e, target, menu)
        ContextMenu.draw(newMenu, contextArray)
    }
    //close all context menus
    static close = function() {
        //handle hover context transfer
        if (ContextMenu.contextVar) {
            if (ContextMenu.contextVar.continuousContext!=undefined) ContextMenu.contextVar.continuousContext = false
            //ContextMenu.contextVar.targetElement.dispatchEvent(contextMenuClose)
            ContextMenu.contextVar = null
        }
        document.getElementById("contextLayer").innerHTML = ""
        ContextMenu.subMenus = 0
        ContextMenu.target   = null
        ContextMenu.node     = null
        ContextMenu.menu     = []
    }
    static applyTemplates = function (e, target, menu=null) {
        let menuTemplates = eval(File.at(ContextMenu.configAddr + "/templates.js").data)
        //find matching template class
        for (let template of menuTemplates) {
            if (target.constructor.name === template.class) {
                if (menu!==null) template.menu.map(section=>{
                    for (let item of menu) if (section.name===item.name) {
                        section.list = item.list
                    }
                })
                if (menu!==null) for (let item of menu) {
                    if (!template.menu.find(section=>section.name===item.name)) template.menu.splice(template.menu.indexOf(template.menu.find(section=>section.name==="null")),0,item)
                }
                template.menu = template.menu.filter(section=>section.name!=="null")
                return template.menu
            }
        }
        //if for failed to return use default
        if (menu) return menu
        //if there's no menu, use default template
        return menuTemplates[menuTemplates.indexOf(menuTemplates.find(temp=>temp.class==="Default"))]
    }

    static draw = function(node, arr) {
        //id-number-magic
        let x = 0
        let z = 1

        let classInt = 0
        
        //for each section
        for(let section of arr) {
            let newSection = document.createElement("div")
            newSection.classList.add("contextSection")

            //id-number-magic
            let y = 0

            //for each item
            for(let item of section.list) {
                let id = "drop_" + ContextMenu.subMenus + "_" + (x + y + z)

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
                if (typeof arr[x].list[y].func  === "function") {
                    let index = [x,y]
                    let nbttn = arr[index[0]].list[index[1]]
                    let subms = ContextMenu.subMenus
                    if (nbttn.bool==undefined||nbttn.bool){
                        newButton.onclick = e => {
                            e.preventDefault()
                            nbttn.func()
                            ContextMenu.close()
                        }
                    } else {
                        newButton.classList.add("disabled")
                    }
                    newButton.onmouseover = e => closeSubOpt(subms)
                } else if (Array.isArray(arr[x].list[y].func)) {
                    let index = [x,y]
                    let nbttn = arr[index[0]].list[index[1]]
                    let subms = ContextMenu.subMenus
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
            z = z + (section.list.length - 1)
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
            let menu  = document.getElementsByClassName("clickContext sub_" + ContextMenu.subMenus)[0]
            let rect1 = menu.getBoundingClientRect()
            let from  = document.getElementById("drop_" + ContextMenu.subMenus + "_" + optPos)
            let rect2 = from.getBoundingClientRect()

            ContextMenu.subMenus++

            //make submenu option stay hover colored
            if (!from.classList.contains("hover")) from.classList.add("hover")

            let newSub = document.createElement("div")
            newSub.setAttribute("class", "clickContext sub_" + ContextMenu.subMenus + " subMenu shadow")
            document.getElementById("contextLayer").appendChild(newSub)

            //position of submenu
            newSub.style.left  = rect1.left + menu.offsetWidth - 1 + "px"
            newSub.style.top   = rect2.top - 1 + "px"
            newSub.style.minWidth = main.offsetWidth - main.offsetWidth / 3 + "px"

            ContextMenu.draw(newSub, opt.func)
        }

        function closeSubOpt(trigger) {
            //
            let delArr = []
            //add every submenu up to trigger to deletion queue
            for (let menu of document.getElementsByClassName("clickContext")) {
                classInt = menu.classList[1].match(/(\d+)/)[0]
                if (classInt > trigger) {
                    delArr.push(menu)
                }
            }
            for (let item of delArr) {
                item.parentElement.removeChild(item)
            }
            //remove hover class from previous menu
            for (let sect of document.getElementsByClassName("sub_"+(trigger))[0].children){
                for (let opt of sect.children) {
                    if (opt.classList.contains("hover")) opt.classList.remove("hover")
                }
            }
        
            ContextMenu.subMenus = trigger
        }
    }
}