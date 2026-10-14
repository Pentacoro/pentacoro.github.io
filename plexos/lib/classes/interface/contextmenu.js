import plexos from "/boot/plexos.js"
import {runLauncher, clearSelection} from "../../functions/dll.js"
import { themeConstruct, themeRoot } from "/plexos/lib/functions/theme.js"
import Task from "../system/task.js" //file explorer deletion
import File from "../filesystem/file.js"

export default class ContextMenu {
    static configAddr = "/plexos/cfg/context"
    static contextVar = null
    static subMenus   = 0
    static target     = null
    static node       = null
    static menu       = []
    static levels     = [] //[{node, options}] per depth, 0 = root menu

    static contains(element) {
        return ContextMenu.levels.some(level => level.node.contains(element))
    }

    //open context menu
    static open = function(e, target, menu=null) {
        if (e.preventDefault) e.preventDefault()
        ContextMenu.close()

        ContextMenu.target = target
        let contextVar = e.contextVar || null
        
        const ui = themeConstruct("contextMenu")
        let newMenu = ui.createRoot()
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
        ContextMenu.levels   = []
    }
    static applyTemplates = function (e, target, menu=null) {
        // No core yet: the template file lives in the mounted filesystem.
        let templatesFile = null
        try {
            templatesFile = File.at(ContextMenu.configAddr + "/templates.js")
        } catch { /* Core.file is not mounted */ }
        if (!templatesFile?.data) return menu || []
        let menuTemplates = eval(templatesFile.data)
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

    static draw = function(node, arr, depth = 0) {
        const ui = themeConstruct("contextMenu")
        const level = { node, options: [] }
        ContextMenu.levels[depth] = level

        for (let section of arr) {
            let newSection = ui.createSection()

            for (let item of section.list) {
                let newButton = ui.createOption({
                    id: "drop_" + depth + "_" + level.options.length,
                    name: item.name,
                    icon: item.icon?.replaceAll("/THEME", themeRoot()),
                    shortcut: item.shortcut,
                    hasChildren: Array.isArray(item.func),
                })
                level.options.push(newButton)
                newSection.appendChild(newButton)

                newButton.onclick = e => e.preventDefault()
                if (typeof item.func === "function") {
                    if (item.bool == undefined || item.bool) {
                        newButton.onclick = e => {
                            e.preventDefault()
                            item.func()
                            ContextMenu.close()
                        }
                    } else {
                        newButton.classList.add("disabled")
                    }
                    newButton.onmouseover = e => closeSubmenus(depth)
                } else if (Array.isArray(item.func)) {
                    newButton.onmouseover = e => {
                        closeSubmenus(depth)
                        openSubmenu(item, newButton, depth)
                    }
                }
                newButton.onmousedown = e => e.preventDefault()
            }

            node.appendChild(newSection)
        }

        function openSubmenu(item, from, depth) {
            if (ContextMenu.levels[depth + 1]) return

            const root   = ContextMenu.levels[0].node
            const parent = ContextMenu.levels[depth].node
            const rect1  = parent.getBoundingClientRect()
            const rect2  = from.getBoundingClientRect()

            //make submenu option stay hover colored
            from.classList.add("hover")

            ContextMenu.subMenus = depth + 1
            let newSub = ui.createSubmenu(depth + 1)

            newSub.style.left  = rect1.left + parent.offsetWidth - 1 + "px"
            newSub.style.top   = rect2.top - 1 + "px"
            newSub.style.minWidth = root.offsetWidth - root.offsetWidth / 3 + "px"

            ContextMenu.draw(newSub, item.func, depth + 1)
        }

        function closeSubmenus(depth) {
            for (let level of ContextMenu.levels.splice(depth + 1)) {
                level.node.remove()
            }
            for (let option of ContextMenu.levels[depth]?.options || []) {
                option.classList.remove("hover")
            }
            ContextMenu.subMenus = depth
        }
    }
}

// A click that is not the menu closes it and drops any text selection.
window.addEventListener("mousedown", (e) => {
	if (ContextMenu.contains(e.target) || e.target.contextMenu) return
	ContextMenu.close()
	clearSelection()
})