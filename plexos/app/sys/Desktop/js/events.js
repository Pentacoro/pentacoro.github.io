import plexos from "/boot/plexos.js"
import { shortcut } from "/plexos/lib/functions/shortcuts.js"
import { coreReadOnly } from "/plexos/lib/functions/readOnly.js"
import {runLauncher, iframeAntiHover, areRectanglesOverlap} from "/plexos/lib/functions/dll.js"
import Task from "/plexos/lib/classes/system/task.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import ContextMenu from "/plexos/lib/classes/interface/contextmenu.js"

let System  = plexos.System
let task    = Task.id(/TASKID/)
let desktop = task
let mem     = task.mem

desktop.onpaste = async function (e) {
	if (coreReadOnly()) return
	try {
		const urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,10}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
        const paste = await navigator.clipboard.readText()

		if (paste.match(urlRegex)){
			let newMetaFile = await task.cmd("file.create", {path: mem.dirObject.cfg.path, Type: "MetaFile", name: "New MetaFile.meta"})
			mem.createDesktopIcons([newMetaFile])
			let icon = mem.getIcon(newMetaFile.cfg.path)
			await runLauncher("/plexos/app/meta/Meta Creator/metaCreator.ls",{path:newMetaFile.cfg.path,window:false,url:paste,type:"web"})
			icon.statNode(1)
		}
        
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err)
    }
}

//undo and redo the user's changes to files: one history shared with every Explorer window
const undo = () => { if (!coreReadOnly()) plexos.Core.changeLog.undo() }
const redo = () => { if (!coreReadOnly()) plexos.Core.changeLog.redo() }
shortcut(task, "Ctrl+Z", undo)
shortcut(task, "Ctrl+Y", redo)
shortcut(task, "Ctrl+Shift+Z", redo)

//Delete key: the selection goes to the bin (in the bin itself, deleteSelectedNodes asks to delete for good)
shortcut(task, "Delete", () => { if (!coreReadOnly()) mem.deleteSelectedNodes() })

//when desktop click
desktop.node.addEventListener("mousedown", e => {
	task.focus()
	//if not clicking icon
	if(
		(e.target.id == "desktopLayer" || e.target.id == "selectBox" || e.target.classList.contains("gap")) &&
		e.ctrlKey == false &&
		!System.mem.var.dragging
	) {
		for (let icon of desktop.pocket){
			desktop.pocket = desktop.pocket.remove(icon)
			icon.statNode(0)
		}
	} 
})
desktop.node.addEventListener("mousedown", e => {
	//if not clicking icon
	if(
		(e.target.id == "desktopLayer" || e.target.id == "selectBox" || e.target.classList.contains("gap")) &&
		!System.mem.var.dragging
	) {
		desktop.mem.selectBox(e)
	}
})

task.onfocus = e => {
	for (let icon of mem.iconArr) {
		icon.focus()
	}
}
task.onblur = e => {
	for (let icon of mem.iconArr) {
		icon.blur()
	}
}

//open desk menu on right click background
desktop.node.oncontextmenu = e => {
	if(e.target.id == "desktopLayer" || e.target.id == "selectBox" || e.target.classList.contains("gap")) {
		ContextMenu.open(e, desktop, mem.deskContextMenu)
	}
}

//selectBox behavior----------------------------------------------------|
desktop.mem.selectBox = function(e={ctrlKey:false}) {
	if (document.getElementById("selectBox")) return
	let pos1 = 0, pos2 = 0, posxIn = 0, posyIn = 0, limitX = 0, limitY = 0

	let selectBox = document.createElement("div")
	selectBox.setAttribute("id", "selectBox")
	selectBox.classList.add("selectBox") // its look is the theme's shared .selectBox
	desktop.node.appendChild(selectBox)

	let wasCtrl = (e.ctrlKey == true)

	selectBoxPosition(e)

	//get initial mouse position-----------|
	function selectBoxPosition(e) {
		if (e.preventDefault) e.preventDefault()
		
		//get click position:
		posxIn = e.clientX + desktop.node.scrollLeft
		posyIn = e.clientY + desktop.node.scrollTop
		// the box stays inside the desktop as it was when the drag began, so it can't grow it and bring up scrollbars
		limitX = desktop.node.scrollWidth
		limitY = desktop.node.scrollHeight

		selectBox.style.top = posyIn + "px"
		selectBox.style.left = posxIn + "px"

		iframeAntiHover(true)
		document.onmouseup = selectBoxRelease
		document.onmousemove = selectBoxSizing
	}
	
	//resizing-----------------------------|
	function selectBoxSizing(e) {
		if (e.preventDefault) e.preventDefault()
		
		//get cursor position:
		pos1 = Math.min(Math.max(e.clientX + desktop.node.scrollLeft, 0), limitX)
		pos2 = Math.min(Math.max(e.clientY + desktop.node.scrollTop, 0), limitY)
		
		//show selectBox:
		selectBox.style.opacity = '1'

		selectBox.style.top = Math.min(pos2, posyIn) + "px"
		selectBox.style.left = Math.min(pos1, posxIn) + "px"
		selectBox.style.height = Math.abs(pos2 - posyIn) + "px"
		selectBox.style.width = Math.abs(pos1 - posxIn) + "px"
		
		//iconReaction--------------------------------------------------|
		for (let icon of desktop.mem.iconArr){
			if (icon.node != null) {
				if (areRectanglesOverlap(icon.node,selectBox)) {
					//light up colliding icon hover border:
					icon.highlight(true)
				} else {
					//unlight non-colliding icon hover border:
					icon.highlight(false)
				}
			}
		}
	}
	
	function selectBoxRelease() {
		iframeAntiHover(false)
		document.onmouseup = null
		document.onmousemove = null

		//iconReaction--------------------------------------------------|
		for (let icon of desktop.mem.iconArr){
			if (icon.node != null) {
				if (areRectanglesOverlap(icon.node, selectBox) && icon.state === 0) {
					desktop.pocket.push(icon)
					icon.statNode(1)
				} else if (wasCtrl == false) {
					desktop.pocket = desktop.pocket.remove(icon)
					icon.statNode(0)
				}
				icon.highlight(false)
			}
		}
	
		selectBox.remove()
	}
}