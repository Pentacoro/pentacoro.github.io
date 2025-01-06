import {getTask} from "/plexos/lib/functions/dll.js"
import {plexos} from "/plexos/ini/system.js"
import File from "/plexos/lib/classes/filesystem/file.js"
let cfg  = plexos.cfg

let task = getTask(/TASKID/)
let mem  = task.mem

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
task.node.getElementsByName("cfg.desktop.grid.autoHmargin")[1].addEventListener("click", e=>{
    if (e.target.checked) return
    cfg.desktop.grid.modHmargin = 0
    cfg.desktop.grid.hMargin = Number(mem.var.hMarginHTML.value)
    mem.updateTileGraphAuto()
    task.emit("desktop-grid-settings-change")
})
task.node.getElementsByName("cfg.desktop.grid.autoVmargin")[1].addEventListener("click", e=>{
    if (e.target.checked) return
    cfg.desktop.grid.modVmargin = 0
    cfg.desktop.grid.vMargin = Number(mem.var.vMarginHTML.value)
    mem.updateTileGraphAuto()
    task.emit("desktop-grid-settings-change")
})
task.node.getElementsByName("cfg.desktop.grid.hMargin")[0].addEventListener("click", e=>{
    cfg.desktop.grid.modHmargin = 0
    cfg.desktop.grid.hMargin = Number(mem.var.hMarginHTML.value)
    mem.updateTileGraphAuto()
    task.emit("desktop-grid-settings-change")
})
task.node.getElementsByName("cfg.desktop.grid.vMargin")[0].addEventListener("click", e=>{
    cfg.desktop.grid.modVmargin = 0
    cfg.desktop.grid.vMargin = Number(mem.var.vMarginHTML.value)
    mem.updateTileGraphAuto()
    task.emit("desktop-grid-settings-change")
})
task.node.getElementsByName("cfg.desktop.grid.stickToBorder")[0].addEventListener("click", e=>{
    mem.updateGridGraphDrag()
})
task.node.getElementsByName("cfg.desktop.grid.hideOnShrink")[0].addEventListener("click", e=>{
    mem.updateGridGraphDrag()
})