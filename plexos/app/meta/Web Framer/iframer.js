import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem

mem.var.url  = mem.arg.file.meta.url

task.node.getElementsByTagName("iframe")[0].setAttribute("src", mem.var.url)

let checkIframeFocus = function() {
    setTimeout(() => {
        if (document.activeElement.classList[0] === task.id+"_iframe") {
            task.focus()
        }
    })
}

task.node.getElementsByTagName("iframe")[0].addEventListener("mousedown", checkIframeFocus)
window.addEventListener("blur", checkIframeFocus)
task.onEnd = function () {
    window.removeEventListener("blur", checkIframeFocus)
}