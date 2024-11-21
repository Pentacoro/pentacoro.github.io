import Task from "/plexos/lib/classes/system/task.js"
import File from "/plexos/lib/classes/files/file.js"

let task = Task.id("TASKID")
let url  = File.at(arg[1]).meta.file
let mem  = task.mem

mem.url  = url

document.getElementsByTagName("iframe")[0].setAttribute("src", url)