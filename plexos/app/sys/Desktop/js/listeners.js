import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let cfg  = task.mem.cfg

task.on("desktop-grid-settings-open", ()=> {
    cfg.grid.visibleNodes = true
    task.mem.grid.evaluateIconGrid(3)
})
task.on("desktop-grid-settings-change", ()=> {
    task.mem.grid.evaluateIconGrid(3)
})
task.on("desktop-grid-settings-closed", ()=> {
    cfg.grid.visibleNodes = false
    task.mem.grid.evaluateIconGrid(3)
}, 0)
task.on("desktop-resize", ()=> {
    if
    (
        cfg.grid.autoHmargin ||
        cfg.grid.autoVmargin ||
        cfg.grid.autoHlength ||
        cfg.grid.autoVlength
    ){
        task.mem.grid.evaluateIconGrid()
    }
}, 0)
task.on("desktop-resize", ()=> {
    task.node.style.width = document.body.offsetWidth + "px"
    task.node.style.height = document.body.offsetHeight - cfg.task.height + "px"
}, 1)