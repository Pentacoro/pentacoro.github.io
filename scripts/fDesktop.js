//javascript.js
//f.js
//fMenu.js
//fTasks.js
//fIcons.js

window.addEventListener("resize", e => {
	idDesktop.style.width = document.body.offsetWidth + "px"
    idDesktop.style.height = document.body.offsetHeight - cfg.desk.navB.height + "px"
})

//set background size
idDesktop.style.width = document.body.offsetWidth + "px"
idDesktop.style.height = document.body.offsetHeight - cfg.desk.navB.height + "px"

//desktop task reference
sys.taskArr.push(new Task("desktop", false, null, idDesktop, "sys"))
const desktop = sys.taskArr[sys.taskArr.length - 1]

desktop.mem.iconArr = []
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

			selectBox()
		}
	})

	//open desk menu on right click background
	idDesktop.oncontextmenu = e => {
		if(e.target == idDesktop) openMenu(e,desktop)
	}
//----------------------------------------------------------------------|

//selectBox behavior----------------------------------------------------|
function selectBox() {
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