import plexos from "/boot/plexos.js"
import {getTask} from "/plexos/lib/functions/dll.js"
import {control} from "/plexos/lib/functions/controls.js"
import { themeRoot } from "/plexos/lib/functions/theme.js"
import { coreReadOnly } from "/plexos/lib/functions/readOnly.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import ProxyFile from "/plexos/lib/classes/filesystem/proxy.js"
import ContextMenu from "/plexos/lib/classes/interface/contextmenu.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let side = mem.ui.side

// The side panel: folders pinned for quick access, the same for every user. Its pins, width and whether it shows
// are kept in Explorer's viewParameters.sidebar. A pinned folder that's gone stays listed, dimmed.
const defaultPins = ["@/home", "@/home/music", "@/home/images", "@/home/videos"]
const widthRange = [110, 420]

// Stored in Explorer's viewParameters, under sidebar (viewParameters.js)
function saved() {
    return mem.readViewParameters().sidebar || {}
}

function remember(patch) {
    mem.writeViewParameters(patch, "sidebar")
}

// Other Explorer windows show the same pins
function announce() {
    task.cmd("event.emit", { eventName: "explorer-pins-changed", args: [task.id] })
}

mem.loadPins = function () {
    const settings = saved()
    mem.pinned = Array.isArray(settings.pinned) ? [...settings.pinned] : [...defaultPins]
    mem.ui.body.classList.toggle("noSidePanel", settings.visible === false)
    if (settings.width) mem.setSidePanelWidth(settings.width)
    else requestAnimationFrame(mem.alignSidePanel)
}

// The default width puts the panel's right border on the same line as the address bar's left border.
// Measured, so it follows the navigation buttons, and never saved, so it stays the default
mem.alignSidePanel = function () {
    const address = mem.ui.nav.keyNodes.address.getBoundingClientRect()
    const body = mem.ui.body.getBoundingClientRect()
    if (!address.width) return
    mem.setSidePanelWidth(address.left - body.left + 1)
}

// Width while dragging the border. saveSidePanelWidth keeps it once the drag ends
mem.setSidePanelWidth = function (px) {
    const width = Math.round(Math.max(widthRange[0], Math.min(widthRange[1], px)))
    side.node.style.width = width + "px"
    return width
}
mem.saveSidePanelWidth = function () {
    remember({ width: side.node.offsetWidth })
}

function itemMenu(path) {
    return [
        {name: "open", list: [
            {name:"Open",icon:"url('/THEME/icons/interface/contextMenu/open.svg')",func: () => mem.navigate(path)},
            {name:"Open in new window",icon:"url('/THEME/icons/interface/contextMenu/newwindow.svg')",func: () => File.open(path),bool: !!File.at(path)},
        ]},
        {name: "pin", list: [
            {name:"Unpin from sidebar",icon:"url('')",func: () => mem.unpinFolder(path)},
        ]},
    ]
}

// menu builds the right-click menu when it opens, so it shows what applies then
function panelItem(path, menu) {
    const file = File.at(path)
    let image = `${themeRoot()}/icons/files/images/folder.svg`
    try { image = file?.cfg?.icon?.getImage?.() || image } catch { /* the folder's own picture isn't ready */ }
    const item = control("sidePanelItem", { name: file?.name ?? File.basename(path), image })
    item.node.dataset.path = path
    item.node.classList.toggle("missing", !file)
    item.node.onclick = () => mem.navigate(path)
    item.node.oncontextmenu = e => ContextMenu.open(e, task, menu())
    return item.node
}

// The bin always sits at the bottom of the panel. It isn't a pin, so it can't be unpinned
function binMenu() {
    return [
        {name: "open", list: [
            {name:"Open",icon:"url('/THEME/icons/interface/contextMenu/open.svg')",func: () => mem.navigate(File.trashPath)},
            {name:"Open in new window",icon:"url('/THEME/icons/interface/contextMenu/newwindow.svg')",func: () => File.open(File.trashPath)},
        ]},
        {name: "bin", list: [
            {name:"Empty the bin",icon:"url('/THEME/icons/interface/contextMenu/delete.svg')",func: () => mem.emptyBin(),bool: mem.binHasItems()},
        ]},
    ]
}

mem.renderSidePanel = function () {
    const pins = mem.pinned.filter(path => path !== File.trashPath)
    side.keyNodes.list.replaceChildren(...pins.map(path => panelItem(path, () => itemMenu(path))))
    side.keyNodes.bottom.replaceChildren(panelItem(File.trashPath, binMenu))
    mem.markSidePanel()
}

// The folder on view lights up in the panel
mem.markSidePanel = function () {
    for (const node of [...side.keyNodes.list.children, ...side.keyNodes.bottom.children]) {
        node.classList.toggle("current", node.dataset.path === mem.address)
    }
}

mem.isPinned = path => mem.pinned.includes(path)

mem.pinFolder = function (path) {
    if (mem.isPinned(path)) return
    mem.pinned.push(path)
    remember({ pinned: [...mem.pinned] })
    mem.renderSidePanel()
    announce()
}

mem.unpinFolder = function (path) {
    if (!mem.isPinned(path)) return
    mem.pinned = mem.pinned.filter(pin => pin !== path)
    remember({ pinned: [...mem.pinned] })
    mem.renderSidePanel()
    announce()
}

// A pinned folder, or one it sits in, was moved or renamed: the pin follows it
mem.repathPins = function (oldPath, newPath) {
    let moved = false
    mem.pinned = mem.pinned.map(pin => {
        if (pin !== oldPath && !pin.startsWith(oldPath + "/")) return pin
        moved = true
        return newPath + pin.slice(oldPath.length)
    })
    if (moved) remember({ pinned: [...mem.pinned] })
    mem.renderSidePanel()
}

mem.toggleSidePanel = function () {
    const hidden = mem.ui.body.classList.toggle("noSidePanel")
    remember({ visible: !hidden })
}

mem.loadPins()
mem.renderSidePanel()
