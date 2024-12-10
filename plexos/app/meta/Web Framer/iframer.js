import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem

mem.var.url  = mem.arg.file.meta.file

task.node.getElementsByTagName("iframe")[0].setAttribute("src", mem.var.url)