import {getTask, displayComponent} from "/plexos/lib/functions/dll.js"
import Directory from "/plexos/lib/classes/files/directory.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let arg  = mem.arg

task.node.getElementById("Accept").onclick = ()=>{
    let url  = task.node.getElementsByName("URL")[0].value
    let type = task.node.getElementsByName("Type")[0].value

    arg.file.meta.file = url
    arg.file.rename(arg.file.name.replace(/(?:.(?<!\.))+$/s, type))

    if (type === "web") {
        //arg.file.cfg.icon.setImage(`https://s2.googleusercontent.com/s2/favicons?domain_url=${arg.file.meta.file}`)
        if (arg.file.meta.file.match(/(?<=.*\/.*\/.*)\/(.+)?/)) arg.file.cfg.icon.setImage(arg.file.meta.file.replace(/(?<=.*\/.*\/.*)\/(.+)?/, "/favicon.ico"))
        else arg.file.cfg.icon.setImage(arg.file.meta.file + "/favicon.ico")
    }
    if (type === "img") {
        arg.file.cfg.icon.setImage(arg.file.meta.file)
    }

    console.log(arg.file.cfg)
    if(Directory.isOpen(arg.file.cfg.parent)) Directory.isOpen(arg.file.cfg.parent).mem.refresh()
    task.end()
}
task.node.getElementById("Cancel").onclick = ()=>{
    task.end()
}