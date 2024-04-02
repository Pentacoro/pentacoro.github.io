let task = Task.id("TASKID")
let mem  = task.mem
let desktop = task

//when desktop click:---------------------------------------------------|
	//when desktop click-------------------|
	desktop.node.addEventListener("mousedown", e => {
		system.mem.focus(desktop)
		//if not clicking folder or window--------------|
		if(
			e.target.id == "desktopLayer" &&
			e.ctrlKey == false &&
			!system.mem.var.dragging
		) {
			for (icon of desktop.pocket){
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
			pos1 = 0
			pos2 = 0

			desktop.mem.selectBox()
		}
	})

	//open desk menu on right click background
	desktop.node.oncontextmenu = e => {
		if(e.target == desktop.node) {
			let envfocus = system.mem.var.envfocus

			let menuSections = [
				{name:"view"},
				{name:"file"},
				{name:"info"}
			]
			let menuOptions  = [
				{section:"view", name:"Grid",icon:"url('assets/svg/contextMenu/grid2.svg')",func:[
					{name:"Auto Length",icon:"url('assets/svg/contextMenu/autogrid.svg')",func:() => desktop.mem.grid.autoLength()},
					{name:"Auto Margin",icon:"url('assets/svg/contextMenu/automargin.svg')",func:() => desktop.mem.grid.autoMargin()},
					{name:"Grid Settings",icon:"url('assets/svg/contextMenu/gridsettings.svg')",func:() => jsc.runLauncher("/apps/settings_deskGrid/deskGridOptions_lau.js",[],envfocus)},
				]},
				{section:"view", name:"Refresh",icon:"url('assets/svg/contextMenu/refresh.svg')",func: () => desktop.mem.refresh()},
				{section:"file", name:"New",icon:"url('assets/svg/contextMenu/new2.svg')",func:[
					{name:"Directory",icon:"url('assets/svg/contextMenu/directory.svg')",func:() => desktop.mem.new(e,desktop,Directory,"New Folder")},
					{name:"Metafile",icon:"url('assets/svg/contextMenu/metafile.svg')",func:() => desktop.mem.new(e,desktop,Metafile, "New Metafile.msf")},
					{name:"Text Document",icon:"url('assets/svg/contextMenu/textfile.svg')",func:() => desktop.mem.new(e,desktop,JsString, "New Text Document.txt")},
				]},
				{section:"file", name:"Paste",icon:"url('assets/svg/contextMenu/paste.svg')",func: () => {return} },
				{section:"info", name:"Settings",icon:"url('assets/svg/contextMenu/settings2.svg')",func: () => {return} },
				{section:"info", name:"About",icon:"url('assets/svg/contextMenu/about.svg')",func: () => {return} }
			]
			openMenu(e, desktop,menuSections,menuOptions)
		}
	}
//----------------------------------------------------------------------|

//selectBox behavior----------------------------------------------------|
desktop.mem.selectBox = function() {
	let pos1 = 0, pos2 = 0, posxIn = 0, posyIn = 0

	let selectBox = document.createElement("div")
	selectBox.setAttribute("id", "selectBox")
	desktop.node.appendChild(selectBox)
	
	pos1 = 0
	pos2 = 0

	selectBoxPosition()

	//get initial mouse position-----------|
	function selectBoxPosition(e) {
		e = e || window.event
		e.preventDefault()
		
		//get click position:
		posxIn = e.clientX + desktop.node.scrollLeft
		posyIn = e.clientY + desktop.node.scrollTop

		wasCtrl = (e.ctrlKey == true)
		
		selectBox.style.top = posyIn + "px"
		selectBox.style.left = posxIn + "px"

		jsc.iframeAntiHover(true)
		document.onmouseup = selectBoxRelease
		document.onmousemove = selectBoxSizing
	}
	
	//resizing-----------------------------|
	function selectBoxSizing(e) {
		e = e || window.event
		e.preventDefault()
		
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
		for (icon of desktop.mem.iconArr){
			if (icon.node != null) { /*otherwise callback argument ruins everything*/
				if (jsc.areRectanglesOverlap(icon.node,selectBox)) {
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
		jsc.iframeAntiHover(false)
		document.onmouseup = null
		document.onmousemove = null

		//iconReaction--------------------------------------------------|
		
		for (icon of desktop.mem.iconArr){
			if (icon.node != null) { /*otherwise callback argument ruins everything*/
				if (jsc.areRectanglesOverlap(icon.node, selectBox) && icon.stat === 0) {
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