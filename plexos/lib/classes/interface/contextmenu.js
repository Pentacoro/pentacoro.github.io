import plexos from "/boot/plexos.js"
import {runLauncher, clearSelection} from "../../functions/dll.js"
import { coreReadOnly, menuItemWrites } from "../../functions/readOnly.js"
import { themeConstruct, themeRoot } from "/plexos/lib/functions/theme.js"
import Task from "../system/task.js" //file explorer deletion
import File from "../filesystem/file.js"

export default class ContextMenu {
    static configAddr = "@/plexos/cfg/context"
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

        //handle hover context transfer
        if (contextVar) {
            if (contextVar.continuousContext!=undefined) contextVar.continuousContext = true
            //contextVar.targetElement.dispatchEvent(contextMenuOpen)
            ContextMenu.contextVar = contextVar
        }

        let contextArray = ContextMenu.applyTemplates(e, target, menu)
        ContextMenu.draw(newMenu, contextArray)
        ContextMenu.levels[0].leftward = ContextMenu.place(newMenu, {
            right: e.clientX, left: e.clientX, down: e.clientY, up: e.clientY,
        })
    }
    // Puts a drawn menu where it fits. It opens rightward from `right` and downward from `down`, and flips to end at
    // `left` or `up` when it would run past the screen edge. preferLeft keeps a submenu going the way its parent went.
    // Returns whether it opened leftward.
    static place(node, { right, left, down, up, preferLeft = false }) {
        const width  = node.offsetWidth
        const height = node.offsetHeight
        const fitsRight = right + width <= window.innerWidth
        const fitsLeft  = left - width >= 0
        const leftward  = preferLeft ? (fitsLeft || !fitsRight) : (!fitsRight && fitsLeft)
        let x = leftward ? left - width : right
        let y = (down + height <= window.innerHeight) ? down : up - height
        x = Math.max(0, Math.min(x, window.innerWidth - width))
        y = Math.max(0, Math.min(y, window.innerHeight - height))
        node.style.left = x + "px"
        node.style.top  = y + "px"
        return leftward
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
        // a menu marked exclusive is shown as given, without the shared template's sections
        if (menu?.exclusive) return menu
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
                const enabled = !(coreReadOnly() && menuItemWrites(item)) && (item.bool == undefined || item.bool)
                if (!enabled) {
                    newButton.classList.add("disabled")
                    newButton.onmouseover = e => closeSubmenus(depth)
                } else if (typeof item.func === "function") {
                    newButton.onclick = e => {
                        e.preventDefault()
                        item.func()
                        ContextMenu.close()
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

            newSub.style.minWidth = root.offsetWidth - root.offsetWidth / 3 + "px"

            ContextMenu.draw(newSub, item.func, depth + 1)
            ContextMenu.levels[depth + 1].leftward = ContextMenu.place(newSub, {
                right: rect1.right - 1,
                left: rect1.left + 1,
                down: rect2.top - 1,
                up: rect2.bottom + 1,
                preferLeft: ContextMenu.levels[depth].leftward,
            })
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

// Keyboard, on whatever menu is open: Up/Down move through the deepest menu, Enter picks, Right opens a submenu,
// Left closes one, Escape closes everything. Returns whether it used the key, so a menubar can take Left/Right
// at the top level to move to the next menu.
ContextMenu.focused = function (depth) {
    return ContextMenu.levels[depth]?.options.find(option => option.classList.contains("keyFocus")) || null
}
ContextMenu.focusOption = function (depth, option) {
    for (const each of ContextMenu.levels[depth]?.options || []) each.classList.toggle("keyFocus", each === option)
}
ContextMenu.focusFirst = function (depth = 0) {
    const first = ContextMenu.levels[depth]?.options.find(option => !option.classList.contains("disabled"))
    if (first) ContextMenu.focusOption(depth, first)
}
ContextMenu.handleKey = function (e) {
    const depth = ContextMenu.levels.length - 1
    if (depth < 0) return false
    const level = ContextMenu.levels[depth]
    const options = level.options.filter(option => !option.classList.contains("disabled"))
    const current = ContextMenu.focused(depth)
    switch (e.key) {
        case "ArrowDown":
        case "ArrowUp": {
            if (!options.length) return true
            const step = e.key === "ArrowDown" ? 1 : -1
            const at = options.indexOf(current)
            const next = at < 0 ? (step > 0 ? 0 : options.length - 1) : (at + step + options.length) % options.length
            ContextMenu.focusOption(depth, options[next])
            return true
        }
        case "ArrowRight":
            if (!current?.querySelector(".last")) return false
            current.onmouseover?.()
            ContextMenu.focusFirst(depth + 1)
            return true
        case "ArrowLeft":
            if (depth === 0) return false
            for (const removed of ContextMenu.levels.splice(depth)) removed.node.remove()
            for (const option of ContextMenu.levels[depth - 1].options) option.classList.remove("hover")
            ContextMenu.subMenus = depth - 1
            return true
        case "Enter":
        case " ":
            if (!current) return true
            if (current.querySelector(".last")) {
                current.onmouseover?.()
                ContextMenu.focusFirst(depth + 1)
            } else {
                current.click()
            }
            return true
        case "Escape":
            ContextMenu.close()
            return true
    }
    return false
}
window.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || !ContextMenu.levels.length) return
    if (ContextMenu.handleKey(e)) e.preventDefault()
})

// A click that is not the menu closes it and drops any text selection.
window.addEventListener("mousedown", (e) => {
	if (ContextMenu.contains(e.target) || e.target.contextMenu) return
	ContextMenu.close()
	clearSelection()
})