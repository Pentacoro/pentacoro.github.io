import {getTask} from "/plexos/lib/functions/dll.js"
import Task from "/plexos/lib/classes/system/task.js"

let task = getTask(/TASKID/)
let mem  = task.mem
mem.cfg = Task.get("Desktop").mem.cfg

mem.updateTileGraph = function(){
    document.getElementsByClassName("tile_graph")[0].children[0].children[0].innerText = mem.cfg.grid.width
    document.getElementsByClassName("tile_graph")[0].children[1].innerText = mem.cfg.grid.height
    document.getElementsByClassName("tile_graph")[0].children[2].innerText = mem.cfg.grid.hMargin
    document.getElementsByClassName("tile_graph")[0].children[3].innerText = mem.cfg.grid.vMargin
    mem.var.widthHTML.innerText = mem.cfg.grid.width
    mem.var.heightHTML.innerText = mem.cfg.grid.height
    mem.var.hMarginHTML.innerText = mem.cfg.grid.hMargin
    mem.var.vMarginHTML.innerText = mem.cfg.grid.vMargin
}
mem.updateTileGraphAuto = function(arg = null){
    document.getElementsByClassName("tile_graph")[0].children[4].innerText = (mem.cfg.grid.modHmargin != 0 || arg) ? parseFloat(mem.cfg.grid.modHmargin).toFixed(2) : ""
    document.getElementsByClassName("tile_graph")[0].children[5].innerText = (mem.cfg.grid.modVmargin != 0 || arg) ? parseFloat(mem.cfg.grid.modVmargin).toFixed(2) : ""
}