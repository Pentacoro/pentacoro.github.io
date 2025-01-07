import {getTask} from "/plexos/lib/functions/dll.js"
import Task from "/plexos/lib/classes/system/task.js"

let task = getTask(/TASKID/)
let mem  = task.mem
mem.cfg  = Task.get("Desktop").mem.cfg

task.on("desktop-grid-length-change", ()=> {
    task.mem.updateGridGraph()
    task.node.getElementsByName("mem.cfg.grid.hLength")[0].value = mem.cfg.grid.hLength
    task.node.getElementsByName("mem.cfg.grid.vLength")[0].value = mem.cfg.grid.vLength
})
task.on("desktop-grid-margin-change", ()=> {
    task.mem.updateTileGraph()
    task.mem.updateTileGraphAuto()
})
task.on("desktop-refresh", ()=> {
    task.mem.updateGridGraph()
})
task.on("desktop-icon-hidden", ()=> {
    task.mem.updateGridGraph()
})