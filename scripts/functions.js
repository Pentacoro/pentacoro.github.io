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

//Boolean key checks-----------------------------------------------|
	var keyPressCtrl = false; //17
	var keyPressC = false; //67

	//C KEY-------------------------------------------------|
		window.addEventListener('keydown', function(e){
			if(e.keyCode === 67 && keyPressC === false){
				keyPressC = true;
				console.log("c " + keyPressC);
			}
		})

		window.addEventListener('keyup', function(e){
			if(e.keyCode === 67 && keyPressC === true){
				keyPressC = false;
				console.log("c " + keyPressC);
			}
		})
	//-------------------------------------------------C KEY|

	//CONTROL-----------------------------------------------|
		window.addEventListener('keydown', function(e){
			if(e.keyCode === 17 && keyPressCtrl === false){
				keyPressCtrl = true;
				console.log("ctrl " + keyPressCtrl);
			}
		})

		window.addEventListener('keyup', function(e){
			if(e.keyCode === 17 && keyPressCtrl === true){
				keyPressCtrl = false;
				console.log("ctrl " + keyPressCtrl);
			}
		})
	//-----------------------------------------------CONTROL|

//-----------------------------------------------Boolean key checks|

//HTML element references------------------------------------|

const idBackground= document.getElementById("background");

const idSelectBox = document.getElementById('selectBox');

const idCtextMenu = document.getElementById("iconContextMenu");

const idDesktMenu = document.getElementById("deskContextMenu")

const classIcon   =   document.getElementsByClassName("icon");

const classActive = document.getElementsByClassName("active");

const classWindow = document.getElementsByClassName("window");

//------------------------------------HTML element references|

var iconGrid = true;

//background behavior------------------------------------------------------------------------------|

//unselect all folders when desktop click:------------------------------|
	//when desktop click-------------------|
	document.onmousedown = function(e) {
		//if not clicking folder or window--------------|
		if(
			e.target.id == "background" &&
			keyPressCtrl == false
		) {
			for (i = iconArray.length - 1; i >= 0; i--){
				iconArray[i].stat = 0;
				iconArray[i].statNode();
			}
		} 
	}
//----------------------------------------------------------------------|

idBackground.oncontextmenu = deskMenu;

function deskMenu(e) {
	e.preventDefault();
	if(
		e.target.id == "background"
	) {
		closeMenu();
		idDesktMenu.style.display = "grid";
		idDesktMenu.style.top = e.clientY + "px";
		idDesktMenu.style.left = e.clientX + "px";

		deskMenuOpen();
	
		idBackground.onclick = closeMenu;
	}
	return false; 
}
function closeMenu() {
    idDesktMenu.style.display = "";
	idCtextMenu.style.display = "";

	iconMenuClose();
	deskMenuClose();

	idBackground.onclick = null;
}

//------------------------------------------------------------------------------background behavior|

function highlight(hIcon) {
    hIcon.style.border = '3px dotted rgb(255,255,255,0.16)';
} 
function lowlight(hIcon) {
    hIcon.style.border = '';
} 

//selectBox behavior-------------------------------------------------------------------------------|
selectBox();
function selectBox() {
	let pos1 = 0, pos2 = 0, posxIn = 0, posyIn = 0;
	
	//when desktop click------------------------------------------------|
	idBackground.addEventListener("mousedown", function(event) {
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
		posxIn = e.clientX;
		posyIn = e.clientY;

		wasCtrl = (keyPressCtrl == true);
		
		idSelectBox.style.top = posyIn + "px";
		idSelectBox.style.left = posxIn + "px";

		iframeAntiHover (true);
		document.onmouseup = selectBoxRelease;
		document.onmousemove = selectBoxSizing;

		//console.log("selectBoxPosition");
	}
	
	//resizing-----------------------------|
	function selectBoxSizing(e) {
		e = e || window.event;
		e.preventDefault();
		
		//get cursor position:
		pos1 = e.clientX;
		pos2 = e.clientY;
		
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
		for (i = iconArray.length - 1; i >= 0; i--){
			if (areRectanglesOverlap(document.getElementById(iconArray[i].text),idSelectBox)) {
				//light up colliding icon hover border:
				highlight(document.getElementById(iconArray[i].text));
			} else {
				//unlight non-colliding icon hover border:
				lowlight(document.getElementById(iconArray[i].text));
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
		for (i = iconArray.length - 1; i >= 0; i--){
			if (areRectanglesOverlap(document.getElementById(iconArray[i].text), idSelectBox)) {
				//activate colliding icon hover border:
				iconArray[i].stat = 1;
				iconArray[i].statNode();
			} else if (wasCtrl == false) {
				//deactivate non-colliding icon hover border UNLESS ctrl:
				iconArray[i].stat = 0;
				iconArray[i].statNode();
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

//window behavior----------------------------------------------------------------------------------|

//all .window divs act like windows------|
for (i = 0; i < classWindow.length; i++) {
	dragWindow(classWindow[i]);
	sizeWindow(classWindow[i]);
}
//---------------------------------------|

//window dragging------------------------------------------------------------------|
	function dragWindow(wndw) {
		var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		
		if (wndw.getElementsByClassName("header")[0]) {
			//if present, the header is where you move the window from:
			wndw.getElementsByClassName("header")[0].onmousedown = dragMouseDown;
		} else {
			//otherwise, move the window from anywhere inside the DIV:
			wndw.onmousedown = dragMouseDown;
		}

		function dragMouseDown(e) {
			e = e || window.event;
			e.preventDefault();
			//get initial cursor position:
			pos3 = e.clientX;
			pos4 = e.clientY;

			document.onmouseup = closeDragWindow;
			document.onmousemove = windowDrag;
			iframeAntiHover (true);
		}
		function windowDrag(e) {
			e = e || window.event;
			e.preventDefault();

			//calculate new cursor position:
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;

			//set the window's new position:
			wndw.style.top = (wndw.offsetTop - pos2) + "px";
			wndw.style.left = (wndw.offsetLeft - pos1) + "px";
		}

		function closeDragWindow() {
			//stop moving when mouse button is released:
			document.onmouseup = null;
			document.onmousemove = null;
			iframeAntiHover (false);
		}
	}
//------------------------------------------------------------------window dragging|

//window resizing------------------------------------------------------------------|
	function sizeWindow(wndw) {
		var startX, startY, startWidth, startHeight, startLeft, startTop, border;

		var idWindowBorder = document.getElementById("windowBorder");

		for (i = 0; i < idWindowBorder.childNodes.length; i++) {
			idWindowBorder.childNodes[i].onmousedown = initResize;
		}

		function initResize(e) {
			e = e || window.event;
			e.preventDefault();

			startX = e.clientX;
			startY = e.clientY;

			startWidth = wndw.offsetWidth;
			startHeight = wndw.offsetHeight;

			startLeft = wndw.offsetLeft;
			startTop = wndw.offsetTop;
			
			border = e.target.id;
			
			document.onmouseup = stopResize;
			document.onmousemove = doResize;
			iframeAntiHover (true);
		}
		
		function doResize(e) {
			e = e || window.event;
			e.preventDefault();

			//get int for wndw min-height and min-width css values
			var minHeight = parseInt(window.getComputedStyle(document.getElementById(border).parentElement.parentElement,null).getPropertyValue("min-height"));
			var minWidth = parseInt(window.getComputedStyle(document.getElementById(border).parentElement.parentElement,null).getPropertyValue("min-width"));
			
			//when sizing towards →
			if (border == "windowErig" || border == "windowCbr" || border == "windowCtr") {
				wndw.style.width = startWidth + e.clientX - startX + "px";
			}
			//when sizing towards ↓
			if (border == "windowEbot" || border == "windowCbr" || border == "windowCbl") {
				wndw.style.height = startHeight + e.clientY - startY + "px";
			}
			//when sizing towards ← ---------- [accounting for wndw min-width]
			if (border == "windowElef" || border == "windowCtl" || border == "windowCbl") {
				if (startLeft + e.clientX - startX < startLeft + (startWidth - minWidth)){
					wndw.style.left = startLeft + e.clientX - startX + "px";
					wndw.style.width = startWidth + (e.clientX - startX) * -1 + "px";
				} else {
					//stuck in minimum size
					wndw.style.left = startLeft + (startWidth - minWidth) + "px";
					wndw.style.width = minWidth + "px";
				}
			//when sizing towards ↑ ---------- [accounting for wndw min-height]
			}
			if (border == "windowEtop" || border == "windowCtl" || border == "windowCtr") {
				if (startTop + e.clientY - startY < startTop + (startHeight - minHeight)){
					wndw.style.top = startTop + e.clientY - startY + "px";
					wndw.style.height = startHeight + (e.clientY - startY) * -1 + "px";
				} else {
					//stuck in minimum size
					wndw.style.top = startTop + (startHeight - minHeight) + "px";
					wndw.style.height = minHeight + "px";
				}
			}
		}
	
		function stopResize() {
			document.onmouseup = null;
			document.onmousemove = null;
			iframeAntiHover (false);
		}
	}
//------------------------------------------------------------------window resizing|

//----------------------------------------------------------------------------------window behavior|

//-----------------------------------------------------------------|
function areRectanglesOverlap(div1, div2) {
	var x1 = div1.offsetLeft;
	var y1 = div1.offsetTop;
	var h1 = y1 + div1.offsetHeight;
	var w1 = x1 + div1.offsetWidth;

	var x2 = div2.offsetLeft;
	var y2 = div2.offsetTop;
	var h2 = y2 + div2.offsetHeight;
	var w2 = x2 + div2.offsetWidth;

	if (h1 < y2 || y1 > h2 || w1 < x2 || x1 > w2) return false;
	return true;
}
//-----------------------------------------------------------------|