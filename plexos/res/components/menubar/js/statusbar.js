import {getTask} from "/plexos/lib/functions/dll.js"
import {control} from "/plexos/lib/functions/controls.js"

let task = getTask(/TASKID/)
let mem  = task.mem

const statusbar = control("statusbar")
task.node.getElementById(task.id + "_statusbar").replaceChildren(statusbar.node)

mem.statusbar = mem.statusbar || {}
mem.statusbar.keyNodes = statusbar.keyNodes
mem.statusbar.path = statusbar.keyNodes.path
mem.statusbar.msg = statusbar.keyNodes.message

const messageKinds = ["ok", "error"]

mem.statusbar.setMessage = function (text, kind) {
    mem.statusbar.msg.textContent = text || ""
    for (const state of messageKinds) mem.statusbar.msg.classList.toggle(state, state === kind)
}

mem.statusbar.setDirty = function (bool) {
    mem.dirty = !!bool
    mem.statusbar.path.textContent = (mem.arg.fileAddr || "Untitled") + (mem.dirty ? " *" : "")
}

mem.statusbar.setDirty(!!mem.dirty)
mem.statusbar.setMessage("")
