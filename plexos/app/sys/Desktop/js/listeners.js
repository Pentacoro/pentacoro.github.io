import Task from "/plexos/lib/classes/system/task.js"

let task = Task.id("TASKID")

task.on("desktop-grid-settings-open", ()=> {
    cfg.desktop.grid.visibleNodes = true
    task.mem.grid.evaluateIconGrid(3)
})
task.on("desktop-grid-settings-change", ()=> {
    task.mem.grid.evaluateIconGrid(3)
    if (cfg.desktop.grid.autoHmargin || cfg.desktop.grid.autoVmargin || cfg.desktop.grid.autoHlength || cfg.desktop.grid.autoVlength) task.mem.grid.realTimeGridEval()
})
task.on("desktop-grid-settings-closed", ()=> {
    cfg.desktop.grid.visibleNodes = false
    task.mem.grid.evaluateIconGrid(3)
})