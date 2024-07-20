let task = Task.id("TASKID")
let mem  = task.mem

task.apps = "plx"
mem.fileAddress = "ARG_FILEADDR"
mem.var = {}

mem.var.textarea = task.node.getElementsByTagName("textarea")[0]
task.wndw.node.addEventListener("onfocus", e => {
    console.log(window.getSelection())
    mem.var.textarea.focus()
    dll.selectText(mem.var.textarea)
})
task.wndw.node.addEventListener("blur", e => {
    mem.var.selectionRange = window.getSelection()
    task.node.blur()
})