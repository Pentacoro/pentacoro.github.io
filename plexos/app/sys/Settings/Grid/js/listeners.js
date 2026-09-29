import {getTask} from "/plexos/lib/functions/dll.js"
import Task from "/plexos/lib/classes/system/task.js"

let task = getTask(/TASKID/)
let mem  = task.mem
mem.cfg  = Task.get("Desktop").mem.cfg

task.cmd("event.on", {eventName: "desktop-grid-length-change", callback: ()=> {
    task.mem.updateGridGraph()
    task.node.getElementsByName("mem.cfg.grid.hLength")[0].value = mem.cfg.grid.hLength
    task.node.getElementsByName("mem.cfg.grid.vLength")[0].value = mem.cfg.grid.vLength
}})
task.cmd("event.on", {eventName: "desktop-grid-margin-change", callback: ()=> {
    task.mem.updateTileGraph()
    task.mem.updateTileGraphAuto()
}})
task.cmd("event.on", {eventName: "desktop-refresh", callback: ()=> {
    task.mem.updateGridGraph()
}})
task.cmd("event.on", {eventName: "desktop-icon-hidden", callback: ()=> {
    task.mem.updateGridGraph()
}})