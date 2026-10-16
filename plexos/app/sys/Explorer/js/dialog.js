import {getTask} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import Window from "/plexos/lib/classes/interface/window.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let arg  = mem.arg

if (mem.ui.dialog) {
    const { name, type, buttons } = mem.ui.dialog.keyNodes
    let settled = false

    function finish(path) {
        if (settled) return
        settled = true
        arg.onResult?.(path)
        if (path !== null) close()
    }

    function close() {
        if (task.window) Window.close(task.window)
        else task.end()
    }

    function confirm() {
        const value = name.value.trim()
        if (!value) return
        const target = File.at(mem.dirObject.cfg.path + "/" + value)
        if (target?.cfg.class === "DirectoryFile") {
            mem.navigate(target.cfg.path)
            name.value = (arg.mode === "save") ? (arg.fileName || "") : ""
            return
        }
        if (arg.mode === "open") {
            if (target) finish(target.cfg.path)
            return
        }
        const fileName = withExtension(value)
        if (File.validName(fileName)) finish(mem.dirObject.cfg.path + "/" + fileName)
    }

    function withExtension(value) {
        const extensions = mem.typeFilter
        if (!extensions?.length) return value
        const lower = value.toLowerCase()
        if (extensions.some(exte => lower.endsWith("." + exte))) return value
        return value + "." + extensions[0]
    }

    mem.dialog = {
        select(icon) {
            if (icon.exte !== "dir") name.value = icon.name
        },
        pick(icon) {
            name.value = icon.name
            confirm()
        },
    }

    type?.addEventListener("change", () => {
        mem.typeFilter = mem.fileTypes[type.value].exte
        mem.refresh()
    })

    buttons.confirm.onclick = confirm
    buttons.cancel.onclick = close
    name.addEventListener("keydown", e => {
        if (e.key !== "Enter") return
        e.preventDefault()
        confirm()
    })

    let expandedHeight = null

    function isCollapsed() {
        return task.window.node.offsetHeight <= (mem.minSize?.height ?? 0) + 1
    }

    function syncFoldersButton() {
        if (!mem.minSize) return
        const collapsed = isCollapsed()
        if (!collapsed) expandedHeight = task.window.node.offsetHeight
        buttons.folders.textContent = collapsed ? mem.folderLabels.browse : mem.folderLabels.hide
        buttons.folders.classList.toggle("open", !collapsed)
        buttons.folders.classList.toggle("closed", collapsed)
    }

    function setHeight(height) {
        const win = task.window
        win.drawParams.maximized = false
        win.drawParams.height = height
        win.poseNode()
    }

    buttons.folders.onclick = () => {
        if (!mem.minSize) return
        if (!isCollapsed()) {
            setHeight(mem.minSize.height)
            return
        }
        const doubleBar = mem.ui.dialog.node.offsetHeight * 2
        setHeight((expandedHeight > doubleBar) ? expandedHeight : task.window.defineSize().height)
    }

    mem.dialog.sync = syncFoldersButton
    const resizeObserver = new ResizeObserver(syncFoldersButton)
    resizeObserver.observe(task.window.node)

    const onEnd = task.onEnd
    task.onEnd = function () {
        resizeObserver.disconnect()
        finish(null)
        onEnd?.()
    }
}
