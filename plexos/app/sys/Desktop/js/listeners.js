task.on("desktop-grid-settings-change", ()=> {
    task.mem.grid.evaluateIconGrid(3)
    if (cfg.desktop.grid.autoHmargin || cfg.desktop.grid.autoVmargin || cfg.desktop.grid.autoHlength || cfg.desktop.grid.autoVlength) task.mem.grid.realTimeGridEval()
})
task.on("desktop-grid-settings-closed", ()=> {
    task.mem.grid.evaluateIconGrid(3)
})