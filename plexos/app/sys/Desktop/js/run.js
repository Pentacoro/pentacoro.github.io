import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let arg  = mem.arg
let cfg  = mem.cfg

task.node.style.width = document.body.offsetWidth + "px"
task.node.style.height = document.body.offsetHeight - cfg.task.height + "px"
mem.desktopInit(arg.address, task.id)