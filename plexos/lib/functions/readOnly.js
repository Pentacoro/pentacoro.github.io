import plexos from "/boot/plexos.js"

const writeCommands = new Set([
    "file.create",
    "file.write",
    "file.modify",
    "file.delete",
    "file.move",
    "file.rename",
    "file.restore",
])

const writeLabels = new Set([
    "New",
    "Directory",
    "MetaFile",
    "Text Document",
    "Paste",
    "Cut",
    "Delete",
    "Rename",
    "Save",
    "Save As...",
    "Undo",
    "Redo",
    "Auto Length",
    "Auto Margin",
    "Grid Settings",
    "Time/Date",
    "Replace...",
    "Accept",
    "Apply",
])

export function coreReadOnly() {
    return !!plexos.Core?.mem?.readOnly
}

export function commandWrites(command) {
    return writeCommands.has(command)
}

export function menuItemWrites(item) {
    if (!item) return false
    if (item.write === true) return true
    if (item.write === false) return false
    return writeLabels.has(item.name)
}

// Inputs that change no files: tab switches, and anything marked data-readonly-safe, like an address bar.
function isTabSwitch(node) {
    return node.classList?.contains("tabRadio_input") || node.dataset?.readonlySafe !== undefined
}

export function lockReadOnlySurface(root = document) {
    if (!coreReadOnly() || !root?.querySelectorAll) return
    document.documentElement.classList.add("core-readonly")
    root.querySelectorAll("input, textarea, select").forEach(node => {
        if (isTabSwitch(node)) return
        node.disabled = true
        node.readOnly = true
    })
    root.querySelectorAll("[contenteditable='true']").forEach(node => {
        node.setAttribute("contenteditable", "false")
    })
    root.querySelectorAll("button").forEach(node => {
        const label = (node.textContent || "").replace(/\s+/g, " ").trim()
        if (!writeLabels.has(label) && !node.classList.contains("icon-layer-side")) return
        node.disabled = true
        node.classList.add("disabled")
    })
}

export function installReadOnly() {
    if (!coreReadOnly() || installReadOnly.installed) return
    installReadOnly.installed = true
    document.documentElement.classList.add("core-readonly")
    lockReadOnlySurface(document)
    plexos.System?.bus?.on("window-scripted", (win) => {
        lockReadOnlySurface(win?.keyNodes?.content || win?.node || document)
    })
    document.addEventListener("beforeinput", (event) => {
        if (coreReadOnly()) event.preventDefault()
    }, true)
    document.addEventListener("focusin", (event) => {
        const node = event.target
        if (!coreReadOnly() || !node?.matches?.("input, textarea, select")) return
        if (isTabSwitch(node)) return
        node.readOnly = true
        node.disabled = true
    }, true)
}
