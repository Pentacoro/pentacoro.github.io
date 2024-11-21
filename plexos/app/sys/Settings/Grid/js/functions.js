import Task from "/plexos/lib/classes/system/task.js"

let task = Task.id("TASKID")
let mem  = task.mem

mem.onChange = function() {
    task.emit("desktop-grid-settings-change")
    if (task.node.getElementsByClassName("footer-apply")[0].disabled) {
        task.node.getElementsByClassName("footer-apply")[0].disabled = false
        task.node.getElementsByClassName("footer-apply")[0].classList.remove("disabled")
    }
    mem.updateGridGraph()
    mem.updateTileGraph()
    mem.updateTileGraphAuto()
}