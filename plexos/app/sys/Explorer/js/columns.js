import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let view = mem.ui.view

// Details columns resize from their right border, as in Windows. Widths are window layout, shared like the
// sidebar's (viewParameters.columns). A column never dragged keeps the theme's width, which for the name
// column means filling what's left.
const minWidth = 40
const order = ["name", "date", "type", "size"]
let widths = { ...(mem.readViewParameters().columns || {}) }

mem.applyColumns = function () {
    for (const [key, width] of Object.entries(widths)) view.node.style.setProperty("--column-" + key, width + "px")
}

function startResize(e, cell) {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const key = cell.dataset.sort
    // the column's track as laid out now. The first track is the icon's, which the name header also spans
    const tracks = getComputedStyle(view.keyNodes.header).gridTemplateColumns.split(" ").map(parseFloat)
    const start = tracks[order.indexOf(key) + 1]
    const startX = e.clientX
    let moved = false
    view.node.classList.add("resizingColumn")

    const move = ev => {
        moved = true
        widths[key] = Math.max(minWidth, Math.round(start + ev.clientX - startX))
        mem.applyColumns()
    }
    const up = () => {
        document.removeEventListener("mousemove", move)
        document.removeEventListener("mouseup", up)
        view.node.classList.remove("resizingColumn")
        if (!moved) return
        mem.writeViewParameters({ columns: { ...widths } })
        // the click that ends a drag isn't a sort
        const swallow = ev => ev.stopPropagation()
        window.addEventListener("click", swallow, true)
        setTimeout(() => window.removeEventListener("click", swallow, true))
    }
    document.addEventListener("mousemove", move)
    document.addEventListener("mouseup", up)
}

for (const cell of view.keyNodes.header.querySelectorAll(".detailsColumn")) {
    const handle = document.createElement("span")
    handle.className = "columnResizer"
    handle.addEventListener("mousedown", e => startResize(e, cell))
    cell.appendChild(handle)
}

mem.applyColumns()
