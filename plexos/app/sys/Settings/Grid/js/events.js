import {getTask} from "/plexos/lib/functions/dll.js"
import {plexos} from "/plexos/ini/system.js"
import File from "/plexos/lib/classes/files/file.js"
let cfg  = plexos.cfg

let task = getTask(/TASKID/)
let mem  = task.mem

//on app close
task.onEnd = function () {
    eval(mem.var.config +" = task.mem.var.configClone")
    task.emit("desktop-grid-settings-closed")
    File.at(mem.var.configFile).data = JSON.stringify(eval(mem.var.config), null, "\t")
}

//deselection
document.onmousedown = e => {
    if (window.getSelection) {window.getSelection().removeAllRanges()}
    else if (document.selection) {document.selection.empty()}
}

//tabs functionality
for (let tab of task.node.getElementsByClassName("config-tab")) {
    let value = tab.children[0].value
    let input = tab.children[0]
    tab.addEventListener("click", e => {
        if (input.checked) {
            for (let content of task.node.getElementsByClassName("tabContent")) {content.classList.add("hidden")}
            task.node.getElementById(value).classList.remove("hidden")
            return
        }
    })
}

//footer buttons 
task.node.getElementsByClassName("footer-accept")[0].onclick = (e)=> {
    File.at(mem.var.configFile).data = JSON.stringify(eval(mem.var.config), null, "\t")
    mem.var.configClone = { ...eval(mem.var.config)}
    task.end()
}
task.node.getElementsByClassName("footer-cancel")[0].onclick = (e)=> {
    task.end()
}
task.node.getElementsByClassName("footer-apply")[0].onclick = (e)=> {
    File.at(mem.var.configFile).data = JSON.stringify(eval(mem.var.config), null, "\t")
    mem.var.configClone = { ...eval(mem.var.config)}
    task.node.getElementsByClassName("footer-apply")[0].disabled = true
    task.node.getElementsByClassName("footer-apply")[0].classList.add("disabled")
}

//integer input 
for (let input of task.node.getElementsByClassName("optionValue")) {
    let inputbox = input
    let variable = inputbox.getAttribute("name")
    inputbox.onchange = (e) => {
        eval(variable + " = " + Number(inputbox.value))
        if (inputbox.parentElement.children[3]) {
            eval(inputbox.parentElement.children[3].name + " = " + false)
            inputbox.parentElement.children[3].checked = false
            mem.onChange()
            return
        }
        mem.onChange()
    }
    inputbox.addEventListener("focusout", (e) => {
        eval(variable + " = " + Number(inputbox.value))
    })
}

//auto button
for (let button of task.node.getElementsByClassName("optionButton")) {
    let variable = button.getAttribute("name")
    button.onclick = (e) => {
        if (eval(variable)) return
        eval(variable + " = " + true)
        mem.onChange()
        eval(variable + " = " + false)
    }
}

//auto checkbox
for (let box of task.node.getElementsByClassName("optionCheck")) {
    let variable = box.getAttribute("name")
    let checkbox = box
    if (eval(variable)) checkbox.checked = true
    checkbox.onclick = (e) => {
        if (!checkbox.checked) {
            eval(variable + " = " + false)
            mem.onChange()
            return
        }
        eval(variable + " = " + true)
        mem.onChange()
    }
}

//auto margin reset on uncheck and on input change
task.node.getElementsByName("cfg.desktop.grid.autoHmargin")[1].addEventListener("click", e=>{
    if (e.target.checked) return
    cfg.desktop.grid.modHmargin = 0
    cfg.desktop.grid.hMargin = Number(mem.var.hMarginHTML.value)
    mem.updateTileGraphAuto()
    task.emit("desktop-grid-settings-change")
})
task.node.getElementsByName("cfg.desktop.grid.autoVmargin")[1].addEventListener("click", e=>{
    if (e.target.checked) return
    cfg.desktop.grid.modVmargin = 0
    cfg.desktop.grid.vMargin = Number(mem.var.vMarginHTML.value)
    mem.updateTileGraphAuto()
    task.emit("desktop-grid-settings-change")
})
task.node.getElementsByName("cfg.desktop.grid.hMargin")[0].addEventListener("click", e=>{
    cfg.desktop.grid.modHmargin = 0
    cfg.desktop.grid.hMargin = Number(mem.var.hMarginHTML.value)
    mem.updateTileGraphAuto()
    task.emit("desktop-grid-settings-change")
})
task.node.getElementsByName("cfg.desktop.grid.vMargin")[0].addEventListener("click", e=>{
    cfg.desktop.grid.modVmargin = 0
    cfg.desktop.grid.vMargin = Number(mem.var.vMarginHTML.value)
    mem.updateTileGraphAuto()
    task.emit("desktop-grid-settings-change")
})
task.node.getElementsByName("cfg.desktop.grid.stickToBorder")[0].addEventListener("click", e=>{
    mem.updateGridGraphDrag()
})
task.node.getElementsByName("cfg.desktop.grid.hideOnShrink")[0].addEventListener("click", e=>{
    mem.updateGridGraphDrag()
})