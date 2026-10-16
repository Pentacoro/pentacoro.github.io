import plexos from "/boot/plexos.js"
import { coreReadOnly } from "/plexos/lib/functions/readOnly.js"
import {getTask, runLauncher} from "/plexos/lib/functions/dll.js"
import ContextMenu from "/plexos/lib/classes/interface/contextmenu.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import { shortcut } from "/plexos/lib/functions/shortcuts.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let nav  = mem.ui.nav.keyNodes
let list = mem.ui.view.keyNodes.list

//undo and redo the user's changes to files: one history shared with every Explorer window and the Desktop
const undo = () => { if (!coreReadOnly()) plexos.Core.changeLog.undo() }
const redo = () => { if (!coreReadOnly()) plexos.Core.changeLog.redo() }
shortcut(task, "Ctrl+Z", undo)
shortcut(task, "Ctrl+Y", redo)
shortcut(task, "Ctrl+Shift+Z", redo)

//Delete key: the selection goes to the bin (in the bin itself, deleteSelectedNodes asks to delete for good)
shortcut(task, "Delete", () => { if (!coreReadOnly()) mem.deleteSelectedNodes() })

task.onpaste = async function (e) {
	if (coreReadOnly() || mem.inBinView()) return
	try {
		const urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,10}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
        const paste = await navigator.clipboard.readText()

		if (paste.match(urlRegex)){
			let newMetaFile = await task.cmd("file.create", {path: mem.dirObject.cfg.path, Type: "MetaFile", name: "New MetaFile.meta"})
            mem.createExplorerIcons([newMetaFile])
            let icon = mem.getIcon(newMetaFile.cfg.path)
			runLauncher("/plexos/app/meta/Meta Creator/metaCreator.ls",{path:newMetaFile.cfg.path,window:false,url:paste,type:"web"})
            icon.statNode(1)
		}
        
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err)
    }
}

//nav buttons
nav.back.onclick = () => mem.goBack()
nav.forward.onclick = () => mem.goForward()
nav.up.onclick = () => {
    if (mem.address !== File.root) mem.navigate(File.dirname(mem.address))
}
nav.refresh.onclick = () => mem.refresh()

//history from the mouse side buttons
task.window.node.addEventListener("mouseup", e => {
    if (e.button === 3) mem.goBack()
    if (e.button === 4) mem.goForward()
})
//history from Alt+Left / Alt+Right
shortcut(task, "Alt+ArrowLeft", () => mem.goBack())
shortcut(task, "Alt+ArrowRight", () => mem.goForward())

//view shortcuts, as in Windows: Ctrl+Shift+2 icons, 5 list, 6 details, 7 tiles
shortcut(task, "Ctrl+Shift+2", () => mem.setView("icons"))
shortcut(task, "Ctrl+Shift+5", () => mem.setView("list"))
shortcut(task, "Ctrl+Shift+6", () => mem.setView("details"))
shortcut(task, "Ctrl+Shift+7", () => mem.setView("tiles"))

//address bar: Enter goes there, Escape or leaving the field puts the current address back
nav.address.addEventListener("focus", () => nav.address.select())
nav.address.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault()
        mem.goToAddress(nav.address.value)
        nav.address.blur()
    } else if (e.key === "Escape") {
        mem.showAddress()
        nav.address.blur()
    }
})
nav.address.addEventListener("blur", () => mem.showAddress())

//background click listeners. The empty part of the view is the list itself or, in views that don't fill it, the area around it
const area = mem.ui.view.node
function onBackground(e) {
    return e.target === list || e.target === area
}
area.addEventListener("mousedown", e => {
    if (!onBackground(e)) return
    if (!e.ctrlKey) {
        mem.clearSelection()
        mem.anchor = null
    }
    mem.selectBox(e) // dragging from here draws the selection box (selectbox.js)
})
area.addEventListener("contextmenu", e => {
    if (onBackground(e)) ContextMenu.open(e, task, mem.backContextMenu())
})

//side panel border: drag to resize. The width is kept when the drag ends
mem.ui.side.keyNodes.resizer.addEventListener("mousedown", e => {
    if (e.button !== 0) return
    e.preventDefault()
    const startX = e.clientX
    const startWidth = mem.ui.side.node.offsetWidth
    const move = ev => mem.setSidePanelWidth(startWidth + ev.clientX - startX)
    const up = () => {
        document.removeEventListener("mousemove", move)
        document.removeEventListener("mouseup", up)
        mem.ui.body.classList.remove("resizingSidePanel")
        mem.saveSidePanelWidth()
    }
    mem.ui.body.classList.add("resizingSidePanel")
    document.addEventListener("mousemove", move)
    document.addEventListener("mouseup", up)
})

//details header: a column click sorts by it
mem.ui.view.keyNodes.header.addEventListener("click", e => {
    const key = e.target.closest?.("[data-sort]")?.dataset.sort
    if (key) mem.sortBy(key)
})
