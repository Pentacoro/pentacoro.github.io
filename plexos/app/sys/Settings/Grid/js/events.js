import {getTask} from "/plexos/lib/functions/dll.js"
import {plexos} from "/plexos/ini/system.js"
import File from "/plexos/lib/classes/files/file.js"
let cfg  = plexos.cfg

let task = getTask(/TASKID/)
let mem  = task.mem

//on app close
task.onEnd = function () {
    eval(mem.var.config +" = task.mem.var.configInitial")
    task.emit("desktop-grid-settings-closed")
    File.at(mem.var.configFile).data = JSON.stringify(eval(mem.var.config), null, "\t")
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