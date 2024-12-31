import {getTask, displayComponent} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/files/file.js"

let task = getTask(/TASKID/)
let mem  = task.mem

//begin with 1st tab selected
task.node.getElementsByClassName("config-tab")[0].children[0].checked = true

mem.prepGeneral()