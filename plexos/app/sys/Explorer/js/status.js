import {getTask} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"

let task = getTask(/TASKID/)
let mem  = task.mem

// The status bar, as in Windows: how many items the folder shows, then how many are selected and, when files are
// among them, their combined size. Folders add nothing to the size.
const sizeFormat = new Intl.NumberFormat("en-UK", { maximumFractionDigits: 1 })
const units = ["bytes", "KB", "MB", "GB", "TB"]

function sizeText(bytes) {
    let unit = 0
    let value = bytes
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024
        unit++
    }
    return sizeFormat.format(value) + " " + units[unit]
}

function bytesOf(file) {
    return Number(String(file.size("bytes")).replace(/[^\d]/g, "")) || 0
}

function items(count) {
    return count === 1 ? "1 item" : count + " items"
}

mem.updateStatus = function () {
    const bar = mem.statusbar
    if (!bar?.path) return
    bar.path.textContent = items(mem.iconArray.length)
    const selected = task.pocket.filter(icon => mem.iconArray.includes(icon))
    if (!selected.length) return bar.setMessage("")
    const files = selected.map(icon => File.at(icon.file)).filter(file => file && file.cfg.class !== "DirectoryFile")
    const size = files.length ? "  " + sizeText(files.reduce((sum, file) => sum + bytesOf(file), 0)) : ""
    bar.setMessage(items(selected.length) + " selected" + size)
}

// Many changes can land at once (a refresh, select all), so the bar is rebuilt once afterwards
let queued = false
mem.statusChanged = function () {
    if (queued) return
    queued = true
    queueMicrotask(() => {
        queued = false
        mem.updateStatus()
    })
}
