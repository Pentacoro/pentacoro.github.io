import {getTask, selectText} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem

mem.textArea = task.node.getElementsByTagName("textarea")[0]
task.window.node.addEventListener("onfocus", e => {
    console.log(window.getSelection())
    mem.textArea.focus()
    selectText(mem.textArea)
})
task.window.node.addEventListener("blur", e => {
    mem.var.selectionRange = window.getSelection()
    task.node.blur()
})
mem.textArea.textContent = mem.arg.textData