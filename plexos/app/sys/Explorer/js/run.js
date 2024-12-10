import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let arg  = mem.arg

mem.explorerInit(arg.address, task.id)