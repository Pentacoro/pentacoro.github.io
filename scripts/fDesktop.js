window.addEventListener("resize", e => {
	idDesktop.style.width = document.body.offsetWidth + "px"
    idDesktop.style.height = document.body.offsetHeight - cfg.desk.navB.height + "px"
})

var windowArray = []

var desktop = {
	dir    : "/vertex",
	apps   : "ver",
	node   : idDesktop,
	pocket : [],
	memory : {
		iconArray : []
	}
}

//unselect all folders when desktop click:------------------------------|
	//when desktop click-------------------|
	idDesktop.addEventListener("mousedown", e => {
		//if not clicking folder or window--------------|
		envfocus = desktop
		if(
			e.target.id == "desktop" &&
			keyPressCtrl == false &&
			!dragging
		) {
			for (icon of desktop.pocket){
				desktop.pocket = desktop.pocket.remove(icon)
				icon.statNode(0)
			}
		} 
	})

	//open desk menu on right click background
	idDesktop.oncontextmenu = e => {
		if(e.target == idDesktop) openMenu(e,desktop)
	}
//----------------------------------------------------------------------|

//selectBox behavior----------------------------------------------------|
selectBox()
function selectBox() {
	let pos1 = 0, pos2 = 0, posxIn = 0, posyIn = 0
	
	//when desktop click------------------------------------------------|
	window.addEventListener("mousedown", function(event) {
		let target = event.target
		//if not clicking folder or window------------------------------|
		if(
			target.id == "desktop" &&
			!dragging
		) {
			pos1 = 0
			pos2 = 0
			selectBoxPosition()
		} 
	});
	
	//get initial mouse position-----------|
	function selectBoxPosition(e) {
		e = e || window.event
		e.preventDefault()
		
		//get click position:
		posxIn = e.clientX + idDesktop.scrollLeft
		posyIn = e.clientY + idDesktop.scrollTop

		wasCtrl = (keyPressCtrl == true)
		
		idSelectBox.style.top = posyIn + "px"
		idSelectBox.style.left = posxIn + "px"

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
		idSelectBox.style.opacity = '1'

		if ((pos2 - posyIn) > 0) { //if cursor below ↓ from initial position
			idSelectBox.style.height = (pos2 - posyIn) + 1 + "px"
			idSelectBox.style.top = posyIn + "px"
		} else { //cursor is above ↑ from initial position
			idSelectBox.style.height = (pos2 - posyIn) * -1 + "px"
			idSelectBox.style.top = (posyIn - idSelectBox.offsetHeight) + "px"
		}
		if ((pos1 - posxIn) > 0) { //if cursor right → from initial position
			idSelectBox.style.width = (pos1 - posxIn) + 1 + "px"
			idSelectBox.style.left = posxIn + "px"
		} else { //cursor is left  ← from initial position
			idSelectBox.style.width = (pos1 - posxIn) * -1 + "px"
			idSelectBox.style.left = (posxIn - idSelectBox.offsetWidth) + "px"
		}
		
		//iconReaction--------------------------------------------------|
		for (icon of desktop.memory.iconArray){
			if (icon.node != null) { /*otherwise callback argument ruins everything*/
				if (areRectanglesOverlap(icon.node,idSelectBox)) {
					//light up colliding icon hover border:
					highlight(icon.node)
				} else {
					//unlight non-colliding icon hover border:
					lowlight(icon.node)
				}
			}
		};
		//--------------------------------------------------iconReaction|
	}
	
	function selectBoxRelease() {
		iframeAntiHover (false)
		document.onmouseup = null
		document.onmousemove = null

		//iconReaction--------------------------------------------------|
		
		for (icon of desktop.memory.iconArray){
			if (icon.node != null) { /*otherwise callback argument ruins everything*/
				if (areRectanglesOverlap(icon.node, idSelectBox)) {
					//activate colliding icon hover border:
					desktop.pocket.push(icon)
					icon.statNode(1)
					lowlight(icon.node)
				} else if (wasCtrl == false) {
					//deactivate non-colliding icon hover border UNLESS ctrl:
					desktop.pocket = desktop.pocket.remove(icon)
					icon.statNode(0)
					lowlight(icon.node)
				}
			}
		}
		//--------------------------------------------------iconReaction|
	
		idSelectBox.style.opacity = ''
		idSelectBox.style.height = ''
		idSelectBox.style.width = ''
		idSelectBox.style.top = '0'
		idSelectBox.style.left = '0'
	}
}
//----------------------------------------------------selectBox behavior|