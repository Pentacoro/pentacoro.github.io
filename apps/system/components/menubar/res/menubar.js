let task = Task.id("TASKID")
let mem  = task.mem

mem.menubarRender = function () {
    let menuBar = document.getElementsByClassName("menubar_container ID_TASKID")[0]
    menuBar.innerHTML = ""
    for (const buttonName of mem.menubar.menubarButtons) {
        let newButton = document.createElement("button")
        newButton.classList.add(buttonName)
        newButton.classList.add("ID_TASKID")
        newButton.innerText = buttonName
        menuBar.appendChild(newButton)
    }
    function buttonMenuOpen(e) {
        e.preventDefault()
        button = e.target
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
        button = e.target
        button.onmousedown = e => {
            buttonMenuOpen(e)
        }
    }
    for (const button of menuBar.children) {
        button.onmousedown = e => {
            buttonMenuOpen(e)
        }
        button.onmouseover = e => {
            if (mem.menubar.targetElement) mem.menubar.targetElement.dispatchEvent(eventMenuClose)
            if (mem.menubar.continuousContext) buttonMenuOpen(e)
        }
        button.addEventListener("closemenu", e=>{buttonMenuClose(e)})
        button.contextMenu = true
    }
}
mem.menubarRender()