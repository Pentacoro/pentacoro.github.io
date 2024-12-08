import Task from "/plexos/lib/classes/system/task.js"
import ContextMenu from "/plexos/lib/classes/interface/contextmenu.js"

let task    = Task.id("TASKID")
let desktop = task
let mem     = task.mem

window.addEventListener("resize", e => {
	task.node.style.width = document.body.offsetWidth + "px"
    task.node.style.height = document.body.offsetHeight - cfg.desktop.taskbar.height + "px"
})

//when desktop click-------------------|
desktop.node.addEventListener("mousedown", e => {
	system.mem.focus(desktop)
	//if not clicking folder or window--------------|
	if(
		e.target.id == "desktopLayer" &&
		e.ctrlKey == false &&
		!system.mem.var.dragging
	) {
		for (let icon of desktop.pocket){
			desktop.pocket = desktop.pocket.remove(icon)
			icon.statNode(0)
		}
	} 
})
desktop.node.addEventListener("mousedown", e => {
	//if not clicking folder or window--------------|
	if(
		e.target.id == "desktopLayer" &&
		!system.mem.var.dragging
	) {
		desktop.mem.selectBox(e)
	}
})

//open desk menu on right click background
desktop.node.oncontextmenu = e => {
	if(e.target == desktop.node) {
		let envfocus = system.mem.var.envfocus

		let menu = [
			{name: "view", list: [
				{name:"Grid",icon:"url('plexos/res/images/svg/contextMenu/grid2.svg')",func:[
					{name:"grid", list: [
						{name:"Auto Length",icon:"url('plexos/res/images/svg/contextMenu/autogrid.svg')",func:() => desktop.mem.grid.autoLength()},
						{name:"Auto Margin",icon:"url('plexos/res/images/svg/contextMenu/automargin.svg')",func:() => desktop.mem.grid.autoMargin()},
						{name:"Grid Settings",icon:"url('plexos/res/images/svg/contextMenu/gridsettings.svg')",func:() => dll.runLauncher("/plexos/app/sys/Settings/Grid/deskGridOptions_lau.js",[],envfocus)},
						]
					}
				]},
				{name:"Refresh",icon:"url('plexos/res/images/svg/contextMenu/refresh.svg')",func: () => desktop.mem.refresh()},
			]},
			{name: "file", list: [
				{name:"New",icon:"url('plexos/res/images/svg/contextMenu/new2.svg')",func:[
					{name:"new", list: [
						{name:"Directory",icon:"url('plexos/res/images/svg/contextMenu/directory.svg')",func:() => desktop.mem.new(e,desktop,"Directory","New Folder")},
						{name:"Metafile",icon:"url('plexos/res/images/svg/contextMenu/metafile.svg')",func:() => desktop.mem.new(e,desktop,"Metafile", "New Metafile.msf")},
						{name:"Text Document",icon:"url('plexos/res/images/svg/contextMenu/textfile.svg')",func:() => desktop.mem.new(e,desktop,"JsString", "New Text Document.txt")},
						]
					}
				]},
			{name:"Paste",icon:"url('plexos/res/images/svg/contextMenu/paste.svg')",func: () => {return} },
			]},
			{name: "info", list: [
				{name:"Settings",icon:"url('plexos/res/images/svg/contextMenu/settings2.svg')",func: () => {return} },
				{name:"About",icon:"url('plexos/res/images/svg/contextMenu/about.svg')",func: () => {return} }
			]}
		]
		ContextMenu.open(e, desktop, menu)
	}
}

//selectBox behavior----------------------------------------------------|
desktop.mem.selectBox = function(e={ctrlKey:false}) {
	let pos1 = 0, pos2 = 0, posxIn = 0, posyIn = 0

	let selectBox = document.createElement("div")
	selectBox.setAttribute("id", "selectBox")
	desktop.node.appendChild(selectBox)

	let wasCtrl = (e.ctrlKey == true)

	selectBoxPosition(e)

	//get initial mouse position-----------|
	function selectBoxPosition(e) {
		if (e.preventDefault) e.preventDefault()
		
		//get click position:
		posxIn = e.clientX + desktop.node.scrollLeft
		posyIn = e.clientY + desktop.node.scrollTop

		selectBox.style.top = posyIn + "px"
		selectBox.style.left = posxIn + "px"

		dll.iframeAntiHover(true)
		document.onmouseup = selectBoxRelease
		document.onmousemove = selectBoxSizing
	}
	
	//resizing-----------------------------|
	function selectBoxSizing(e) {
		if (e.preventDefault) e.preventDefault()
		
		//get cursor position:
		pos1 = e.clientX + desktop.node.scrollLeft
		pos2 = e.clientY + desktop.node.scrollTop
		
		//show selectBox:
		selectBox.style.opacity = '1'

		if ((pos2 - posyIn) > 0) { //if cursor below ↓ from initial position
			selectBox.style.height = (pos2 - posyIn) + 1 + "px"
			selectBox.style.top = posyIn + "px"
		} else { //cursor is above ↑ from initial position
			selectBox.style.height = (pos2 - posyIn) * -1 + "px"
			selectBox.style.top = (posyIn - selectBox.offsetHeight) + "px"
		}
		if ((pos1 - posxIn) > 0) { //if cursor right → from initial position
			selectBox.style.width = (pos1 - posxIn) + 1 + "px"
			selectBox.style.left = posxIn + "px"
		} else { //cursor is left  ← from initial position
			selectBox.style.width = (pos1 - posxIn) * -1 + "px"
			selectBox.style.left = (posxIn - selectBox.offsetWidth) + "px"
		}
		
		//iconReaction--------------------------------------------------|
		for (let icon of desktop.mem.iconArr){
			if (icon.node != null) { /*otherwise callback argument ruins everything*/
				if (dll.areRectanglesOverlap(icon.node,selectBox)) {
					//light up colliding icon hover border:
					icon.highlight(true)
				} else {
					//unlight non-colliding icon hover border:
					icon.highlight(false)
				}
			}
		}
		//--------------------------------------------------iconReaction|
	}
	
	function selectBoxRelease() {
		dll.iframeAntiHover(false)
		document.onmouseup = null
		document.onmousemove = null

		//iconReaction--------------------------------------------------|
		
		for (let icon of desktop.mem.iconArr){
			if (icon.node != null) { /*otherwise callback argument ruins everything*/
				if (dll.areRectanglesOverlap(icon.node, selectBox) && icon.stat === 0) {
					desktop.pocket.push(icon)
					icon.statNode(1)
				} else if (wasCtrl == false) {
					desktop.pocket = desktop.pocket.remove(icon)
					icon.statNode(0)
				}
				icon.highlight(false)
			}
		}
		//--------------------------------------------------iconReaction|
	
		selectBox.parentElement.removeChild(selectBox)
	}
}