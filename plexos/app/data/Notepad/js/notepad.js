import {getTask, selectText} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"

let task = getTask(/TASKID/)
let mem  = task.mem

mem.textArea = task.node.getElementsByTagName("textarea")[0]
mem.var.textarea = mem.textArea
mem.dirty = false
mem.log = []
mem.logCursor = -1
mem.savedSnap = ""
mem.historyQuiet = false

mem.snapText = function () {
    return mem.textArea.value ?? ""
}
mem.syncDirty = function () {
    if (mem.statusbar?.setDirty) mem.statusbar.setDirty(mem.snapText() !== mem.savedSnap)
    else mem.dirty = mem.snapText() !== mem.savedSnap
}
mem.resetLog = function () {
    mem.log = [mem.snapText()]
    mem.logCursor = 0
    mem.savedSnap = mem.snapText()
    mem.syncDirty()
}
mem.recordChange = function () {
    if (mem.historyQuiet) return
    const snap = mem.snapText()
    if (mem.log[mem.logCursor] === snap) {
        mem.syncDirty()
        return
    }
    mem.log = mem.log.slice(0, mem.logCursor + 1)
    mem.log.push(snap)
    if (mem.log.length > 100) mem.log.shift()
    mem.logCursor = mem.log.length - 1
    mem.syncDirty()
}
mem.queueHistory = function () {
    if (mem.historyTimer) clearTimeout(mem.historyTimer)
    mem.historyTimer = setTimeout(() => {
        mem.historyTimer = null
        mem.recordChange()
    }, 300)
}
mem.applyLogEntry = function () {
    const snap = mem.log[mem.logCursor]
    if (snap === undefined) return
    mem.historyQuiet = true
    mem.textArea.value = snap
    mem.syncDirty()
    mem.historyQuiet = false
}
mem.undo = function () {
    if (mem.historyTimer) {
        clearTimeout(mem.historyTimer)
        mem.historyTimer = null
        mem.recordChange()
    }
    if (mem.logCursor <= 0) return
    mem.logCursor--
    mem.applyLogEntry()
    mem.statusbar?.setMessage?.("Undo")
}
mem.redo = function () {
    if (mem.historyTimer) {
        clearTimeout(mem.historyTimer)
        mem.historyTimer = null
        mem.recordChange()
    }
    if (mem.logCursor >= mem.log.length - 1) return
    mem.logCursor++
    mem.applyLogEntry()
    mem.statusbar?.setMessage?.("Redo")
}
mem.save = function () {
    if (mem.historyTimer) {
        clearTimeout(mem.historyTimer)
        mem.historyTimer = null
        mem.recordChange()
    }
    task.cmd("file.write", { path: mem.arg.fileAddr, data: mem.snapText() })
    mem.savedSnap = mem.snapText()
    mem.syncDirty()
    mem.statusbar?.setMessage?.("Saved", "ok")
}
mem.reload = function () {
    const file = File.at(mem.arg.fileAddr)
    mem.textArea.value = file?.data ?? ""
    mem.resetLog()
    mem.statusbar?.setMessage?.("")
}

mem.textArea.value = mem.arg.textData ?? ""
mem.resetLog()
mem.textArea.addEventListener("input", () => {
    mem.syncDirty()
    mem.queueHistory()
})

task.window.node.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        mem.save()
    }
})
task.window.node.addEventListener("onfocus", e => {
    mem.textArea.focus()
    selectText(mem.textArea)
})
task.window.node.addEventListener("blur", e => {
    mem.var.selectionRange = window.getSelection()
    task.node.blur()
})
