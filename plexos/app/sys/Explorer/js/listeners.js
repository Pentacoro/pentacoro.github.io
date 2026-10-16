import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem

//a transfer into the folder on view selects what arrived
task.cmd("event.on", {eventName: "transfer-finished", callback: ({ to, moved }) => {
    mem.selectArrivals(to, moved)
}})
//the folder on view, or one it sits in, was moved, renamed or deleted
task.cmd("event.on", {eventName: "file-moved", callback: ({ oldPath, newPath }) => {
    mem.repathPins(oldPath, newPath)
    if (mem.showsPath(oldPath)) mem.folderLost()
}})
task.cmd("event.on", {eventName: "file-deleted", callback: ({ path }) => {
    mem.renderSidePanel()
    if (mem.showsPath(path)) mem.folderLost()
}})
//another Explorer window pinned or unpinned a folder
task.cmd("event.on", {eventName: "explorer-pins-changed", callback: (from) => {
    if (from === task.id) return
    mem.loadPins()
    mem.renderSidePanel()
}})
