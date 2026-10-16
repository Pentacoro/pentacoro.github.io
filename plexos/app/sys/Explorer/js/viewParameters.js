import plexos from "/boot/plexos.js"
import {getTask} from "/plexos/lib/functions/dll.js"
import { coreReadOnly } from "/plexos/lib/functions/readOnly.js"
import ProxyFile from "/plexos/lib/classes/filesystem/proxy.js"

let task = getTask(/TASKID/)
let mem  = task.mem

// How Explorer windows are laid out, the same for every user. Kept in Explorer's catalog entry under
// viewParameters: { sidebar: { pinned, width, visible }, menubar: <shown> }. Folder views are per folder
// in files.proxy instead (views.js).

function catalogEntry() {
    const registry = plexos.Core.registry
    if (!registry || !task.appID) return null
    const pointer = registry.resolveIndex(task.appID)
    return registry.appFile().data[pointer.bucket][pointer.name]
}

// Read without creating anything. Older cores kept the sidebar settings at the top of the entry
mem.readViewParameters = function () {
    const entry = catalogEntry()
    if (!entry) return {}
    const current = ("viewParameters" in entry) ? ProxyFile.unwrapProxy(entry.viewParameters) : {}
    if (!current.sidebar && "sidebar" in entry) current.sidebar = ProxyFile.unwrapProxy(entry.sidebar)
    return current
}

// Writes into viewParameters, or into one of its sections. An old top-level sidebar moves in first
mem.writeViewParameters = function (patch, section = null) {
    const entry = catalogEntry()
    if (!entry || coreReadOnly()) return
    if ("sidebar" in entry) {
        const old = ProxyFile.unwrapProxy(entry.sidebar)
        delete entry.sidebar
        if (!("viewParameters" in entry) || !("sidebar" in entry.viewParameters)) entry.viewParameters.sidebar = old
    }
    const target = section ? entry.viewParameters[section] : entry.viewParameters
    for (const [key, value] of Object.entries(patch)) target[key] = value
}
