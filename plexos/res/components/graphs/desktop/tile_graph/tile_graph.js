let mem  = Task.id("TASKID").mem

mem.updateTileGraph = function(){
    document.getElementsByClassName("ID_TASKID tile_graph")[0].children[0].children[0].innerText = cfg.desktop.grid.width
    document.getElementsByClassName("ID_TASKID tile_graph")[0].children[1].innerText = cfg.desktop.grid.height
    document.getElementsByClassName("ID_TASKID tile_graph")[0].children[2].innerText = cfg.desktop.grid.hMargin
    document.getElementsByClassName("ID_TASKID tile_graph")[0].children[3].innerText = cfg.desktop.grid.vMargin
    mem.var.widthHTML.innerText = cfg.desktop.grid.width
    mem.var.heightHTML.innerText = cfg.desktop.grid.height
    mem.var.hMarginHTML.innerText = cfg.desktop.grid.hMargin
    mem.var.vMarginHTML.innerText = cfg.desktop.grid.vMargin
}
mem.updateTileGraphAuto = function(arg = null){
    document.getElementsByClassName("ID_TASKID tile_graph")[0].children[4].innerText = (cfg.desktop.grid.modHmargin != 0 || arg) ? parseFloat(cfg.desktop.grid.modHmargin).toFixed(2) : ""
    document.getElementsByClassName("ID_TASKID tile_graph")[0].children[5].innerText = (cfg.desktop.grid.modVmargin != 0 || arg) ? parseFloat(cfg.desktop.grid.modVmargin).toFixed(2) : ""
}