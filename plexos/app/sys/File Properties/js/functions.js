import {getTask, displayComponent} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/files/file.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let element = mem.element

mem.prepGeneral = function () {
    element.fileName.value = mem.arg.displayName()
    element.fileType.innerText = mem.arg.cfg.type 
    element.fileExte.innerText = "."+mem.arg.cfg.exte 
    element.fileAddr.innerText = mem.arg.cfg.addr 
    element.fileAddr.title = mem.arg.cfg.addr 
    element.fileSize.innerText = mem.arg.cfg.size 
    element.fileDateCreated.innerText  = mem.arg.cfg.dateCreated 
    element.fileDateModified.innerText = mem.arg.cfg.dateModified 
    element.fileDateAccessed.innerText = mem.arg.cfg.dateAccessed
}