import Task from "/plexos/lib/classes/system/task.js"

let task = Task.id("TASKID")
let mem  = task.mem

task.apps = "plx"
mem.fileAddress = "ARG_FILEADDR"
mem.var = {}

mem.var.textarea = task.node.getElementsByTagName("textarea")[0]
task.window.node.addEventListener("onfocus", e => {
    console.log(window.getSelection())
    mem.var.textarea.focus()
    dll.selectText(mem.var.textarea)
})
task.window.node.addEventListener("blur", e => {
    mem.var.selectionRange = window.getSelection()
    task.node.blur()
})