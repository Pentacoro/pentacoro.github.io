import plexos from "/boot/plexos.js"
import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem

function inThisWindow(target) {
    return !!(task.window?.node && (target === task.window.node || task.window.node.contains(target)))
}

function onKeyDown(e) {
    if (!(e.ctrlKey || e.metaKey)) return
    const key = e.key.toLowerCase()
    if (key !== "z" && key !== "y") return
    if (plexos.System.mem.focused !== task && !inThisWindow(e.target)) return
    e.preventDefault()
    e.stopImmediatePropagation()
    if (key === "y" || (key === "z" && e.shiftKey)) mem.redo()
    else mem.undo()
}

document.addEventListener("keydown", onKeyDown, true)

const prevEnd = task.onEnd
task.onEnd = () => {
    document.removeEventListener("keydown", onKeyDown, true)
    if (prevEnd) prevEnd()
}
