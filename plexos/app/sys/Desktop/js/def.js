import { getTask } from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"

let task  = getTask(/TASKID/)
let mem   = task.mem
let arg   = mem.arg

mem.define = function () {
    mem.iconArr = []
    mem.address = arg.address
    mem.dirObject   = File.at(arg.address)
    mem.var.dirname = File.at(arg.address).name

    mem.cfg = {
        path: `/plexos/cfg/desks/${mem.var.dirname}`,
        grid: JSON.parse(File.at(`/plexos/cfg/desks/${mem.var.dirname}/grid.json`).data),
        back: JSON.parse(File.at(`/plexos/cfg/desks/${mem.var.dirname}/background.json`).data),
        icon: JSON.parse(File.at(`/plexos/cfg/desks/${mem.var.dirname}/icon.json`).data),
        task: JSON.parse(File.at(`/plexos/cfg/desks/${mem.var.dirname}/taskbar.json`).data),
    }
}

mem.define()