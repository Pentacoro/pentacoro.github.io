import {getTask} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let nav  = mem.ui.nav.keyNodes

// Back and forward through the folders this window has shown. Every move to another folder goes through
// mem.navigate so it's recorded. The first folder and refreshes aren't steps.
const limit = 50
mem.history = { back: [], forward: [] }

function isFolder(path) {
    return File.at(path)?.cfg?.class === "DirectoryFile"
}

function syncButtons() {
    nav.back.disabled = !mem.history.back.length
    nav.forward.disabled = !mem.history.forward.length
}

// The folder being left goes on the back stack, unless it's gone already
function leave(stack) {
    if (!isFolder(mem.address)) return
    stack.push(mem.address)
    if (stack.length > limit) stack.shift()
}

mem.navigate = function (path) {
    if (!isFolder(path)) return mem.folderLost()
    if (path !== mem.address) {
        leave(mem.history.back)
        mem.history.forward = []
    }
    syncButtons()
    return mem.explorerInit(path, task.id)
}

// One step from one stack, putting the folder being left on the other. A step to a folder that's gone errors
function step(from, to) {
    const target = mem.history[from].pop()
    if (target === undefined) return
    if (!isFolder(target)) {
        syncButtons()
        return mem.folderLost()
    }
    leave(mem.history[to])
    syncButtons()
    return mem.explorerInit(target, task.id)
}
mem.goBack = () => step("back", "forward")
mem.goForward = () => step("forward", "back")

syncButtons()
