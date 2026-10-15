import {getTask} from "/plexos/lib/functions/dll.js"
import {fileDialog} from "/plexos/lib/functions/dialogs.js"
import {themeRoot} from "/plexos/lib/functions/theme.js"
import {adoptIconFile, iconFileFromData, isIconFile, loadIconFile} from "/plexos/lib/functions/iconFile.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import Task from "/plexos/lib/classes/system/task.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let tab  = mem.tab

let dateFormatter = new Intl.DateTimeFormat('en-UK', 
    {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }
)

mem.prepGeneral = function () {
    mem.ui.fileIcon.setAttribute("src", mem.arg.cfg.icon.getImage())
    tab.general.fileName.value = mem.arg.displayName()
    tab.general.fileClass.innerText = mem.arg.cfg.class 
    tab.general.fileExte.innerText = "."+mem.arg.cfg.exte 
    tab.general.fileAddr.innerText = mem.arg.cfg.path 
    tab.general.fileAddr.title = mem.arg.cfg.path 
    tab.general.fileSize.innerText = `${mem.arg.size()} (${mem.arg.size("bytes")})`
    tab.general.fileDateCreated.innerText  = ( (mem.arg.cfg.date.Created ) ? dateFormatter.format(new Date(mem.arg.cfg.date.Created )) : mem.arg.cfg.date.Created )
    tab.general.fileDateModified.innerText = ( (mem.arg.cfg.date.Modified) ? dateFormatter.format(new Date(mem.arg.cfg.date.Modified)) : mem.arg.cfg.date.Modified)
    tab.general.fileDateAccessed.innerText = ( (mem.arg.cfg.date.Accessed) ? dateFormatter.format(new Date(mem.arg.cfg.date.Accessed)) : mem.arg.cfg.date.Accessed)

    for (let [key, node] of Object.entries(tab.general)) {
        if (node.innerText === "undefined") mem.rows[key]?.remove()
    }
}
mem.prepMetadata = function () {
    if (!mem.ui.metaImage) return
    mem.ui.metaImage.setAttribute("src", mem.arg.meta.image)
}

function draftIcon() {
    return mem.var.configObject.cfg.icon
}

function layerLabel(item) {
    if (item?.name) return item.name
    const url = typeof item === "string" ? item : item?.url
    if (!url) return "Layer"
    if (url.startsWith("data:")) return "Image"
    const name = decodeURIComponent(url.split("/").pop().split("?")[0])
    return name.length > 28 ? name.slice(0, 28) : name
}

function iconAddress(icon) {
    if (icon.image) return icon.image
    try { return icon.getImage() || "" } catch { return "" }
}

function editRow(row, initial, commit) {
    const name = row.querySelector(".icon-layer-name")
    if (!name || row.querySelector("input")) return
    const input = document.createElement("input")
    input.type = "text"
    input.className = "icon-layer-name-input"
    input.value = initial
    row.draggable = false
    name.replaceWith(input)
    input.focus()
    input.select()
    let done = false
    const finish = (save) => {
        if (done) return
        done = true
        if (save) commit(input.value.trim())
        else mem.refreshIconEditor()
    }
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") { event.preventDefault(); finish(true) }
        if (event.key === "Escape") { event.preventDefault(); finish(false) }
    })
    input.addEventListener("blur", () => finish(true))
}

const layerCursors = {
    nw: "nwse-resize",
    se: "nwse-resize",
    ne: "nesw-resize",
    sw: "nesw-resize",
    n: "ew-resize",
    s: "ew-resize",
    e: "ns-resize",
    w: "ns-resize",
    move: "grab",
}

function layerZone(layer, event) {
    const parent = layer.offsetParent
    const w = layer.offsetWidth
    const h = layer.offsetHeight
    if (!parent || !w || !h) return "move"
    const parentRect = parent.getBoundingClientRect()
    const tx = Math.tan((Number(layer.dataset.skewX) || 0) * Math.PI / 180)
    const ty = Math.tan((Number(layer.dataset.skewY) || 0) * Math.PI / 180)
    const x2 = (event.clientX - parentRect.left) - (layer.offsetLeft + w / 2)
    const y2 = (event.clientY - parentRect.top) - (layer.offsetTop + h / 2)
    const dx = x2 - tx * y2
    const dy = y2 - dx * ty
    const lx = dx + w / 2
    const ly = dy + h / 2
    const edge = 8
    if (lx < -edge || ly < -edge || lx > w + edge || ly > h + edge) return null
    const nearL = lx <= edge
    const nearR = lx >= w - edge
    const nearT = ly <= edge
    const nearB = ly >= h - edge
    if ((nearL || nearR) && (nearT || nearB)) return (nearT ? "n" : "s") + (nearL ? "w" : "e")
    if (nearT) return "n"
    if (nearB) return "s"
    if (nearL) return "w"
    if (nearR) return "e"
    return "move"
}

function clampSkew(deg) {
    return Math.max(-60, Math.min(60, deg))
}

function showLayerSelection() {
    const ui = mem.ui.iconEditor
    if (!ui?.layers) return
    const selected = mem.selectedLayer
    ui.layers.querySelectorAll(".iconLayer").forEach(layer => {
        const on = Number(layer.dataset.index) === selected
        layer.classList.toggle("selected", on)
        layer.querySelectorAll(".iconLayerHandle").forEach(handle => handle.remove())
        if (!on) return
        for (const name of ["nw", "n", "ne", "e", "se", "s", "sw", "w"]) {
            const handle = document.createElement("span")
            handle.className = "iconLayerHandle iconLayerHandle-" + name
            layer.append(handle)
        }
    })
    ui.layerList?.querySelectorAll(".icon-layer-row").forEach(row => {
        row.classList.toggle("selected", row.dataset.index != null && Number(row.dataset.index) === selected)
    })
}

mem.deselectLayer = function (event) {
    const ui = mem.ui.iconEditor
    if (!ui?.layerList?.isConnected || mem.selectedLayer == null) return
    const layer = event.target.closest?.(".iconLayer")
    if (layer && ui.art.contains(layer)) return
    const row = event.target.closest?.(".icon-layer-row")
    if (row?.dataset.index != null && ui.layerList.contains(row)) return
    mem.selectedLayer = null
    showLayerSelection()
}

function retargetSelection(from, to) {
    const selected = mem.selectedLayer
    if (selected == null) return
    if (selected === from) mem.selectedLayer = to
    else if (from < selected && to >= selected) mem.selectedLayer = selected - 1
    else if (from > selected && to <= selected) mem.selectedLayer = selected + 1
}

mem.refreshIconEditor = function () {
    const icon = draftIcon()
    const ui = mem.ui.iconEditor
    if (!icon?.paint || !ui) return
    ui.renderField.value = icon.render || "auto"
    if (ui.linkField && document.activeElement !== ui.linkField) ui.linkField.value = iconAddress(icon)
    icon.paint({ image: ui.image, art: ui.art, layers: ui.layers, front: ui.front, stickers: ui.stickers }, 128)
    ui.layerList.replaceChildren()
    const items = icon.layerItems()
    items.forEach((item, index) => {
        const row = document.createElement("div")
        row.className = "icon-layer-row"
        row.dataset.index = String(index)
        row.draggable = true
        const name = document.createElement("span")
        name.className = "icon-layer-name"
        name.textContent = layerLabel(item)
        const browse = document.createElement("button")
        browse.type = "button"
        browse.className = "icon-layer-side"
        browse.title = "Find file"
        const browseIcon = document.createElement("img")
        browseIcon.src = `${themeRoot()}/icons/files/images/folder.svg`
        browseIcon.alt = ""
        browse.append(browseIcon)
        const urlButton = document.createElement("button")
        urlButton.type = "button"
        urlButton.className = "icon-layer-side"
        urlButton.title = "Image URL"
        urlButton.textContent = "↗"
        const remove = document.createElement("button")
        remove.type = "button"
        remove.className = "icon-layer-side"
        remove.title = "Remove"
        remove.textContent = "-"
        for (const button of [browse, urlButton, remove]) {
            button.addEventListener("pointerdown", event => event.stopPropagation())
        }
        browse.addEventListener("click", async event => {
            event.stopPropagation()
            const path = await fileDialog({
                mode: "open",
                parentTaskId: task.id,
                types: [
                    { label: "Icon (*.icon)", exte: ["icon"] },
                    { label: "Images", exte: ["svg", "png", "gif", "jpg", "jpeg", "webp", "ico"] },
                ],
            })
            if (!path || !ui.layerList.isConnected) return
            let url = ""
            try {
                const chosen = File.at(path)
                const exte = String(chosen?.cfg?.exte || "").toLowerCase()
                const kind = exte.startsWith(".") ? exte.slice(1) : exte
                if (kind === "icon") {
                    const doc = iconFileFromData(chosen.data ?? chosen.read?.(), path)
                    url = doc?.image || ""
                } else {
                    url = chosen?.cfg?.icon?.getImage?.() || ""
                }
            } catch { url = "" }
            if (!url) return
            const layers = icon.ensureLayers()
            const current = layers[index]
            if (!current) return
            current.url = url
            mem.onChange()
            mem.refreshIconEditor()
        })
        urlButton.addEventListener("click", event => {
            event.stopPropagation()
            const current = icon.layerItems()[index]
            if (!current) return
            editRow(row, current.url || "", async value => {
                if (!value) { mem.refreshIconEditor(); return }
                let url = value
                if (isIconFile(value)) {
                    const doc = await loadIconFile(value)
                    url = doc?.image || ""
                }
                if (!url || !ui.layerList.isConnected) return
                const layers = icon.ensureLayers()
                const layer = layers[index]
                if (!layer) return
                layer.url = url
                mem.onChange()
                mem.refreshIconEditor()
            })
        })
        remove.addEventListener("click", event => {
            event.stopPropagation()
            const layers = icon.ensureLayers()
            layers.splice(index, 1)
            if (mem.selectedLayer === index) mem.selectedLayer = null
            else if (mem.selectedLayer > index) mem.selectedLayer -= 1
            mem.onChange()
            mem.refreshIconEditor()
        })
        row.addEventListener("pointerdown", event => {
            if (event.target.closest("button, input")) return
            mem.selectedLayer = index
            showLayerSelection()
        })
        row.addEventListener("dblclick", event => {
            if (event.target.closest("input")) return
            const current = icon.layerItems()[index]
            if (!current) return
            editRow(row, current.name || layerLabel(current), value => {
                const layers = icon.ensureLayers()
                const layer = layers[index]
                if (!layer) return
                if (value) layer.name = value
                else delete layer.name
                mem.onChange()
                mem.refreshIconEditor()
            })
        })
        row.addEventListener("dragstart", event => {
            if (event.target.closest("button, input")) {
                event.preventDefault()
                return
            }
            event.dataTransfer.setData("text/plain", String(index))
            event.dataTransfer.effectAllowed = "move"
        })
        row.addEventListener("dragover", event => event.preventDefault())
        row.addEventListener("drop", event => {
            event.preventDefault()
            const from = Number(event.dataTransfer.getData("text/plain"))
            if (!Number.isInteger(from) || from === index) return
            const layers = icon.ensureLayers()
            const [moved] = layers.splice(from, 1)
            layers.splice(index, 0, moved)
            retargetSelection(from, index)
            mem.onChange()
            mem.refreshIconEditor()
        })
        row.append(name)
        const line = document.createElement("div")
        line.className = "icon-layer-line"
        line.append(row, browse, urlButton, remove)
        ui.layerList.append(line)
    })
    const add = document.createElement("div")
    add.className = "icon-layer-row icon-layer-add"
    const addButton = document.createElement("button")
    addButton.type = "button"
    addButton.textContent = "+"
    addButton.addEventListener("click", () => {
        const url = icon.getImage()
        if (!url) return
        const layers = icon.ensureLayers()
        const step = layers.length * 4
        layers.push({
            url,
            x: Math.min(40, 16 + step),
            y: Math.min(28, 6 + step),
            w: 48,
            h: 48,
            skewX: 0,
            skewY: 0,
        })
        mem.selectedLayer = layers.length - 1
        mem.onChange()
        mem.refreshIconEditor()
    })
    add.append(addButton)
    ui.layerAdd.replaceChildren(add)
    showLayerSelection()
}

mem.bindIconEditor = function () {
    const icon = draftIcon()
    const ui = mem.ui.iconEditor
    ui.linkField.addEventListener("change", async () => {
        const value = ui.linkField.value.trim()
        icon.image = value
        if (isIconFile(value)) {
            const doc = await loadIconFile(value)
            adoptIconFile(icon, doc)
        }
        mem.onChange()
        mem.refreshIconEditor()
    })
    ui.renderField.addEventListener("change", () => {
        icon.render = ui.renderField.value
        mem.onChange()
        mem.refreshIconEditor()
    })
    ui.art.addEventListener("pointermove", event => {
        const layer = event.target.closest?.(".iconLayer")
        if (!layer || !ui.art.contains(layer)) return
        if (Number(layer.dataset.index) !== mem.selectedLayer) {
            layer.style.cursor = "grab"
            return
        }
        layer.style.cursor = layerCursors[layerZone(layer, event)] || "grab"
    })
    ui.art.addEventListener("pointerdown", event => {
        const layer = event.target.closest(".iconLayer")
        if (!layer || !ui.art.contains(layer)) return
        event.preventDefault()
        event.stopPropagation()
        const index = Number(layer.dataset.index)
        const already = mem.selectedLayer === index
        mem.selectedLayer = index
        if (!already) showLayerSelection()
        const zone = already ? (layerZone(layer, event) || "move") : "move"
        let item = icon.layerItems()[index]
        if (!item) return
        let stored = Array.isArray(icon.layers)
        const startX = item.x
        const startY = item.y
        const startW = item.w > 0 ? item.w : 32
        const startH = item.h > 0 ? item.h : startW
        const startSkewX = Number(item.skewX) || 0
        const startSkewY = Number(item.skewY) || 0
        const box = layer.offsetParent?.getBoundingClientRect() || ui.art.getBoundingClientRect()
        const grabX = event.clientX - (box.left + layer.offsetLeft)
        const grabY = event.clientY - (box.top + layer.offsetTop)
        const heightPx = layer.offsetHeight || 1
        const widthPx = layer.offsetWidth || 1
        let changed = false
        try { layer.setPointerCapture(event.pointerId) } catch { /* the move listeners still follow the pointer */ }
        const move = (ev) => {
            if (!stored) {
                item = icon.ensureLayers()[index]
                stored = true
            }
            if (!item) return
            changed = true
            const rect = ui.art.getBoundingClientRect()
            if (zone === "move") {
                const x = ((ev.clientX - grabX - rect.left) / rect.width) * 100
                const y = ((ev.clientY - grabY - rect.top) / rect.height) * 100
                const w = item.w > 0 ? item.w : startW
                const h = item.h > 0 ? item.h : startH
                item.x = Math.max(0, Math.min(100 - w, x))
                item.y = Math.max(0, Math.min(100 - h, y))
                layer.style.left = item.x + "%"
                layer.style.top = item.y + "%"
                return
            }
            if (zone === "n" || zone === "s") {
                const dx = ev.clientX - event.clientX
                const sign = zone === "s" ? 1 : -1
                const tan = Math.tan(startSkewX * Math.PI / 180) + sign * (2 * dx / heightPx)
                item.skewX = clampSkew(Math.atan(tan) * 180 / Math.PI)
            } else if (zone === "e" || zone === "w") {
                const dy = ev.clientY - event.clientY
                const sign = zone === "e" ? 1 : -1
                const tan = Math.tan(startSkewY * Math.PI / 180) + sign * (2 * dy / widthPx)
                item.skewY = clampSkew(Math.atan(tan) * 180 / Math.PI)
            } else {
                const dw = ((ev.clientX - event.clientX) / rect.width) * 100
                const dh = ((ev.clientY - event.clientY) / rect.height) * 100
                let x = startX
                let y = startY
                let w = startW
                let h = startH
                if (zone.includes("e")) w = startW + dw
                if (zone.includes("s")) h = startH + dh
                if (zone.includes("w")) { x = startX + dw; w = startW - dw }
                if (zone.includes("n")) { y = startY + dh; h = startH - dh }
                w = Math.max(12, w)
                h = Math.max(12, h)
                if (x < 0) { w += x; x = 0 }
                if (y < 0) { h += y; y = 0 }
                w = Math.max(12, Math.min(w, 100 - x))
                h = Math.max(12, Math.min(h, 100 - y))
                item.x = x
                item.y = y
                item.w = w
                item.h = h
                layer.style.left = x + "%"
                layer.style.top = y + "%"
                layer.style.width = w + "%"
                layer.style.height = h + "%"
                return
            }
            const skewX = Number(item.skewX) || 0
            const skewY = Number(item.skewY) || 0
            layer.dataset.skewX = String(skewX)
            layer.dataset.skewY = String(skewY)
            layer.style.transform = (skewX || skewY) ? `skewX(${skewX}deg) skewY(${skewY}deg)` : ""
        }
        const up = () => {
            layer.removeEventListener("pointermove", move)
            layer.removeEventListener("pointerup", up)
            if (changed) mem.onChange()
        }
        layer.addEventListener("pointermove", move)
        layer.addEventListener("pointerup", up)
    })
    document.addEventListener("pointerdown", mem.deselectLayer)
    const close = task.onEnd
    task.onEnd = function () {
        document.removeEventListener("pointerdown", mem.deselectLayer)
        close?.call(this)
    }
    ui.stickerButton.addEventListener("click", () => mem.openStickerEditor())
    mem.refreshIconEditor()
}

mem.openStickerEditor = async function () {
    const open = (task.persistentWindows || []).find(win => Task.id(win.task)?.name === "Stickers")
    if (open) {
        Task.id(open.task)?.focus()
        return
    }
    const icon = draftIcon()
    const win = await task.persistentWindow({
        name: "Stickers",
        icon: icon.getImage(),
    })
    const host = Task.id(win?.task)?.node
    if (!host) return
    const slots = mem.iconSlots
    let selected = slots[0]
    const root = document.createElement("div")
    root.className = "sticker-editor"
    const matrix = document.createElement("div")
    matrix.className = "sticker-matrix"
    const cells = {}
    for (const slot of slots) {
        const cell = document.createElement("button")
        cell.type = "button"
        cell.className = "sticker-slot"
        cell.dataset.slot = slot
        cell.addEventListener("click", () => {
            selected = slot
            paintSlots()
            readSlot()
        })
        cells[slot] = cell
        matrix.append(cell)
    }
    const urlRow = document.createElement("label")
    urlRow.className = "sticker-field"
    urlRow.append(document.createTextNode("Image URL"))
    const urlInput = document.createElement("input")
    urlInput.type = "url"
    urlRow.append(urlInput)
    const renderRow = document.createElement("label")
    renderRow.className = "sticker-field"
    renderRow.append(document.createTextNode("Rendering"))
    const renderSelect = document.createElement("select")
    for (const [value, label] of [["auto", "Auto"], ["pixelated", "Pixelated"], ["smooth", "Smooth"]]) {
        const option = document.createElement("option")
        option.value = value
        option.textContent = label
        renderSelect.append(option)
    }
    renderRow.append(renderSelect)
    root.append(matrix, urlRow, renderRow)
    host.append(root)

    function paintSlots() {
        for (const slot of slots) {
            const cell = cells[slot]
            cell.classList.toggle("selected", slot === selected)
            cell.replaceChildren()
            const item = icon.stickers[slot]
            if (item?.url) {
                const img = document.createElement("img")
                img.src = item.url
                img.alt = ""
                if (item.render === "pixelated") img.style.imageRendering = "pixelated"
                cell.append(img)
            }
        }
    }
    function readSlot() {
        const item = icon.stickers[selected]
        urlInput.value = item?.url || ""
        renderSelect.value = item?.render || "auto"
    }
    function writeSlot() {
        const url = urlInput.value.trim()
        if (!url) delete icon.stickers[selected]
        else icon.stickers[selected] = { url, render: renderSelect.value || "auto" }
        paintSlots()
        mem.onChange()
        mem.refreshIconEditor()
    }
    urlInput.addEventListener("input", writeSlot)
    renderSelect.addEventListener("change", writeSlot)
    paintSlots()
    readSlot()
    requestAnimationFrame(() => {
        win.drawParams.posX = 0
        win.drawParams.posY = 0
        Task.System().bus.emit("window-scripted", win)
        Task.id(win.task)?.focus()
    })
}

mem.applyFileChanges = async function () { // rename then file.modify; each goes through cmd / askPermission
    const file = mem.arg
    const draft = mem.var.configObject
    if (!file?.cfg?.path || !draft) return

    const displayName = mem.tab.general.fileName.value
    const newName = (file.cfg.class === "DirectoryFile")
        ? displayName
        : displayName + mem.tab.general.fileExte.innerText

    if (newName && newName !== file.name) {
        const renamed = await task.cmd("file.rename", { path: file.cfg.path, rename: newName })
        if (renamed) {
            mem.arg = renamed
            mem.var.configInitialState = renamed
            draft.name = renamed.name
            draft.cfg.path = renamed.cfg.path
            if (draft.cfg.icon && renamed.cfg.icon) {
                draft.cfg.icon.name = renamed.cfg.icon.name
                draft.cfg.icon.file = renamed.cfg.icon.file
                draft.cfg.icon.exte = renamed.cfg.icon.exte
            }
        }
    }

    const live = mem.arg
    const sKey = File.classDefaults(live.cfg.class).skeyName
    await task.cmd("file.modify", {
        path: live.cfg.path,
        cfg: {
            hidden: !!draft.cfg.hidden,
            edit: draft.cfg.edit !== false,
            icon: {
                render: draft.cfg.icon?.render,
                stickers: draft.cfg.icon?.stickers,
                layers: draft.cfg.icon?.layers,
                layered: draft.cfg.icon?.layered,
                sizes: draft.cfg.icon?.sizes,
                image: draft.cfg.icon?.image,
            },
        },
        data: (sKey && sKey !== "dir") ? draft[sKey] : undefined,
    })
}