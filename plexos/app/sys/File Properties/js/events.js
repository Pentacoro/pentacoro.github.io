import {plexos} from "/plexos/ini/system.js"
import {getTask, isKeyWrite} from "/plexos/lib/functions/dll.js"
let cfg = plexos.cfg

let task = getTask(/TASKID/)
let mem  = task.mem

//name input
task.node.getElementById(`${task.id}_fileName`).addEventListener("change", e => mem.onNameChange(e))
task.node.getElementById(`${task.id}_fileName`).addEventListener("keydown", e => {if (isKeyWrite(e)) mem.onNameChange(e)})
task.node.getElementById(`${task.id}_fileName`).addEventListener("paste", async e => {
    const paste = await navigator.clipboard.readText()
    if (paste) mem.onNameChange(e)
})

mem.onNameChange = function (e) {
    mem.onChange()
    let inputbox = e.target
    task.once(task.id+"-apply", () => {
        let newname = inputbox.value + ((mem.arg.cfg.class === "Directory") ? "" : mem.tab.general.fileExte.innerText)
        mem.arg.rename(newname)
        mem.var.configObject.name          = mem.arg.name
        mem.var.configObject.cfg.path      = mem.arg.cfg.path
        mem.var.configObject.cfg.icon.file = mem.arg.cfg.icon.file
    }, 0, "nameChange")
}