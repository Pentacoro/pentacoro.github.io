import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem

mem.log = []
mem.logCursor = -1
mem.savedSnap = "{}"
mem.historyQuiet = false

mem.snapDraft = function () {
    return JSON.stringify(mem.draft ?? {})
}
mem.resetLog = function () {
    mem.log = [{ draft: mem.clone(mem.draft) }]
    mem.logCursor = 0
    mem.savedSnap = mem.snapDraft()
    mem.syncDirty()
}
mem.syncDirty = function () {
    mem.markDirty(mem.snapDraft() !== mem.savedSnap)
}
mem.recordChange = function () {
    if (mem.historyQuiet) return
    const snap = mem.snapDraft()
    const current = mem.log[mem.logCursor]
    if (current && JSON.stringify(current.draft) === snap) {
        mem.syncDirty()
        return
    }
    mem.log = mem.log.slice(0, mem.logCursor + 1)
    mem.log.push({ draft: mem.clone(mem.draft) })
    if (mem.log.length > 100) {
        mem.log.shift()
    }
    mem.logCursor = mem.log.length - 1
    mem.syncDirty()
}
mem.applyLogEntry = function () {
    const entry = mem.log[mem.logCursor]
    if (!entry) return
    mem.historyQuiet = true
    mem.draft = mem.clone(entry.draft)
    mem.syncDirty()
    if (mem.mode === "json") mem.showJson()
    else mem.renderTree()
    mem.historyQuiet = false
}
mem.flushJsonHistory = function () {
    if (mem.jsonHistoryTimer) {
        clearTimeout(mem.jsonHistoryTimer)
        mem.jsonHistoryTimer = null
    }
    if (mem.mode !== "json") return true
    if (!mem.applySource()) return false
    mem.recordChange()
    return true
}
mem.queueJsonHistory = function () {
    if (mem.jsonHistoryTimer) clearTimeout(mem.jsonHistoryTimer)
    mem.jsonHistoryTimer = setTimeout(() => {
        mem.jsonHistoryTimer = null
        if (mem.mode !== "json" || mem.historyQuiet) return
        if (!mem.applySource()) return
        mem.recordChange()
    }, 300)
}
mem.undo = function () {
    if (mem.mode === "json" && !mem.flushJsonHistory()) return
    if (mem.logCursor <= 0) return
    mem.logCursor--
    mem.applyLogEntry()
    mem.setStatus("Undo")
}
mem.redo = function () {
    if (mem.mode === "json" && !mem.flushJsonHistory()) return
    if (mem.logCursor >= mem.log.length - 1) return
    mem.logCursor++
    mem.applyLogEntry()
    mem.setStatus("Redo")
}
