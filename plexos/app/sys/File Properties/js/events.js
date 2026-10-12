import plexos from "/plexos/ini/system.js"
import {getTask, isKeyWrite} from "/plexos/lib/functions/dll.js"
let cfg = plexos.Settings

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
}

task.on(task.id+"-apply", () => {
    mem.arg.render()
    mem.prepGeneral()
    mem.prepMetadata()
})