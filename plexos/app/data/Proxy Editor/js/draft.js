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
mem.loadDraft = function () { // edit a clone; save writes through file.write / cmd
    const file = File.at(mem.arg.fileAddr)
    const data = file ? ProxyFile.unwrapProxy(file.data) : {}
    mem.draft = (data && typeof data === "object" && !Array.isArray(data)) ? mem.clone(data) : {}
    mem.collapsed = new Set()
    mem.walkCollapse(mem.draft, [])
    mem.resetLog()
    mem.setStatus("")
}
mem.sourceText = function () {
    return mem.editor ? mem.editor.getValue() : "{}"
}
mem.applySource = function () {
    try {
        const parsed = JSON.parse(mem.sourceText() || "{}")
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            mem.setStatus("Root must be an object", "error")
            return false
        }
        mem.draft = parsed
        mem.setStatus("")
        return true
    } catch (e) {
        mem.setStatus("Invalid JSON", "error")
        return false
    }
}
mem.saveDraft = function () {
    if (mem.mode === "json" && !mem.flushJsonHistory()) return false
    task.cmd("file.write", { path: mem.arg.fileAddr, data: mem.clone(mem.draft) })
    mem.savedSnap = mem.snapDraft()
    mem.syncDirty()
    mem.setStatus("Saved", "ok")
    return true
}
