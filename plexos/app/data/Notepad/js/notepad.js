import {getTask, selectText, runLauncher} from "/plexos/lib/functions/dll.js"
import { coreReadOnly } from "/plexos/lib/functions/readOnly.js"
import {fileDialog} from "/plexos/lib/functions/dialogs.js"
import {themeRoot} from "/plexos/lib/functions/theme.js"
import File from "/plexos/lib/classes/filesystem/file.js"

let task = getTask(/TASKID/)
let mem  = task.mem

mem.textArea = task.node.getElementsByTagName("textarea")[0]
mem.var.textarea = mem.textArea
mem.dirty = false
mem.log = []
mem.logCursor = -1
mem.savedSnap = ""
mem.historyQuiet = false

mem.snapText = function () {
    return mem.textArea.value ?? ""
}
mem.syncDirty = function () {
    const dirty = mem.snapText() !== mem.savedSnap
    if (mem.statusbar?.setDirty) mem.statusbar.setDirty(dirty)
    else mem.dirty = dirty
}
mem.resetLog = function () {
    mem.log = [mem.snapText()]
    mem.logCursor = 0
    mem.savedSnap = mem.snapText()
    mem.syncDirty()
}
mem.recordChange = function () {
    if (mem.historyQuiet) return
    const snap = mem.snapText()
    if (mem.log[mem.logCursor] === snap) {
        mem.syncDirty()
        return
    }
    mem.log = mem.log.slice(0, mem.logCursor + 1)
    mem.log.push(snap)
    if (mem.log.length > 100) mem.log.shift()
    mem.logCursor = mem.log.length - 1
    mem.syncDirty()
}
mem.queueHistory = function () {
    if (mem.historyTimer) clearTimeout(mem.historyTimer)
    mem.historyTimer = setTimeout(() => {
        mem.historyTimer = null
        mem.recordChange()
    }, 300)
}
mem.applyLogEntry = function () {
    const snap = mem.log[mem.logCursor]
    if (snap === undefined) return
    mem.historyQuiet = true
    mem.textArea.value = snap
    mem.syncDirty()
    mem.historyQuiet = false
}
mem.undo = function () {
    if (mem.historyTimer) {
        clearTimeout(mem.historyTimer)
        mem.historyTimer = null
        mem.recordChange()
    }
    if (mem.logCursor <= 0) return
    mem.logCursor--
    mem.applyLogEntry()
    mem.statusbar?.setMessage?.("Undo")
}
mem.redo = function () {
    if (mem.historyTimer) {
        clearTimeout(mem.historyTimer)
        mem.historyTimer = null
        mem.recordChange()
    }
    if (mem.logCursor >= mem.log.length - 1) return
    mem.logCursor++
    mem.applyLogEntry()
    mem.statusbar?.setMessage?.("Redo")
}
// The file isn't held, so it may have been moved, renamed or deleted since it was opened. Then Save asks where.
mem.save = async function () {
    if (!mem.currentFile()) return mem.saveAs()
    if (mem.historyTimer) {
        clearTimeout(mem.historyTimer)
        mem.historyTimer = null
        mem.recordChange()
    }
    await task.cmd("file.write", { path: mem.arg.fileAddr, data: mem.snapText() })
    mem.savedSnap = mem.snapText()
    mem.syncDirty()
    mem.statusbar?.setMessage?.("Saved", "ok")
    return true
}
mem.currentFile = function () {
    return mem.arg.fileAddr ? File.at(mem.arg.fileAddr) : null
}
mem.reload = function () {
    const file = mem.currentFile()
    mem.textArea.value = file?.data ?? ""
    mem.resetLog()
    mem.statusbar?.setMessage?.("")
}
mem.fileTypes = [{ label: "Text Document (*.txt)", exte: ["txt"] }]
// A missing file still points the dialog at its old folder, when that folder is left.
mem.folder = function () {
    const folder = mem.currentFile()?.parent()?.cfg.path
    if (folder !== undefined) return folder
    const last = mem.arg.fileAddr ? File.dirname(mem.arg.fileAddr) : null
    return last !== null && File.at(last) ? last : undefined
}
mem.setFile = function (path) {
    const file = File.at(path)
    mem.arg.fileAddr = path
    task.window.setTitle(file.name + " - Notepad")
    task.window.setImage(file.cfg.icon.getImage())
}
mem.setUntitled = function () {
    mem.arg.fileAddr = null
    task.window.setTitle("Untitled - Notepad")
    task.window.setImage(File.classDefaults("StringFile").iconImag)
}
mem.new = async function () {
    if (!await mem.confirmUnsaved()) return
    mem.setUntitled()
    mem.textArea.value = ""
    mem.resetLog()
    mem.statusbar?.setMessage?.("")
}
mem.newWindow = function () {
    runLauncher("/plexos/app/data/Notepad/notepad.ls", {})
}
mem.confirmUnsaved = async function () {
    if (!mem.dirty) return true
    const choice = await new Promise((resolve) => {
        task.persistentWindow({
            name: "Notepad",
            url: "/plexos/app/sys/System/Popup/popupB.html",
            args: {
                image: `${themeRoot()}/icons/interface/forms/info.png`,
                title: "Save changes?",
                description: `Do you want to save the changes to ${mem.currentFile()?.name ?? "Untitled"} before continuing?`,
                buttons: [
                    { label: "Save",    action: () => resolve("save") },
                    { label: "Discard", action: () => resolve("discard") },
                    { label: "Cancel",  action: () => resolve("cancel") },
                ],
            },
            onClose: () => resolve("cancel"),
        })
    })
    if (choice === "save") return await mem.save()
    return choice === "discard"
}
mem.open = async function () {
    const path = await fileDialog({ mode: "open", path: mem.folder(), types: mem.fileTypes, parentTaskId: task.id })
    if (!path) return
    const file = File.at(path)
    if (file.cfg.class !== "StringFile") {
        File.open(path)
        return
    }
    if (!await mem.confirmUnsaved()) return
    mem.setFile(path)
    mem.textArea.value = file.data ?? ""
    mem.resetLog()
    mem.statusbar?.setMessage?.("Opened", "ok")
}
mem.saveAs = async function () {
    let path = await fileDialog({
        mode: "save",
        path: mem.folder(),
        fileName: mem.currentFile()?.name ?? (mem.arg.fileAddr ? File.basename(mem.arg.fileAddr) : "Untitled.txt"),
        types: mem.fileTypes,
        parentTaskId: task.id,
    })
    if (!path) return false
    const existing = File.at(path)
    if (existing && existing.cfg.class !== "StringFile") {
        mem.statusbar?.setMessage?.("Can't save over a non-text file", "error")
        return false
    }
    if (!existing) {
        const folder = path.slice(0, path.lastIndexOf("/"))
        const name = path.slice(path.lastIndexOf("/") + 1)
        const created = await task.cmd("file.create", { path: folder, Type: "StringFile", name, content: "" })
        if (!created) return false
        path = created.cfg.path
        File.refreshViews()
    }
    mem.setFile(path)
    return mem.save()
}

mem.textArea.value = mem.arg.textData ?? ""
mem.resetLog()
mem.textArea.addEventListener("input", () => {
    mem.syncDirty()
    mem.queueHistory()
})

task.window.node.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        if (coreReadOnly()) return
        mem.save()
    }
})
task.window.node.addEventListener("onfocus", e => {
    mem.textArea.focus()
    selectText(mem.textArea)
})
task.window.node.addEventListener("blur", e => {
    mem.var.selectionRange = window.getSelection()
    task.node.blur()
})
