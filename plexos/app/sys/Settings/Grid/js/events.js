let desktop = Task.openInstance("Desktop")
let mem  = Task.id("TASKID").mem

//on app close
Task.id("TASKID").appEnd = function () {
    cfg.desktop.grid.visibleNodes = false
    Task.openInstance("Desktop").mem.grid.evaluateIconGrid(3)
    File.at(mem.var.configFile).data = JSON.stringify(eval(mem.var.config), null, "\t")
}

//deselection
document.onmousedown = e => {
    if (window.getSelection) {window.getSelection().removeAllRanges()}
    else if (document.selection) {document.selection.empty()}
}

//tabs functionality
for (tab of document.getElementsByClassName("config-tab")) {
    let value = tab.children[0].value
    let input = tab.children[0]
    tab.addEventListener("click", e => {
        if (input.checked) {
            for (content of document.getElementsByClassName("tabContent")) {content.classList.add("hidden")}
            document.getElementById(value).classList.remove("hidden")
            return
        }
    })
}

//footer buttons 
document.getElementsByClassName("footer-accept")[0].onclick = (e)=> {
    File.at(mem.var.configFile).data = JSON.stringify(eval(mem.var.config), null, "\t")
    Task.id("TASKID").end()
}
document.getElementsByClassName("footer-cancel")[0].onclick = (e)=> {
    new Function(mem.var.config +" = Task.id('TASKID').mem.var.configClone")()
    Task.id("TASKID").end()
}
document.getElementsByClassName("footer-apply")[0].onclick = (e)=> {
    File.at(mem.var.configFile).data = JSON.stringify(eval(mem.var.config), null, "\t")
    mem.var.configClone = { ...eval(mem.var.config)}
    document.getElementsByClassName("footer-apply")[0].disabled = true
    document.getElementsByClassName("footer-apply")[0].classList.add("disabled")
}

//integer input 
for (input of document.getElementsByClassName("optionValue")) {
    let inputbox = input
    let variable = inputbox.getAttribute("name")
    inputbox.onchange = (e) => {
        new Function(variable + " = " + Number(inputbox.value))()
        if (inputbox.parentElement.children[3]) {
            new Function(inputbox.parentElement.children[3].name + " = " + false)()
            inputbox.parentElement.children[3].checked = false
            mem.onChange()
            return
        }
        mem.onChange()
    }
    inputbox.addEventListener("focusout", (e) => {
        new Function(variable + " = " + Number(inputbox.value))
    })
}

//auto button
for (button of document.getElementsByClassName("optionButton")) {
    let variable = button.getAttribute("name")
    button.onclick = (e) => {
        if (eval(variable)) return
        new Function(variable + " = " + true)()
        mem.onChange()
        new Function(variable + " = " + false)()
    }
}

//auto checkbox
for (box of document.getElementsByClassName("optionCheck")) {
    let variable = box.getAttribute("name")
    let checkbox = box
    if (eval(variable)) checkbox.checked = true
    checkbox.onclick = (e) => {
        if (!checkbox.checked) {
            new Function(variable + " = " + false)()
            mem.onChange()
            return
        }
        new Function(variable + " = " + true)()
        mem.onChange()
    }
}

//auto margin reset on uncheck and on input change
document.getElementsByName("cfg.desktop.grid.autoHmargin")[1].addEventListener("click", e=>{
    if (e.target.checked) return
    cfg.desktop.grid.modHmargin = 0
    cfg.desktop.grid.hMargin = Number(mem.var.hMarginHTML.value)
    mem.updateTileGraphAuto()
    desktop.mem.grid.evaluateIconGrid(2)
})
document.getElementsByName("cfg.desktop.grid.autoVmargin")[1].addEventListener("click", e=>{
    if (e.target.checked) return
    cfg.desktop.grid.modVmargin = 0
    cfg.desktop.grid.vMargin = Number(mem.var.vMarginHTML.value)
    mem.updateTileGraphAuto()
    desktop.mem.grid.evaluateIconGrid(2)
})
document.getElementsByName("cfg.desktop.grid.hMargin")[0].addEventListener("click", e=>{
    cfg.desktop.grid.modHmargin = 0
    cfg.desktop.grid.hMargin = Number(mem.var.hMarginHTML.value)
    mem.updateTileGraphAuto()
    desktop.mem.grid.evaluateIconGrid(2)
})
document.getElementsByName("cfg.desktop.grid.vMargin")[0].addEventListener("click", e=>{
    cfg.desktop.grid.modVmargin = 0
    cfg.desktop.grid.vMargin = Number(mem.var.vMarginHTML.value)
    mem.updateTileGraphAuto()
    desktop.mem.grid.evaluateIconGrid(2)
})
document.getElementsByName("cfg.desktop.grid.stickToBorder")[0].addEventListener("click", e=>{
    mem.updateGridGraphDrag()
})
document.getElementsByName("cfg.desktop.grid.hideOnShrink")[0].addEventListener("click", e=>{
    mem.updateGridGraphDrag()
})