import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let node = task.node

mem.mode = "tree"
mem.dirty = false
mem.collapsed = new Set()
mem.draft = {}

mem.treeEl = node.getElementsByClassName("tree")[0]
mem.editorEl = node.getElementsByClassName("editor")[0]
mem.jsonLoadingEl = node.getElementsByClassName("json-loading")[0]

mem.clone = function (value) {
    return JSON.parse(JSON.stringify(value ?? {}))
}
mem.typeOf = function (value) {
    if (value === null) return "null"
    if (Array.isArray(value)) return "array"
    return typeof value
}
mem.coerce = function (type) {
    switch (type) {
        case "object": return {}
        case "array": return []
        case "number": return 0
        case "boolean": return false
        case "null": return null
        default: return ""
    }
}
mem.atPath = function (root, path) {
    let cur = root
    for (const key of path) cur = cur?.[key]
    return cur
}
mem.parentPath = function (path) {
    return path.slice(0, -1)
}
mem.uniqueKey = function (object, base) {
    if (!(base in object)) return base
    let n = 2
    while (`${base} ${n}` in object) n++
    return `${base} ${n}`
}
mem.setStatus = function (text, kind) {
    mem.statusbar?.setMessage?.(text, kind)
}
mem.markDirty = function (bool) {
    if (mem.statusbar?.setDirty) mem.statusbar.setDirty(bool)
    else mem.dirty = !!bool
}
