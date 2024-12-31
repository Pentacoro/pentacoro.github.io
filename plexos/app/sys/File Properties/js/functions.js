import {getTask, displayComponent} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/files/file.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let element = mem.element

let dateFormatter = new Intl.DateTimeFormat('en-UK', 
    {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }
)

mem.prepGeneral = function () {
    task.node.querySelector(".config-option.wide>label>img").setAttribute("src", mem.arg.cfg.icon.image)
    element.fileName.value = mem.arg.displayName()
    element.fileType.innerText = mem.arg.cfg.type 
    element.fileExte.innerText = "."+mem.arg.cfg.exte 
    element.fileAddr.innerText = mem.arg.cfg.path 
    element.fileAddr.title = mem.arg.cfg.path 
    element.fileSize.innerText = `${mem.arg.size()} (${mem.arg.size("bytes")})`
    element.fileDateCreated.innerText  = ( (mem.arg.cfg.date.Created ) ? dateFormatter.format(new Date(mem.arg.cfg.date.Created )) : mem.arg.cfg.date.Created )
    element.fileDateModified.innerText = ( (mem.arg.cfg.date.Modified) ? dateFormatter.format(new Date(mem.arg.cfg.date.Modified)) : mem.arg.cfg.date.Modified)
    element.fileDateAccessed.innerText = ( (mem.arg.cfg.date.Accessed) ? dateFormatter.format(new Date(mem.arg.cfg.date.Accessed)) : mem.arg.cfg.date.Accessed)
}