import Task from "/plexos/lib/classes/system/task.js"

let task = Task.id("TASKID")

task.on("desktop-grid-length-change", ()=> {
    task.mem.updateGridGraph()
    task.node.getElementsByName("cfg.desktop.grid.hLength")[0].value = cfg.desktop.grid.hLength
    task.node.getElementsByName("cfg.desktop.grid.vLength")[0].value = cfg.desktop.grid.vLength
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