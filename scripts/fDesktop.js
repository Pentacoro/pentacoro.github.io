//javascript.js //f.js //fMenu.js //fTasks.js //fIcons.js

window.addEventListener("resize", e => {
	idDesktop.style.width = document.body.offsetWidth + "px"
    idDesktop.style.height = document.body.offsetHeight - cfg.desktop.taskbar.height + "px"
})

//set background size
idDesktop.style.width = document.body.offsetWidth + "px"
idDesktop.style.height = document.body.offsetHeight - cfg.desktop.taskbar.height + "px"

//desktop task reference
const desktop = new Task(
	{
		apps : "Vertex",
		inst : false,
		appEnd : null,
		node : idDesktop,
		from : "sys"
	}
)
sys.taskArr.push(desktop)

desktop.mem.iconArr = []

//when desktop click:---------------------------------------------------|
	//when desktop click-------------------|
	idDesktop.addEventListener("mousedown", e => {
		system.mem.focus(desktop)
		//if not clicking folder or window--------------|
		if(
			e.target.id == "desktop" &&
			keyPressCtrl == false &&
			!system.mem.var.dragging
		) {
			for (icon of desktop.pocket){
				desktop.pocket = desktop.pocket.remove(icon)
				icon.statNode(0)
			}
		} 
	})
	idDesktop.addEventListener("mousedown", e => {
		//if not clicking folder or window--------------|
		if(
			e.target.id == "desktop" &&
			!system.mem.var.dragging
		) {
			pos1 = 0
			pos2 = 0

			desktop.mem.selectBox()
		}
	})

	//open desk menu on right click background
	idDesktop.oncontextmenu = e => {
		if(e.target == idDesktop) {
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
					{name:"Grid Settings",icon:"url('assets/svg/contextMenu/gridsettings.svg')",func:() => loadAPP("./apps/settings_deskGrid/deskGridOptions_lau.js",[],envfocus)},
				]},
				{section:"view", name:"Refresh",icon:"url('assets/svg/contextMenu/refresh.svg')",func: () => desktop.mem.refresh},
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
	idDesktop.appendChild(selectBox)
	
	pos1 = 0
	pos2 = 0

	selectBoxPosition()

	//get initial mouse position-----------|
	function selectBoxPosition(e) {
		e = e || window.event
		e.preventDefault()
		
		//get click position:
		posxIn = e.clientX + idDesktop.scrollLeft
		posyIn = e.clientY + idDesktop.scrollTop

		wasCtrl = (keyPressCtrl == true)
		
		selectBox.style.top = posyIn + "px"
		selectBox.style.left = posxIn + "px"

		iframeAntiHover (true)
		document.onmouseup = selectBoxRelease
		document.onmousemove = selectBoxSizing
	}
	
	//resizing-----------------------------|
	function selectBoxSizing(e) {
		e = e || window.event
		e.preventDefault()
		
		//get cursor position:
		pos1 = e.clientX + idDesktop.scrollLeft
		pos2 = e.clientY + idDesktop.scrollTop
		
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
				if (areRectanglesOverlap(icon.node,selectBox)) {
					//light up colliding icon hover border:
					highlight(icon.node)
				} else {
					//unlight non-colliding icon hover border:
					lowlight(icon.node)
				}
			}
		}
		//--------------------------------------------------iconReaction|
	}
	
	function selectBoxRelease() {
		iframeAntiHover (false)
		document.onmouseup = null
		document.onmousemove = null

		//iconReaction--------------------------------------------------|
		
		for (icon of desktop.mem.iconArr){
			if (icon.node != null) { /*otherwise callback argument ruins everything*/
				if (areRectanglesOverlap(icon.node, selectBox) && icon.stat === 0) {
					desktop.pocket.push(icon)
					icon.statNode(1)
				} else if (wasCtrl == false) {
					desktop.pocket = desktop.pocket.remove(icon)
					icon.statNode(0)
				}
				lowlight(icon.node)
			}
		}
		//--------------------------------------------------iconReaction|
	
		selectBox.parentElement.removeChild(selectBox)
	}
}

//----------------------------------------------------selectBox behavior|

//desktop methods

desktop.mem.renderIcons = function() {
	for (file of Object.entries(sys.vertex.cont)) {
		file[1].render()
	}
}
desktop.mem.refresh = function() {
    desktop.pocket = []

	for (icon of desktop.mem.iconArr) {
		icon.deleteNode()
	}

	for (file of Object.entries(sys.vertex.cont)) {
		file[1].render()
	}
}
desktop.focus = function() {
	for (icon of desktop.mem.iconArr) {
		icon.gray(false)
	}
}
desktop.unfocus = function() {
	for (icon of desktop.mem.iconArr) {
		icon.gray(true)
	}
}

desktop.mem.new = function(e, _this, Type, name){
	//Make sure icon appears at center of initial right click-------|
	let initialX = parseInt(window.getComputedStyle(document.getElementsByClassName("clickContext sub_0")[0],null).getPropertyValue("left"))
	let initialY = parseInt(window.getComputedStyle(document.getElementsByClassName("clickContext sub_0")[0],null).getPropertyValue("top"))

	let editFile = null
	let editFrom = sys.vertex

	let iconWidth = cfg.desktop.grid.width/2
	let iconHeight = cfg.desktop.grid.height/2

	let w = cfg.desktop.grid.width; let h = cfg.desktop.grid.height; let wm = cfg.desktop.grid.hMargin; let hm = cfg.desktop.grid.vMargin

	let iconPosX = (Math.round((initialX-iconWidth)/(w + wm))*(w + wm) + wm)
	let iconPosY = (Math.round((initialY-iconHeight)/(h + hm))*(h + hm) + hm)
	//--------------------------------------------------------------|
	let typeDefaults = filetypeDefaults(Type)

	function createDesktopFile(name) {
		if(!iconNameExists(name, null, editFrom)) {
			let newFileIcon = new Icon (
				{
					imag : typeDefaults.iconImag,
					name : name,
					type : typeDefaults.confType,
					stat : 0,
					coor : {
						px : iconPosX,
						py : iconPosY,
						tx : iconPosX,
						ty : iconPosY,
						ax : null,
						ay : null,
					} 
				}
			)
			editFrom.new(Type,name,newFileIcon)
			editFrom.cont[name].render()

			return newFileIcon
		} else {
			let exte = name.match(/\.(?:.(?<!\.))+$/s)
			exte = (exte!=null && exte.length > 0) ? exte[0] : ""
			name = name.replace(exte,"")
			let amnt = name.match(/(?<!\w)\d+$/)
			amnt = (amnt!=null && amnt.length > 0) ? parseInt(amnt[0],10) : ""
			let dgts = (amnt!="") ? (""+amnt).length : 1
			name = (amnt!="") ? name.slice(0,(name.length)-dgts) + (amnt+1) : name + " 2"
			name = name + exte
			return createDesktopFile(name)
		}
	}

	iconRename(e,createDesktopFile(name))
}