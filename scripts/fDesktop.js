//javascript.js //f.js //fMenu.js //fTasks.js //fIcons.js

window.addEventListener("resize", e => {
	idDesktop.style.width = document.body.offsetWidth + "px"
    idDesktop.style.height = document.body.offsetHeight - cfg.desk.navB.height + "px"
})

//set background size
idDesktop.style.width = document.body.offsetWidth + "px"
idDesktop.style.height = document.body.offsetHeight - cfg.desk.navB.height + "px"

//desktop task reference
const desktop = new Task(
	{
		apps : "vtx",
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
		if(e.target == idDesktop) openMenu(e,desktop)
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

desktop.mem.new = function(e, _this, Type){
    if (e.target.classList.contains("cmcheck")) return
	
	//Make sure icon appears at center of initial right click-------|
	let initialX = parseInt(window.getComputedStyle(document.getElementsByClassName("clickContext sub_0")[0],null).getPropertyValue("left"))
	let initialY = parseInt(window.getComputedStyle(document.getElementsByClassName("clickContext sub_0")[0],null).getPropertyValue("top"))

	let editFile = null
	let editFrom = sys.vertex

	let iconWidth = cfg.desk.grid.width/2
	let iconHeight = cfg.desk.grid.height/2

	let w = cfg.desk.grid.width; let h = cfg.desk.grid.height; let wm = cfg.desk.grid.hMargin; let hm = cfg.desk.grid.vMargin

	let iconPosX = (Math.round((initialX-iconWidth)/(w + wm))*(w + wm) + wm)
	let iconPosY = (Math.round((initialY-iconHeight)/(h + hm))*(h + hm) + hm)
	//--------------------------------------------------------------|

	let iconArray = desktop.mem.iconArr

	let typeDefaults = filetypeDefaults(Type)

	iconArray.push(new Icon (
		{
			imag : typeDefaults.iconImag,
			text : "¡Name me!",
			apps : typeDefaults.confType,
			stat : 1,
			coor : {
				px : iconPosX,
				py : iconPosY,
				tx : iconPosX,
				ty : iconPosY,
				ax : null,
				ay : null,
			} 
		}
	))
	let createdIcon = iconArray[iconArray.length - 1]
	repositionIcons([createdIcon],true,false)
	createdIcon.createNode()

	let iconText = document.getElementById("Icon: "+createdIcon.text).childNodes[1]
	//make h3 editable --------------------|
	iconText.setAttribute("contenteditable", "true")
	iconText.setAttribute("spellcheck", "false")

	//select h3 content
	selectText(iconText)

	iconText.style.textShadow = "none"

	//delete -> cancel icon creation
	document.body.oncontextmenu = iconNamingDelete
	window.onkeydown = (e) => {if(e.key == "Escape"){
		iconNamingDelete()
		return false
	}};
	function iconNamingDelete(){
		system.mem.var.shSelect = true
			
		createdIcon.deleteNode()

		nullifyOnEvents(_this)
	}

	setTimeout( () => { //TIMEOUT

		document.body.onmousedown = iconNaming;
		iconText.onkeydown = (e) => {if(e.key == "Enter" && e.shiftKey == false){
			iconNaming()
			return false
		}}

		function iconNaming(){
			if(
				!iconNameExists(iconText.textContent, createdIcon, editFrom) &&
				validIconName(iconText.textContent)
			) {
				//if the name is allowed --------------------|
				system.mem.var.shSelect = true

				iconText.setAttribute("contenteditable", "false")
				document.getElementById("Icon: "+createdIcon.text).id = "Icon: "+iconText.textContent
				createdIcon.text = iconText.textContent
				iconText.style.backgroundColor = ""
				iconText.style.textShadow = ""

				//insert it into filesystem
				sys.vertex.new(Type,iconText.textContent,createdIcon)

				createdIcon.statNode(1)
				desktop.pocket.push(createdIcon)

				//insert it into desktop mem
				//desktop.mem.iconArr.push(createdIcon)

				iconText.blur()
				clearSelection()

				nullifyOnEvents(_this)
			} else {
				//if the name not allowed --------------------|
				system.mem.var.shSelect = false
				iconText.style.backgroundColor = "#c90000"

				//insist -> keep only edited selected
				document.body.onclick = iconNamingInsist
				window.onkeyup = (e) => {if(e.key == "Enter" && e.shiftKey == false){
					iconNamingInsist()
					return false
				}}
				function iconNamingInsist(){
					for (icon of desktop.mem.iconArr){
						icon.statNode(0)
					}
					createdIcon.statNode(1)
					createdIcon.stat = 0

					selectText(iconText)
				}
			}
		}
	}, 1) //TIMEOUT
}