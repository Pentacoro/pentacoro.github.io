import {plexos} from "/plexos/ini/system.js"
import {getTask} from "/plexos/lib/functions/dll.js"
let cfg = plexos.cfg

let task = getTask(/TASKID/)
let mem  = task.mem

//name input
task.node.getElementById(`${task.id}_fileName`).onchange = (e) => {
    let inputbox = e.target
    eval(mem.var.configObject).rename(JSON.stringify(inputbox.value) + mem.element.fileExte.innerText)
    mem.onChange()
}
task.node.getElementById(`${task.id}_fileName`).addEventListener("focusout", (e) => {
    let inputbox = e.target
    eval(mem.var.configObject).rename(JSON.stringify(inputbox.value) + mem.element.fileExte.innerText)
})
