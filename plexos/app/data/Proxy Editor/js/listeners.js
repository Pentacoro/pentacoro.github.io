import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem

//the open file was written, by this window or anyone else
task.cmd("event.on", {eventName: "file-written", callback: ({ path }) => {
    if (path === mem.arg.fileAddr) mem.takeOutsideWrite()
}})
