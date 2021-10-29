window.addEventListener("resize", e => {
	idBackground.style.width = document.body.offsetWidth + "px";
    idBackground.style.height = document.body.offsetHeight - cfg.desk.navB.height + "px";
})

var iconGrid = true;
var iconArray = [];
var windowArray = [];

//background behavior------------------------------------------------------------------------------|

//unselect all folders when desktop click:------------------------------|
	//when desktop click-------------------|
	idBackground.addEventListener("mousedown", e => {
		//if not clicking folder or window--------------|
		if(
			e.target.id == "background" &&
			keyPressCtrl == false &&
			!dragging
		) {
			for (icon of iconArray){
				icon.stat = 0;
				icon.statNode();
			}
		} 
	})
//----------------------------------------------------------------------|

//------------------------------------------------------------------------------background behavior|

//selectBox behavior-------------------------------------------------------------------------------|
selectBox();
function selectBox() {
	let pos1 = 0, pos2 = 0, posxIn = 0, posyIn = 0;
	
	//when desktop click------------------------------------------------|
	window.addEventListener("mousedown", function(event) {
		let target = event.target;
		//if not clicking folder or window------------------------------|
		if(
			target.id == "background" &&
			!dragging
		) {
			pos1 = 0;
			pos2 = 0; 
			selectBoxPosition();
		} 
	});
	
	//get initial mouse position-----------|
	function selectBoxPosition(e) {
		e = e || window.event;
		e.preventDefault();
		
		//get click position:
		posxIn = e.clientX + idBackground.scrollLeft;
		posyIn = e.clientY + idBackground.scrollTop;

		wasCtrl = (keyPressCtrl == true);
		
		idSelectBox.style.top = posyIn + "px";
		idSelectBox.style.left = posxIn + "px";

		iframeAntiHover (true);
		document.onmouseup = selectBoxRelease;
		document.onmousemove = selectBoxSizing;
	}
	
	//resizing-----------------------------|
	function selectBoxSizing(e) {
		e = e || window.event;
		e.preventDefault();
		
		//get cursor position:
		pos1 = e.clientX + idBackground.scrollLeft;
		pos2 = e.clientY + idBackground.scrollTop;
		
		//show selectBox:
		idSelectBox.style.opacity = '1';

		if ((pos2 - posyIn) > 0) { //if cursor below ↓ from initial position
			idSelectBox.style.height = (pos2 - posyIn) + 1 + "px";
			idSelectBox.style.top = posyIn + "px";
		} else { //cursor is above ↑ from initial position
			idSelectBox.style.height = (pos2 - posyIn) * -1 + "px";
			idSelectBox.style.top = (posyIn - idSelectBox.offsetHeight) + "px";
		}
		if ((pos1 - posxIn) > 0) { //if cursor right → from initial position
			idSelectBox.style.width = (pos1 - posxIn) + 1 + "px";
			idSelectBox.style.left = posxIn + "px";
		} else { //cursor is left  ← from initial position
			idSelectBox.style.width = (pos1 - posxIn) * -1 + "px";
			idSelectBox.style.left = (posxIn - idSelectBox.offsetWidth) + "px";
		}
		
		//iconReaction--------------------------------------------------|
		for (icon of iconArray){
			if (document.getElementById(icon.text) != null) { /*otherwise callback argument ruins everything*/
				if (areRectanglesOverlap(document.getElementById(icon.text),idSelectBox)) {
					//light up colliding icon hover border:
					highlight(document.getElementById(icon.text));
				} else {
					//unlight non-colliding icon hover border:
					lowlight(document.getElementById(icon.text));
				}
			}
		};
		//--------------------------------------------------iconReaction|

		//console.log("selectBoxSizing");
	}
	
	function selectBoxRelease() {
		iframeAntiHover (false);
		document.onmouseup = null;
		document.onmousemove = null;

		//iconReaction--------------------------------------------------|
		
		for (icon of iconArray){
			if (document.getElementById(icon.text) != null) { /*otherwise callback argument ruins everything*/
				if (areRectanglesOverlap(document.getElementById(icon.text), idSelectBox)) {
					//activate colliding icon hover border:
					icon.stat = 1;
					icon.statNode();
				} else if (wasCtrl == false) {
					//deactivate non-colliding icon hover border UNLESS ctrl:
					icon.stat = 0;
					icon.statNode();
				}
			}
		}
		//--------------------------------------------------iconReaction|
	
		idSelectBox.style.opacity = '';
		idSelectBox.style.height = '';
		idSelectBox.style.width = '';
		idSelectBox.style.top = '0';
		idSelectBox.style.left = '0';

		//console.log("selectBoxRelease");
	}
}
//-------------------------------------------------------------------------------selectBox behavior|