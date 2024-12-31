import {plexos} from "/plexos/ini/system.js"
import {getTask} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/files/file.js"
let cfg = plexos.cfg

let task = getTask(/TASKID/)
let mem  = task.mem

//configuration
/* 
mem.var.config = "" //set object
mem.var.configFile = "" //set config file path
mem.var.configInitial = { ...eval(mem.var.config)}
 */

//on app close
task.onEnd = function () {
    eval("mem.var.config = mem.var.configInitial")
    task.emit(task.name+"-closed")
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
    mem.var.configInitial = { ...eval(mem.var.config)}
    task.end()
}
task.node.getElementsByClassName("footer-cancel")[0].onclick = (e)=> {
    task.end()
}
task.node.getElementsByClassName("footer-apply")[0].onclick = (e)=> {
    File.at(mem.var.configFile).data = JSON.stringify(eval(mem.var.config), null, "\t")
    mem.var.configInitial = { ...eval(mem.var.config)}
    task.node.getElementsByClassName("footer-apply")[0].disabled = true
    task.node.getElementsByClassName("footer-apply")[0].classList.add("disabled")
}