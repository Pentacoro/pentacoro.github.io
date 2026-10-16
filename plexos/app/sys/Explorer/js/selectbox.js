import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let area = mem.ui.view.node

// The selection box: dragging across empty space selects every icon the box touches. A plain drag replaces the
// selection; Ctrl+drag adds to what was selected before it began. The box lives inside the scrolling file view,
// so it's measured in the view's own coordinates (scroll included) and keeps up while the view scrolls.
mem.selectBox = function (e) {
    if (e.button !== 0) return
    const kept = e.ctrlKey ? new Set(task.pocket) : new Set()
    // the box stays inside the view's content as it was when the drag began, so it can't grow it and bring up scrollbars
    const limit = { x: area.scrollWidth, y: area.scrollHeight }
    const origin = point(e)
    let box = null
    let last = e

    function point(ev) {
        const rect = area.getBoundingClientRect()
        const x = ev.clientX - rect.left + area.scrollLeft, y = ev.clientY - rect.top + area.scrollTop
        return { x: Math.min(Math.max(x, 0), limit.x), y: Math.min(Math.max(y, 0), limit.y) }
    }

    function update(ev) {
        last = ev
        const now = point(ev)
        const left = Math.min(origin.x, now.x), top = Math.min(origin.y, now.y)
        const width = Math.abs(now.x - origin.x), height = Math.abs(now.y - origin.y)
        if (!box) {
            if (width < 3 && height < 3) return
            box = document.createElement("div")
            box.className = "selectBox"
            area.appendChild(box)
        }
        Object.assign(box.style, { left: left + "px", top: top + "px", width: width + "px", height: height + "px" })
        const areaRect = area.getBoundingClientRect()
        for (const icon of mem.iconArray) {
            const r = icon.node.getBoundingClientRect()
            const x = r.left - areaRect.left + area.scrollLeft, y = r.top - areaRect.top + area.scrollTop
            const touched = x < left + width && x + r.width > left && y < top + height && y + r.height > top
            mem.setSelected(icon, touched || kept.has(icon))
        }
    }

    const move = ev => update(ev)
    const scroll = () => update(last)
    const up = () => {
        document.removeEventListener("mousemove", move)
        document.removeEventListener("mouseup", up)
        area.removeEventListener("scroll", scroll)
        box?.remove()
        if (task.pocket.length) mem.anchor = task.pocket[task.pocket.length - 1]
    }
    document.addEventListener("mousemove", move)
    document.addEventListener("mouseup", up)
    area.addEventListener("scroll", scroll)
}
