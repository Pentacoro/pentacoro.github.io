import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
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