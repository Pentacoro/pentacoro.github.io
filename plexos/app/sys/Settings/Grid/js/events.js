import {getTask} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import Task from "/plexos/lib/classes/system/task.js"

let task = getTask(/TASKID/)
let mem  = task.mem
mem.cfg = Task.get("Desktop").mem.cfg

//on app close
task.onEnd = function () {
    eval(mem.var.configEditable +" = mem.var.configInitialState")
    task.emit("desktop-grid-settings-closed")
    File.at(mem.var.configFilePath).data = JSON.stringify(eval(mem.var.configEditable), null, "\t")
}

//on editable change
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

//auto margin reset on uncheck and on input change
task.node.getElementsByName("mem.cfg.grid.autoHmargin")[1].addEventListener("click", e=>{
    if (e.target.checked) return
    mem.cfg.grid.modHmargin = 0
    mem.cfg.grid.hMargin = Number(mem.var.hMarginHTML.value)
    mem.updateTileGraphAuto()
    task.emit("desktop-grid-settings-change")
})
task.node.getElementsByName("mem.cfg.grid.autoVmargin")[1].addEventListener("click", e=>{
    if (e.target.checked) return
    mem.cfg.grid.modVmargin = 0
    mem.cfg.grid.vMargin = Number(mem.var.vMarginHTML.value)
    mem.updateTileGraphAuto()
    task.emit("desktop-grid-settings-change")
})
task.node.getElementsByName("mem.cfg.grid.hMargin")[0].addEventListener("click", e=>{
    mem.cfg.grid.modHmargin = 0
    mem.cfg.grid.hMargin = Number(mem.var.hMarginHTML.value)
    mem.updateTileGraphAuto()
    task.emit("desktop-grid-settings-change")
})
task.node.getElementsByName("mem.cfg.grid.vMargin")[0].addEventListener("click", e=>{
    mem.cfg.grid.modVmargin = 0
    mem.cfg.grid.vMargin = Number(mem.var.vMarginHTML.value)
    mem.updateTileGraphAuto()
    task.emit("desktop-grid-settings-change")
})
task.node.getElementsByName("mem.cfg.grid.stickToBorder")[0].addEventListener("click", e=>{
    mem.updateGridGraphDrag()
})
task.node.getElementsByName("mem.cfg.grid.hideOnShrink")[0].addEventListener("click", e=>{
    mem.updateGridGraphDrag()
})