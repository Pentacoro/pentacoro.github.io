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

var $dragging = false;

//HTML element references------------------------------------|

var idSelectBox = document.getElementById('selectBox');

var classFolder = document.getElementsByClassName("folder");

var classActive = document.getElementsByClassName("active");

var classWindow = document.getElementsByClassName("window");

//------------------------------------HTML element references|

var iconGrid = true;

//all .folder divs act like icons------------|
for (var i = 0; i < classFolder.length; i++) {
	dragIcon(classFolder[i]);
}
//-------------------------------------------|

//folder behavior------------------------------------------------------------------------------------------------------|
function dragIcon(elmnt) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	
	elmnt.onmousedown = dragMouseDown;	

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		
		//get initial cursor position:
		pos3 = e.clientX;
		pos4 = e.clientY;
		
		//when mousedown on selected folder
		if (classActive.length > 0 && elmnt.classList.contains('active')) {
			//managing selected folders
			for (var i = 0; i < classActive.length; i++) {
				//light up all hover border onmousedown:------------------------|
				classActive[i].style.border = '3px dotted rgb(255,255,255,0.16)';
				//--------------------------------------------------------------|
			}
		} else {
			//light up 1 hover border onmousedown:
			elmnt.style.border = '3px dotted rgb(255,255,255,0.16)';
			elmnt.style.backgroundColor = 'rgb(0,0,0,0)';
			
			//when mousedown on unselected folder
			if(keyPressCtrl == false && $dragging == false) {
				$(".active").removeClass("active")
				
				elmnt.className += " active";
			} else if(keyPressCtrl == true) {
				elmnt.className += " active";
			}
		}
		
		document.onmouseup = closeDragIcon;
		document.onmousemove = iconDrag;
		iframeAntiHover (true);
	}								 

	function iconDrag(e) {
		e = e || window.event;
		e.preventDefault();
		
		//calculate new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		
		$dragging = true;
		
		//managing selected folders
		for (var i = 0; i < classActive.length; i++) {
			//set position for selected folders:---------------------------------|
			classActive[i].style.top = (classActive[i].offsetTop - pos2) + "px";
			classActive[i].style.left = (classActive[i].offsetLeft - pos1) + "px";
			//-------------------------------------------------------------------|
			
			//make folders transparent while moving------------------------------|
			classActive[i].style.opacity = '0.5';
			classActive[i].style.zIndex = '0';
			classActive[i].style.border = '3px solid rgb(0,0,0,0.0)';
			classActive[i].style.backgroundColor = 'rgb(0,0,0,0)';
			//-------------------------------------------------------------------|
		}
		//unselect other folders when dragging
		//$(".active").removeClass("active");
	}

	function closeDragIcon() {	
		//stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
		iframeAntiHover (false);
		
		if (classActive.length > 0) {
		//managing selected folders
			for (var i = 0; i < classActive.length; i++) {
				//set position grid for selected folders:----------------------------|
				if (iconGrid == true) {
					classActive[i].style.top = (Math.round((classActive[i].offsetTop - pos1)/120)*120 + 10) + "px";
					classActive[i].style.left = (Math.round((classActive[i].offsetLeft - pos1)/120)*120 + 10) + "px";
				}	
				//-------------------------------------------------------------------|

				//make folders solid when stopped------------------------------------|
				classActive[i].style.opacity = '1';
				classActive[i].style.zIndex = '1';
				classActive[i].style.border = '';
				classActive[i].style.backgroundColor = '';
				//-------------------------------------------------------------------|
			}
		}else{
			elmnt.style.top = (Math.round((elmnt.offsetTop - pos1)/120)*120 + 10) + "px";
			elmnt.style.left = (Math.round((elmnt.offsetLeft - pos1)/120)*120 + 10) + "px";
			
			elmnt.style.opacity = '1';
			elmnt.style.zIndex = '1';
			elmnt.style.border = '';
			elmnt.style.backgroundColor = '';
		}
		
		//unselect other folders on mouseup W/O drag UNLESS ctrl
		if(keyPressCtrl == false && $dragging == false) {
			$(".active").removeClass("active")
		}
		
		//become active on mouseup without moving
		if (elmnt.classList.contains('active') == false) {
			elmnt.className += " active";
		}
		
		$dragging = false;
	}
}
//------------------------------------------------------------------------------------------------------folder behavior|

//unselect all folders when desktop click:--|
$(document).mousedown(function(event) { 
	var $target = $(event.target);
	if(
		!$target.closest(".folder").length && 
		$(".folder").hasClass('active') && 
		keyPressCtrl == 0
	) {
		$(".folder").removeClass('active');
		$(".folder").css("border" , '');
	}        
});
//------------------------------------------|

//selectBox behavior---------------------------------------------------------------------------------------------------|
selectBox();
function selectBox() {
	var pos1 = 0, pos2 = 0, posxIn = 0, posyIn = 0;
	
	//when desktop click------------------------------------------------|
	idBackground.onmousedown = function(event) {
		var $target = event.target;
		//if not clicking folder or window------------------------------|
		if(
			$target.classList.contains("folder")==false &&
			$target.parentElement.classList.contains("folder")==false &&
			$target.classList.contains("window")==false &&
			$target.parentElement.classList.contains("window")==false &&
			$target.parentElement.id !== "windowBorder"
		) {
			pos1 = 0;
			pos2 = 0; 
			selectBoxPosition();
		} 
	}
	
	//get initial mouse position-----------|
	function selectBoxPosition(e) {
		e = e || window.event;
		e.preventDefault();
		
		//get click position:
		posxIn = e.clientX;
		posyIn = e.clientY;
		
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
		for (var i = 0; i < classFolder.length; i++) {
			isUnderSBox(classFolder[i],idSelectBox);
		}
		function isUnderSBox(icon,sBox) {
			//console.log('hello');
			
			if (areRectanglesOverlap(icon,sBox)) {
				//light up colliding folder hover border:
				icon.className += " active";
				icon.style.backgroundColor = 'rgb(0,155,255,0)';
				icon.style.border = '3px dotted rgb(255,255,255,0.16)';
			} else if (keyPressCtrl == false) {
				//unlight non-colliding folder hover border UNLESS ctrl
				icon.classList.remove('active');
				icon.style.border = '';
			}
		};
		//--------------------------------------------------iconReaction|

		//console.log("selectBoxSizing");
	}
	
	function selectBoxRelease() {
		iframeAntiHover (false);
		document.onmouseup = null;
		document.onmousemove = null;
		
		idSelectBox.style.opacity = '';
		idSelectBox.style.height = '';
		idSelectBox.style.width = '';
		idSelectBox.style.top = '0';
		idSelectBox.style.left = '0';

		//iconReaction--------------------------------------------------|
		for (var i = 0; i < classActive.length; i++) {
			//make icons look selected onmouseup------------------------|
			classActive[i].style.border = '';
			classActive[i].style.backgroundColor = '';
			//----------------------------------------------------------|
		}
		//--------------------------------------------------iconReaction|

		//console.log("selectBoxRelease");
	}
}
//---------------------------------------------------------------------------------------------------selectBox behavior|

//window behavior------------------------------------------------------------------------------------------------------|

//all .window divs act like windows------|
for (i = 0; i < classWindow.length; i++) {
	dragWindow(classWindow[i]);
	sizeWindow(classWindow[i])
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

//------------------------------------------------------------------------------------------------------window behavior|