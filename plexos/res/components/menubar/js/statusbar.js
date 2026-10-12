import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem

mem.statusbar = mem.statusbar || {}
mem.statusbar.path = task.node.getElementsByClassName("status-path")[0]
mem.statusbar.msg = task.node.getElementsByClassName("status-msg")[0]

mem.statusbar.setMessage = function (text, kind) {
    if (!mem.statusbar.msg) return
    mem.statusbar.msg.textContent = text || ""
    mem.statusbar.msg.className = "status-msg" + (kind ? " " + kind : "")
}

mem.statusbar.setDirty = function (bool) {
    mem.dirty = !!bool
    if (!mem.statusbar.path) return
    mem.statusbar.path.textContent = (mem.arg.fileAddr || "") + (mem.dirty ? " *" : "")
}

mem.statusbar.setDirty(!!mem.dirty)
mem.statusbar.setMessage("")
