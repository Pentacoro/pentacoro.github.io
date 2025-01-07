import {getTask} from "/plexos/lib/functions/dll.js"
import Task from "/plexos/lib/classes/system/task.js"

let task = getTask(/TASKID/)
let mem  = task.mem
mem.cfg  = Task.get("Desktop").mem.cfg
mem.var  = {}

//configuration
mem.var.configEditable = "mem.cfg.grid"
mem.var.configFilePath = mem.cfg.path+"/grid.json"
mem.var.configInitialState = { ...eval(mem.var.configEditable)}

//html references
mem.var.widthHTML = task.node.getElementsByName("mem.cfg.grid.width")[0]
mem.var.heightHTML = task.node.getElementsByName("mem.cfg.grid.height")[0]
mem.var.hMarginHTML = task.node.getElementsByName("mem.cfg.grid.hMargin")[0]
mem.var.vMarginHTML = task.node.getElementsByName("mem.cfg.grid.vMargin")[0]
mem.var.hLengthHTML = task.node.getElementsByName("mem.cfg.grid.hLength")[0]
mem.var.vLengthHTML = task.node.getElementsByName("mem.cfg.grid.vLength")[0]

//set values to html
mem.var.widthHTML.value = mem.cfg.grid.width
mem.var.heightHTML.value = mem.cfg.grid.height
mem.var.hMarginHTML.value = mem.cfg.grid.hMargin
mem.var.vMarginHTML.value = mem.cfg.grid.vMargin
mem.var.hLengthHTML.value = mem.cfg.grid.hLength
mem.var.vLengthHTML.value = mem.cfg.grid.vLength