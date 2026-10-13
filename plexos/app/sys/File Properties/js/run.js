import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let sheet = mem.ui.sheet

//begin with 1st tab selected
sheet.select("general")

mem.prepGeneral()
switch (mem.arg.cfg.class){
    case ("MetaFile") :
        sheet.showTab("metadata")
        sheet.select("metadata")
        mem.prepMetadata()
}
