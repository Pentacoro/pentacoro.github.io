import plexos from "/boot/plexos.js"
import {getTask} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import ProxyFile from "/plexos/lib/classes/filesystem/proxy.js"
import { coreReadOnly } from "/plexos/lib/functions/readOnly.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let view = mem.ui.view

// Four layouts of the same icons, after Windows 10: large icons, a list, a details table and tiles.
// The layouts are the theme's CSS for .view-<name>; this file picks one, fills in the detail text and sorts.
// Each folder keeps its own view and sort in its files.proxy entry, under applications.Explorer.
mem.views = ["icons", "list", "details", "tiles"]
const defaultView = "details" // a folder with no view of its own
mem.view = defaultView
mem.sort = null // { key, dir }: dir 1 ascending, -1 descending. Null keeps the order the folder was read in

const columns = [["name", "Name"], ["date", "Date modified"], ["type", "Type"], ["size", "Size"]]
// In the bin the middle columns tell when something was recycled and where it came from
const binLabels = { date: "Date deleted", type: "Original location" }
const headerCells = {}
view.keyNodes.header.replaceChildren(...columns.map(([key, label]) => {
    const cell = document.createElement("span")
    cell.className = "detailsColumn " + key
    const text = document.createElement("span") // the label alone, so the column's resizer (columns.js) stays
    text.className = "detailsLabel"
    text.textContent = label
    cell.appendChild(text)
    cell.dataset.sort = key
    headerCells[key] = cell
    return cell
}))

const typeNames = {
    txt: "Text Document",
    web: "Web Shortcut",
    meta: "MetaFile",
    proxy: "Proxy File",
    json: "JSON File",
    js: "JavaScript File",
    img: "Image Shortcut",
    vid: "Video Shortcut",
}
const dateFormat = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
})

mem.typeName = function (file) {
    if (file.cfg.class === "DirectoryFile") return "File folder"
    const exte = String(file.cfg.exte || "").toLowerCase()
    return typeNames[exte] || (exte ? exte.toUpperCase() + " File" : "File")
}

// The bin's wrapper for something sitting right in the bin, else null
function binInfo(file) {
    return File.dirname(file.cfg.path) === File.trashPath ? File.binEntry(file.cfg.path) : null
}

function stampOf(file) {
    const recycled = binInfo(file)?.recycled
    if (recycled) return recycled
    return file.cfg.date?.Modified ?? file.cfg.date?.Created ?? 0
}

function typeOrOrigin(file) {
    return binInfo(file)?.from ?? mem.typeName(file)
}

function bytesOf(file) {
    if (file.cfg.class === "DirectoryFile") return -1
    return Number(String(file.size("bytes")).replace(/[^\d]/g, "")) || 0
}

// Date modified, type and size for one icon. Folders have no size, as in Windows
mem.fillDetails = function (icon) {
    const file = File.at(icon.file)
    const keys = icon.keyNodes
    if (!file || !keys?.date) return
    const stamp = stampOf(file)
    keys.date.textContent = stamp ? dateFormat.format(new Date(stamp)) : ""
    keys.type.textContent = typeOrOrigin(file)
    keys.size.textContent = (file.cfg.class === "DirectoryFile") ? "" : file.size()
}

// Folders before files, then by the column. Descending turns the whole order around, as in Windows
const compare = {
    name: (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }),
    date: (a, b) => stampOf(a) - stampOf(b),
    type: (a, b) => typeOrOrigin(a).localeCompare(typeOrOrigin(b)),
    size: (a, b) => bytesOf(a) - bytesOf(b),
}
mem.applySort = function () {
    for (const [key, cell] of Object.entries(headerCells)) {
        cell.classList.toggle("sorted", mem.sort?.key === key)
        cell.classList.toggle("descending", mem.sort?.key === key && mem.sort.dir < 0)
    }
    if (!mem.sort || !compare[mem.sort.key]) return
    const { key, dir } = mem.sort
    const entries = mem.iconArray.map(icon => ({ icon, file: File.at(icon.file) })).filter(entry => entry.file)
    entries.sort((a, b) => {
        const folders = (b.file.cfg.class === "DirectoryFile") - (a.file.cfg.class === "DirectoryFile")
        return dir * (folders || compare[key](a.file, b.file) || compare.name(a.file, b.file))
    })
    mem.iconArray = entries.map(entry => entry.icon)
    for (const icon of mem.iconArray) view.keyNodes.list.appendChild(icon.node)
}

// The saved settings of the folder at path, without creating an entry just by looking
function savedFor(path) {
    const data = plexos.Core.registry?.fileFile()?.data
    if (!data || !(path in data)) return null
    return ProxyFile.unwrapProxy(data[path])?.applications?.Explorer || null
}
function remember(patch) {
    const data = plexos.Core.registry?.fileFile()?.data
    if (!data || coreReadOnly() || !mem.address) return
    const entry = data[mem.address].applications.Explorer
    for (const [key, value] of Object.entries(patch)) entry[key] = value
}

function showView(name) {
    if (!mem.views.includes(name)) name = defaultView
    mem.view = name
    for (const each of mem.views) view.node.classList.toggle("view-" + each, each === name)
    for (const icon of mem.iconArray) icon.paintIcon()
}

// The folder at path is about to show: take on its own view and sort
mem.loadFolderView = function (path) {
    const inBin = path === File.trashPath
    for (const [key, label] of columns) headerCells[key].firstChild.textContent = (inBin && binLabels[key]) || label
    const saved = savedFor(path)
    mem.sort = saved?.sort ? { key: saved.sort.key, dir: saved.sort.dir } : null
    showView(saved?.view || defaultView)
}

mem.setView = function (name) {
    showView(name)
    remember({ view: mem.view })
}

// A header click sorts by its column. The same column again turns the order around
mem.sortBy = function (key) {
    if (!compare[key]) return
    mem.sort = { key, dir: (mem.sort?.key === key) ? -mem.sort.dir : 1 }
    mem.applySort()
    remember({ sort: { ...mem.sort } })
}

showView(defaultView)
