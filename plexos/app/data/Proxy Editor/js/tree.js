import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem

mem.renderTree = function () {
    mem.jsonLoadingEl.classList.add("hidden")
    mem.editorEl.classList.add("behind")
    mem.treeEl.classList.remove("hidden")
    mem.treeEl.innerHTML = ""
    const rootAdd = document.createElement("div")
    rootAdd.className = "row root-row"
    rootAdd.dataset.path = "[]"
    const hint = document.createElement("span")
    hint.className = "hint"
    hint.textContent = "root object"
    const addRoot = document.createElement("button")
    addRoot.type = "button"
    addRoot.textContent = "Add key"
    addRoot.onclick = () => mem.addChild([])
    rootAdd.append(hint, addRoot)
    mem.treeEl.append(rootAdd)
    mem.renderChildren(mem.treeEl, mem.draft, [], 0, [])
    mem.syncCountWidths()
}
mem.renderChildren = function (host, value, path, depth, ancestorLast) {
    const type = mem.typeOf(value)
    if (type !== "object" && type !== "array") return
    const entries = type === "array"
        ? value.map((item, i) => [i, item])
        : Object.entries(value)
    entries.forEach(([key, child], i) => {
        const isLast = i === entries.length - 1
        host.appendChild(mem.renderRow(key, child, path.concat([key]), depth, type === "array", ancestorLast, isLast))
        const childType = mem.typeOf(child)
        const packed = JSON.stringify(path.concat([key]))
        if ((childType === "object" || childType === "array") && !mem.collapsed.has(packed)) {
            mem.renderChildren(host, child, path.concat([key]), depth + 1, ancestorLast.concat([isLast]))
        }
    })
}
mem.renderRow = function (key, value, path, depth, isIndex, ancestorLast, isLast) {
    const type = mem.typeOf(value)
    const packed = JSON.stringify(path)
    const nestable = type === "object" || type === "array"
    const row = document.createElement("div")
    row.className = "row" + (isIndex ? " index" : "")
    row.dataset.path = packed

    const guides = document.createElement("div")
    guides.className = "guides"
    for (let i = 0; i < depth; i++) {
        const col = document.createElement("span")
        col.className = "guide" + (ancestorLast[i] ? " empty" : " vert")
        guides.append(col)
    }

    const handle = document.createElement("button")
    handle.className = "handle"
    handle.type = "button"
    handle.title = "Drag to move"
    handle.textContent = "•"
    handle.onmousedown = (e) => mem.startDrag(e, path, row)

    const toggle = document.createElement("button")
    toggle.className = "toggle"
    toggle.type = "button"
    toggle.disabled = !nestable
    toggle.textContent = nestable ? (mem.collapsed.has(packed) ? "+" : "–") : ""
    toggle.onclick = () => {
        if (mem.collapsed.has(packed)) mem.collapsed.delete(packed)
        else mem.collapsed.add(packed)
        mem.render()
    }

    const keyInput = document.createElement("input")
    keyInput.className = "key"
    keyInput.value = key
    keyInput.disabled = isIndex
    keyInput.onchange = () => mem.renameKey(path, keyInput.value)

    const typeSel = document.createElement("select")
    typeSel.className = "type"
    for (const opt of ["string", "number", "boolean", "null", "object", "array"]) {
        const option = document.createElement("option")
        option.value = opt
        option.textContent = opt
        if (opt === type) option.selected = true
        typeSel.append(option)
    }
    typeSel.onchange = () => mem.changeType(path, typeSel.value)

    row.append(guides, handle, toggle, keyInput, typeSel)

    if (type === "boolean") {
        const box = document.createElement("input")
        box.type = "checkbox"
        box.checked = !!value
        box.onchange = () => mem.writeValue(path, box.checked)
        row.append(box)
    } else if (type === "object" || type === "array" || type === "null") {
        const hint = document.createElement("span")
        hint.className = "hint" + (type === "null" ? "" : " count")
        hint.textContent = type === "array" ? `[${value.length}]` : (type === "object" ? `{${Object.keys(value).length}}` : "null")
        row.append(hint)
    } else {
        const val = document.createElement("input")
        val.className = "val"
        val.style.height = "18px"
        val.value = value
        val.onchange = () => mem.writeValue(path, type === "number" ? Number(val.value) : val.value)
        row.append(val)
    }

    const acts = document.createElement("div")
    acts.className = "acts"
    if (nestable) {
        const add = document.createElement("button")
        add.type = "button"
        add.textContent = "+"
        add.title = "Add child"
        add.onclick = () => mem.addChild(path)
        acts.append(add)
    }
    const del = document.createElement("button")
    del.type = "button"
    del.textContent = "×"
    del.title = "Delete"
    del.onclick = () => mem.deleteKey(path)
    acts.append(del)
    row.append(acts)
    return row
}
mem.writeValue = function (path, value) {
    const parent = mem.atPath(mem.draft, mem.parentPath(path))
    parent[path[path.length - 1]] = value
    mem.recordChange()
}
mem.renameKey = function (path, next) {
    const parent = mem.atPath(mem.draft, mem.parentPath(path))
    const prev = path[path.length - 1]
    next = String(next)
    if (!next || next === prev || Object.prototype.hasOwnProperty.call(parent, next)) {
        mem.render()
        return
    }
    parent[next] = parent[prev]
    delete parent[prev]
    mem.recordChange()
    mem.render()
}
mem.changeType = function (path, type) {
    mem.writeValue(path, mem.coerce(type))
    mem.render()
}
mem.addChild = function (path) {
    const parent = mem.atPath(mem.draft, path)
    if (Array.isArray(parent)) parent.push("")
    else parent[mem.uniqueKey(parent, "key")] = ""
    mem.collapsed.delete(JSON.stringify(path))
    mem.recordChange()
    mem.render()
}
mem.deleteKey = function (path) {
    const parent = mem.atPath(mem.draft, mem.parentPath(path))
    const key = path[path.length - 1]
    if (Array.isArray(parent)) parent.splice(key, 1)
    else delete parent[key]
    mem.recordChange()
    mem.render()
}
mem.siblingIndex = function (path) {
    const parent = path.length ? mem.atPath(mem.draft, mem.parentPath(path)) : mem.draft
    const key = path[path.length - 1]
    if (Array.isArray(parent)) return Number(key)
    return Object.keys(parent).indexOf(String(key))
}
mem.childCount = function (path) {
    const value = path.length ? mem.atPath(mem.draft, path) : mem.draft
    if (Array.isArray(value)) return value.length
    return Object.keys(value || {}).length
}
mem.isInside = function (from, dest) {
    if (dest.length < from.length) return false
    return from.every((key, i) => String(dest[i]) === String(key))
}
mem.takeEntry = function (path) {
    const parent = mem.atPath(mem.draft, mem.parentPath(path))
    const key = path[path.length - 1]
    const value = parent[key]
    if (Array.isArray(parent)) parent.splice(Number(key), 1)
    else delete parent[key]
    return { key: String(key), value }
}
mem.insertEntry = function (destPath, index, key, value) {
    const parent = destPath.length ? mem.atPath(mem.draft, destPath) : mem.draft
    if (Array.isArray(parent)) {
        parent.splice(index, 0, value)
        return
    }
    let nextKey = key
    if (Object.prototype.hasOwnProperty.call(parent, nextKey)) nextKey = mem.uniqueKey(parent, nextKey)
    const entries = Object.entries(parent)
    entries.splice(Math.max(0, Math.min(index, entries.length)), 0, [nextKey, value])
    for (const existing of Object.keys(parent)) delete parent[existing]
    for (const [k, v] of entries) parent[k] = v
}
mem.clearDrop = function () {
    for (const row of mem.treeEl.getElementsByClassName("row")) {
        row.classList.remove("drop-before", "drop-after", "drop-into")
    }
}
mem.dropAt = function (row, clientY) {
    if (!row?.dataset?.path) return null
    const path = JSON.parse(row.dataset.path)
    const rect = row.getBoundingClientRect()
    const t = (clientY - rect.top) / Math.max(rect.height, 1)
    if (row.classList.contains("root-row")) {
        return { parent: [], index: t < 0.5 ? 0 : mem.childCount([]), where: t < 0.5 ? "before" : "after" }
    }
    const value = mem.atPath(mem.draft, path)
    const nestable = mem.typeOf(value) === "object" || mem.typeOf(value) === "array"
    if (nestable && t > 0.3 && t < 0.7) {
        return { parent: path, index: mem.childCount(path), where: "into" }
    }
    const parent = mem.parentPath(path)
    const index = mem.siblingIndex(path)
    if (t < 0.5) return { parent, index, where: "before" }
    return { parent, index: index + 1, where: "after" }
}
mem.startDrag = function (e, path, row) {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const origin = { x: e.clientX, y: e.clientY }
    let dragging = false
    let drop = null
    const onMove = (ev) => {
        if (!dragging) {
            if (Math.hypot(ev.clientX - origin.x, ev.clientY - origin.y) < 4) return
            dragging = true
            row.classList.add("dragging")
            mem.treeEl.classList.add("is-dragging")
        }
        mem.clearDrop()
        const over = ev.target?.closest?.(".row")
        drop = over ? mem.dropAt(over, ev.clientY) : null
        if (drop && mem.isInside(path, drop.parent)) drop = null
        if (drop && over) over.classList.add("drop-" + drop.where)
    }
    const onUp = () => {
        window.removeEventListener("mousemove", onMove)
        window.removeEventListener("mouseup", onUp)
        row.classList.remove("dragging")
        mem.treeEl.classList.remove("is-dragging")
        mem.clearDrop()
        if (dragging && drop) mem.moveEntry(path, drop)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
}
mem.moveEntry = function (from, drop) {
    if (!from?.length || !drop) return
    if (mem.isInside(from, drop.parent)) return
    const fromParent = mem.parentPath(from)
    const fromIndex = mem.siblingIndex(from)
    const same = JSON.stringify(fromParent) === JSON.stringify(drop.parent)
    const taken = mem.takeEntry(from)
    let index = drop.index
    if (same && index > fromIndex) index--
    mem.insertEntry(drop.parent, index, taken.key, taken.value)
    mem.collapsed.delete(JSON.stringify(drop.parent))
    mem.recordChange()
    mem.render()
}
mem.syncCountWidths = function () {
    const groups = new Map()
    for (const hint of mem.treeEl.getElementsByClassName("count")) {
        hint.style.width = ""
        const path = JSON.parse(hint.closest(".row")?.dataset.path || "[]")
        const nest = JSON.stringify(path.slice(0, -1))
        if (!groups.has(nest)) groups.set(nest, [])
        groups.get(nest).push(hint)
    }
    for (const hints of groups.values()) {
        const max = Math.max(0, ...hints.map(hint => hint.offsetWidth))
        if (!max) continue
        for (const hint of hints) hint.style.width = max + "px"
    }
}
