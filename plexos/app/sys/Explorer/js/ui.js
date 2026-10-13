import {getTask} from "/plexos/lib/functions/dll.js"
import {control} from "/plexos/lib/functions/controls.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let arg  = mem.arg

const root = task.node.getElementById(task.id + "_root")
const nav  = control("navigationBar")
const view = control("fileView")
root.append(nav.node, view.node)
mem.ui = { nav, view }

if (arg.mode === "open" || arg.mode === "save") {
    mem.folderLabels = { hide: "Hide Folders", browse: "Browse Folders" }
    mem.fileTypes = [...(arg.types || []), { label: "All Files (*.*)", exte: null }]
    mem.typeFilter = mem.fileTypes[0].exte
    const dialog = control("fileDialogBar", {
        id: task.id + "_fileName",
        label: "File name:",
        value: arg.fileName || "",
        typeLabel: (arg.mode === "save") ? "Save as type:" : "Files of type:",
        types: mem.fileTypes.map((type, index) => ({ value: index, label: type.label })),
        buttons: [
            { id: "folders", label: mem.folderLabels.hide, align: "start" },
            { id: "confirm", label: (arg.mode === "save") ? "Save" : "Open" },
            { id: "cancel",  label: "Cancel" },
        ],
    })
    dialog.keyNodes.buttons.folders.classList.add("foldersToggle", "open")
    root.appendChild(dialog.node)
    mem.ui.dialog = dialog
}

function lockFoldersWidth() {
    const toggle = mem.ui.dialog.keyNodes.buttons.folders
    const current = toggle.textContent
    let width = 0
    for (const label of Object.values(mem.folderLabels)) {
        toggle.textContent = label
        width = Math.max(width, toggle.offsetWidth)
    }
    toggle.textContent = current
    toggle.style.minWidth = width + "px"
}

function footerWidth() {
    const footer = mem.ui.dialog?.keyNodes.buttons.confirm.parentElement
    if (!footer) return 0
    lockFoldersWidth()
    const style = getComputedStyle(footer)
    const footerButtons = [...footer.children]
    const width = footerButtons.reduce((sum, button) => sum + button.offsetWidth, 0)
        + (parseFloat(style.columnGap) || 0) * (footerButtons.length - 1)
        + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
    return task.window.node.offsetWidth - footer.clientWidth + width
}

mem.fitMinimumSize = function () {
    const win = task.window
    if (!win?.node) return
    const style = getComputedStyle(root)
    const minW = Math.ceil(Math.max(parseFloat(style.getPropertyValue("--window-min-width")) || 0, footerWidth()))
    const minH = Math.ceil(Math.max(
        parseFloat(style.getPropertyValue("--window-min-height")) || 0,
        win.node.offsetHeight - view.node.offsetHeight,
    ))
    mem.minSize = { width: minW, height: minH }
    win.appParams.minW = minW
    win.appParams.minH = minH
    win.node.style.minWidth  = minW + "px"
    win.node.style.minHeight = minH + "px"
    mem.dialog?.sync?.()
}
requestAnimationFrame(() => requestAnimationFrame(mem.fitMinimumSize))
