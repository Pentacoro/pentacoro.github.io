import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let cfg  = task.mem.cfg

task.cmd("event.on", {eventName: "desktop-grid-settings-open", callback: ()=> {
    cfg.grid.visibleNodes = true
    task.mem.grid.evaluateIconGrid(3)
}})
task.cmd("event.on", {eventName: "desktop-grid-settings-change", callback: ()=> {
    task.mem.grid.evaluateIconGrid(3)
}})
task.cmd("event.on", {eventName: "desktop-grid-settings-closed", callback: ()=> {
    cfg.grid.visibleNodes = false
    task.mem.grid.evaluateIconGrid(3)
}, priority: 0})
task.cmd("event.on", {eventName: "viewport-resize", callback: ()=> {
    if
    (
        cfg.grid.autoHmargin ||
        cfg.grid.autoVmargin ||
        cfg.grid.autoHlength ||
        cfg.grid.autoVlength
    ){
        task.mem.grid.evaluateIconGrid()
    }
}, priority: 0})
task.cmd("event.on", {eventName: "viewport-resize", callback: ()=> {
    task.node.style.width = document.body.offsetWidth + "px"
    task.node.style.height = document.body.offsetHeight - cfg.task.height + "px"
}, priority: 1})
task.cmd("event.on", {eventName: "transfer-finished", callback: ({ to, moved })=> {
    task.mem.selectArrivals(to, moved)
}})