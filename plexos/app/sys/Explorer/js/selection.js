import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem

// Selection works like Windows. A plain click selects one icon and makes it the anchor. Ctrl toggles one icon
// and moves the anchor to it. Shift selects everything between the anchor and the icon clicked, in the order
// the icons are shown, replacing the rest, so clicking on the anchor's other side drops the first side.
// Ctrl+Shift adds that range to what's already selected.
mem.anchor = null

function shown() {
    return [...mem.ui.view.keyNodes.list.children]
        .map(node => mem.iconArray.find(icon => icon.node === node))
        .filter(Boolean)
}

function setSelected(icon, on) {
    if (on) {
        if (!task.pocket.includes(icon)) task.pocket.push(icon)
        icon.statNode(1)
    } else {
        task.pocket = task.pocket.remove(icon)
        icon.statNode(0)
    }
}

mem.setSelected = setSelected // for the selection box (selectbox.js)

mem.clearSelection = function () {
    for (const icon of [...task.pocket]) setSelected(icon, false)
}

mem.selectOnly = function (icon) {
    for (const other of [...task.pocket]) if (other !== icon) setSelected(other, false)
    setSelected(icon, true)
    mem.anchor = icon
}

mem.toggleSelected = function (icon) {
    setSelected(icon, icon.state !== 1)
    mem.anchor = icon
}

mem.selectRange = function (icon, add = false) {
    const order = shown()
    const anchor = order.includes(mem.anchor) ? mem.anchor : null
    if (!anchor) return mem.selectOnly(icon)
    const [from, to] = [order.indexOf(anchor), order.indexOf(icon)].sort((a, b) => a - b)
    const range = order.slice(from, to + 1)
    if (!add) for (const other of [...task.pocket]) if (!range.includes(other)) setSelected(other, false)
    for (const each of range) setSelected(each, true)
}

mem.selectAll = function () {
    for (const icon of shown()) setSelected(icon, true)
}

mem.invertSelection = function () {
    for (const icon of shown()) setSelected(icon, icon.state !== 1)
}
