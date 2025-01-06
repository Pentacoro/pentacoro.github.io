import {getTask, displayComponent} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"

let task = getTask(/TASKID/)
let mem  = task.mem

//begin with 1st tab selected
task.node.getElementsByClassName("config-tab")[0].children[0].checked = true

mem.prepGeneral()
switch (mem.arg.cfg.type){
    case ("Metafile") :
        task.node.getElementsByClassName("config-tab")[1].classList.remove("hidden")
        task.node.getElementsByClassName("config-tab")[1].children[0].checked = true
        task.node.getElementsByClassName("config-tab")[1].dispatchEvent(new Event("click"))
        mem.prepMetadata()
}