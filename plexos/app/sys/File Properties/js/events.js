import {getTask} from "/plexos/lib/functions/dll.js"
import {wireSheet} from "/plexos/lib/functions/controls.js"

let task = getTask(/TASKID/)
let mem  = task.mem

//on app close
task.onEnd = function () {
    mem.var.configObject = mem.var.configInitialState
    task.emit(task.id+"-closed")
}

//footer buttons; on editable change
mem.onChange = wireSheet(mem.ui.sheet, task, {
    change: () => task.emit(task.id+"-change"),
    apply: async () => {
        task.emit(task.id+"-applyBefore")
        await mem.applyFileChanges()
        task.emit(task.id+"-apply")
    },
})

//deselection
document.onmousedown = e => {
    if (window.getSelection) {window.getSelection().removeAllRanges()}
    else if (document.selection) {document.selection.empty()}
}

//name input
mem.tab.general.fileName.addEventListener("input", () => mem.onChange())

task.on(task.id+"-apply", () => {
    mem.arg.render()
    mem.prepGeneral()
    mem.prepMetadata()
})
