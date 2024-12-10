import {getTask} from "/plexos/lib/functions/dll.js"
import ContextMenu from "/plexos/lib/classes/interface/contextmenu.js"

let task = getTask(/TASKID/)
let mem  = task.mem

mem.menubar.continuousContext = false
mem.menubarRender = function () {
    let menuBar = task.node.getElementsByClassName("menubar_container")[0]
    menuBar.innerHTML = ""
    for (const buttonName of mem.menubar.menubarButtons) {
        let newButton = document.createElement("button")
        newButton.classList.add(buttonName)
        newButton.classList.add(task.id)
        newButton.innerText = buttonName
        menuBar.appendChild(newButton)
    }
    function buttonMenuOpen(e) {
        e.preventDefault()
        let button = e.target
        mem.menubar.targetElement = button
        let bound = button.getBoundingClientRect()
        let param = {
            clientY:bound.bottom,
            clientX:bound.left,
            contextVar:mem.menubar
        }
        let menu = mem.menubar.contextOptions(button).menu
        ContextMenu.open(param,button,menu)
        button.onmousedown = e => {
            ContextMenu.close()
            buttonMenuClose(e)
        }
    }
    function buttonMenuClose(e) {
        e.preventDefault()
        let button = e.target
        button.onmousedown = e => {
            buttonMenuOpen(e)
        }
    }
    for (const button of menuBar.children) {
        button.onmousedown = e => {
            buttonMenuOpen(e)
        }
        button.onmouseover = e => {
            if (mem.menubar.targetElement) mem.menubar.targetElement.dispatchEvent(new Event ("closemenu"))
            if (mem.menubar.continuousContext) buttonMenuOpen(e)
        }
        button.addEventListener("closemenu", e=>{buttonMenuClose(e)})
        button.contextMenu = true
    }
}
mem.menubarRender()