import {getTask, displayComponent} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let tab  = mem.tab

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
    task.node.querySelector(`#${task.id}_general .config-option.header>label>img`).setAttribute("src", mem.arg.cfg.icon.getImage())
    tab.general.fileName.value = mem.arg.displayName()
    tab.general.fileClass.innerText = mem.arg.cfg.class 
    tab.general.fileExte.innerText = "."+mem.arg.cfg.exte 
    tab.general.fileAddr.innerText = mem.arg.cfg.path 
    tab.general.fileAddr.title = mem.arg.cfg.path 
    tab.general.fileSize.innerText = `${mem.arg.size()} (${mem.arg.size("bytes")})`
    tab.general.fileDateCreated.innerText  = ( (mem.arg.cfg.date.Created ) ? dateFormatter.format(new Date(mem.arg.cfg.date.Created )) : mem.arg.cfg.date.Created )
    tab.general.fileDateModified.innerText = ( (mem.arg.cfg.date.Modified) ? dateFormatter.format(new Date(mem.arg.cfg.date.Modified)) : mem.arg.cfg.date.Modified)
    tab.general.fileDateAccessed.innerText = ( (mem.arg.cfg.date.Accessed) ? dateFormatter.format(new Date(mem.arg.cfg.date.Accessed)) : mem.arg.cfg.date.Accessed)

    for (let pair of Object.entries(tab.general)) {
        if (pair[1].innerText === "undefined") pair[1].parentElement.remove()
    }
}
mem.prepMetadata = function () {
    if (!task.node.getElementById(task.id+"_metadata")) return
    task.node.querySelector(`#${task.id}_metadata .config-option.header>label>img`).setAttribute("src", mem.arg.meta.image)
}