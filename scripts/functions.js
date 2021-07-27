function iframeAntiHover (coin) {
	var tagIframe = document.getElementsByTagName("iframe");

	for (i = 0; i < tagIframe.length; i++) {
		if (coin == true) {
			tagIframe[i].className += "antiHover";
		}
		if (coin == false) {
			tagIframe[i].classList.remove("antiHover");
		}
	}
}

function selectText(node) {
    if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
}

window.addEventListener("mousedown", e => {if(keyPressCtrl == true)console.log(e.target)});
window.addEventListener("keyup",     e => {if(keyPressCtrl == true)console.log(e.key)});

//Boolean key checks-----------------------------------------------|
	var keyPressCtrl = false; //17
	var keyPressC = false; //67

	//C KEY-------------------------------------------------|
		window.addEventListener('keydown', e => {
			if(e.key === ","){
				keyPressComma = true;
			}
		})

		window.addEventListener('keyup', e => {
			if(e.key === ","){
				keyPressComma = false;
			}
		})
	//-------------------------------------------------C KEY|

	//CONTROL-----------------------------------------------|
		window.addEventListener('keydown', e => {
			if(e.key === "Control"){
				keyPressCtrl = true;
			}
		})

		window.addEventListener('keyup', e => {
			if(e.key === "Control"){
				keyPressCtrl = false;
			}
		})
	//-----------------------------------------------CONTROL|

//-----------------------------------------------Boolean key checks|

//HTML element references------------------------------------|

const idBackground= document.getElementById('background');

const idNavbar    = document.getElementById('navbar');

const idSelectBox = document.getElementById('selectBox');

const idCtextMenu = document.getElementById("iconContextMenu");

const idDesktMenu = document.getElementById("deskContextMenu");

const classIcon   = document.getElementsByClassName("icon");

const classActive = document.getElementsByClassName("active");

const classWindow = document.getElementsByClassName("window");

//------------------------------------HTML element references|

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
			keyPressCtrl == false
		) {
			for (icon of iconArray){
				icon.stat = 0;
				icon.statNode();
			}
		} 
	})
//----------------------------------------------------------------------|

function clearSelection(){
	if (window.getSelection) {window.getSelection().removeAllRanges();}
	else if (document.selection) {document.selection.empty();}
   }

idBackground.oncontextmenu = (e) => {if(e.target == idBackground){deskMenu(e)}};

window.addEventListener("mousedown", (e) => {
	if (e.target.parentElement.parentElement){
		if(
			e.target.parentElement.classList.contains("contextMenu") == false && 
			e.target.parentElement.parentElement.classList.contains("contextMenu") == false
		) {
			closeMenu()
			clearSelection();
		}
	} else{
		closeMenu();
	}
});

function deskMenu(e) {
	e.preventDefault();

	closeMenu();
	idDesktMenu.style.display = "grid";
	idDesktMenu.style.top = e.clientY + idBackground.scrollTop + "px";
	idDesktMenu.style.left = e.clientX + idBackground.scrollLeft + "px";

	idDesktMenu.blur();
	idCtextMenu.blur();

	deskMenuOpen();
}
function closeMenu() {
    idDesktMenu.style.display = "";
	idCtextMenu.style.display = "";

	iconMenuClose();
	deskMenuClose();
}

//------------------------------------------------------------------------------background behavior|

function highlight(hIcon) {
    hIcon.style.border = '3px dotted rgb(255,255,255,0.30)';
} 
function lowlight(hIcon) {
    hIcon.style.border = '';
} 

//selectBox behavior-------------------------------------------------------------------------------|
selectBox();
function selectBox() {
	let pos1 = 0, pos2 = 0, posxIn = 0, posyIn = 0;
	
	//when desktop click------------------------------------------------|
	window.addEventListener("mousedown", function(event) {
		let target = event.target;
		//if not clicking folder or window------------------------------|
		if(
			target.id == "background"
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

//-----------------------------------------------------------------|
function areRectanglesOverlap(div1, div2) {
	let x1 = div1.offsetLeft;
	let y1 = div1.offsetTop;
	let h1 = y1 + div1.offsetHeight;
	let w1 = x1 + div1.offsetWidth;

	let x2 = div2.offsetLeft;
	let y2 = div2.offsetTop;
	let h2 = y2 + div2.offsetHeight;
	let w2 = x2 + div2.offsetWidth;

	if (h1 < y2 || y1 > h2 || w1 < x2 || x1 > w2) return false;
	return true;
}
//-----------------------------------------------------------------|