import {getTask} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import ProxyFile from "/plexos/lib/classes/filesystem/proxy.js"

let task = getTask(/TASKID/)
let mem  = task.mem

mem.walkCollapse = function (value, path) {
    const type = mem.typeOf(value)
    if (type !== "object" && type !== "array") return
    if (path.length) mem.collapsed.add(JSON.stringify(path))
    const entries = type === "array" ? value.map((item, i) => [i, item]) : Object.entries(value)
    for (const [key, child] of entries) mem.walkCollapse(child, path.concat([key]))
}
// The file's contents as a plain object, or null when the file is gone.
mem.readFile = function () {
    const file = File.at(mem.arg.fileAddr)
    if (!file) return null
    const data = ProxyFile.unwrapProxy(file.data)
    return (data && typeof data === "object" && !Array.isArray(data)) ? mem.clone(data) : {}
}
mem.loadDraft = function () { // edit a clone; save writes through file.write / cmd
    mem.draft = mem.readFile() || {}
    mem.diskSnap = mem.snapDraft()
    mem.collapsed = new Set()
    mem.walkCollapse(mem.draft, [])
    mem.resetLog()
    mem.setStatus("")
}
// Someone else wrote the open file. Show it, unless that would throw away unsaved edits.
mem.takeOutsideWrite = function () {
    const data = mem.readFile()
    if (!data) return
    const snap = JSON.stringify(data)
    if (snap === mem.diskSnap) return
    mem.diskSnap = snap
    if (mem.snapDraft() !== mem.savedSnap) {
        mem.setStatus("The file changed. Reload to see it and drop your edits", "error")
        return
    }
    mem.draft = data
    mem.savedSnap = snap
    mem.recordChange()
    mem.refreshView()
    mem.setStatus("Updated from file", "ok")
}
mem.saveDraft = function () {
    mem.diskSnap = mem.snapDraft() // the write this makes comes back as file-written. It's already shown
    task.cmd("file.write", { path: mem.arg.fileAddr, data: mem.clone(mem.draft) })
    mem.savedSnap = mem.snapDraft()
    mem.syncDirty()
    mem.setStatus("Saved", "ok")
    return true
}
