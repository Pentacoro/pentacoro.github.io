task.on("desktop-grid-length-change", ()=> {
    task.mem.updateGridGraph()
    document.getElementsByName("cfg.desktop.grid.hLength")[0].value = cfg.desktop.grid.hLength
    document.getElementsByName("cfg.desktop.grid.vLength")[0].value = cfg.desktop.grid.vLength
})
task.on("desktop-grid-margin-change", ()=> {
    task.mem.updateTileGraph()
    task.mem.updateTileGraphAuto()
})
task.on("desktop-refresh", ()=> {
    task.mem.updateGridGraph()
})