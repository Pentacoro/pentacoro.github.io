let task = system.mem.task("TASKID")
let mem  = task.mem

let menuBar   = document.getElementsByClassName("menubar_component ID_TASKID")[0]

for (const buttonName of mem.var.menubarButtons) {
    let newButton = document.createElement("button")
    newButton.classList.add(buttonName)
    newButton.classList.add("ID_TASKID")
    newButton.innerText = buttonName
    menuBar.appendChild(newButton)
}

for (const button of menuBar.children) {
    function buttonMenuOpen() {
        button.onmousedown = buttonMenuClose
        let bound = button.getBoundingClientRect()
        let param = {
            clientY:bound.bottom,
            clientX:bound.left,
            contextVar:mem.var
        }
        let menuSections = mem.var.contextOptions(button).menuSections
        let menuOptions  = mem.var.contextOptions(button).menuOptions
        openMenu(param,button,menuSections,menuOptions)
    }
    function buttonMenuClose() {
        closeMenu()
        button.onmousedown = () => buttonMenuOpen()
    }
    button.contextMenu = true
    button.onmousedown = e => {
        buttonMenuOpen()
    }
    button.onmouseover = e => {
        if (mem.var.continuousContext) buttonMenuOpen()
    }
}