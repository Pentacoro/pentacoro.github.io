import {getTask} from "/plexos/lib/functions/dll.js"
import {plexos} from "/plexos/ini/system.js"

let cfg  = plexos.cfg

let task = getTask(/TASKID/)

task.on("desktop-grid-settings-open", ()=> {
    cfg.desktop.grid.visibleNodes = true
    task.mem.grid.evaluateIconGrid(3)
})
task.on("desktop-grid-settings-change", ()=> {
    task.mem.grid.evaluateIconGrid(3)
})
task.on("desktop-grid-settings-closed", ()=> {
    cfg.desktop.grid.visibleNodes = false
    task.mem.grid.evaluateIconGrid(3)
}, 0)
task.on("desktop-resize", ()=> {
    if
    (
        cfg.desktop.grid.autoHmargin ||
        cfg.desktop.grid.autoVmargin ||
        cfg.desktop.grid.autoHlength ||
        cfg.desktop.grid.autoVlength
    ){
        task.mem.grid.evaluateIconGrid()
    }
}, 0)
task.on("desktop-resize", ()=> {
    task.node.style.width = document.body.offsetWidth + "px"
    task.node.style.height = document.body.offsetHeight - cfg.desktop.taskbar.height + "px"
}, 1)