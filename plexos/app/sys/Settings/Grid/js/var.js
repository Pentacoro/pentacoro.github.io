import {getTask} from "/plexos/lib/functions/dll.js"
import {plexos} from "/plexos/ini/system.js"
let cfg  = plexos.cfg

let task = getTask(/TASKID/)
let mem  = task.mem
mem.apps = "exp"
mem.var = {}

//configuration
mem.var.config = "cfg.desktop.grid"
mem.var.configFile = "plexos/cfg/desktop/grid.json"
mem.var.configClone = { ...eval(mem.var.config)}

//html references
mem.var.widthHTML = task.node.getElementsByName("cfg.desktop.grid.width")[0]
mem.var.heightHTML = task.node.getElementsByName("cfg.desktop.grid.height")[0]
mem.var.hMarginHTML = task.node.getElementsByName("cfg.desktop.grid.hMargin")[0]
mem.var.vMarginHTML = task.node.getElementsByName("cfg.desktop.grid.vMargin")[0]
mem.var.hLengthHTML = task.node.getElementsByName("cfg.desktop.grid.hLength")[0]
mem.var.vLengthHTML = task.node.getElementsByName("cfg.desktop.grid.vLength")[0]

//set values to html
mem.var.widthHTML.value = cfg.desktop.grid.width
mem.var.heightHTML.value = cfg.desktop.grid.height
mem.var.hMarginHTML.value = cfg.desktop.grid.hMargin
mem.var.vMarginHTML.value = cfg.desktop.grid.vMargin
mem.var.hLengthHTML.value = cfg.desktop.grid.hLength
mem.var.vLengthHTML.value = cfg.desktop.grid.vLength