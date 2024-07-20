//-----------------------------------------------------------------|
function dll.areRectanglesOverlap(div1, div2) {
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

var classFolder = document.getElementsByClassName("icon");

var classActive = document.getElementsByClassName("active");

var classWindow = document.getElementsByClassName("window");

//------------------------------------HTML element references|

var iconGrid = true;

//all .folder divs act like icons------------|
for (var i = 0; i < classFolder.length; i++) {
	dragIcon(classFolder[i]);
	sizeIcon(classFolder[i]);
}
//-------------------------------------------|

//folder behavior------------------------------------------------------------------------------------------------------|
function dragIcon(elmnt) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	
	elmnt.onmousedown = e => {
		if (!e.target.parentElement.classList.contains("exo")) dragMouseDown()
	}	

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
		
		if (classActive.length > 0) {
		//managing selected folders
			for (var i = 0; i < classActive.length; i++) {
				//set position grid for selected folders:----------------------------|
				if (iconGrid == true) {
					classActive[i].style.top = (Math.round((classActive[i].offsetTop - pos1)/120)*120 + 12) + "px";
					classActive[i].style.left = (Math.round((classActive[i].offsetLeft - pos1)/120)*120 + 12) + "px";
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
			elmnt.style.top = (Math.round((elmnt.offsetTop - pos1)/120)*120 + 12) + "px";
			elmnt.style.left = (Math.round((elmnt.offsetLeft - pos1)/120)*120 + 12) + "px";
			
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

//--icon resizing------------------------------------------------------------------|
function sizeIcon(icon) {
	var startX, startY, startWidth, startHeight, startLeft, startTop, border;

	var w = icon.offsetWidth;
	var h = icon.offsetHeight;
	var r = gcd (w, h);

	var exo = icon.children[2]

	for (border of exo.children) {
		border.onmousedown = initResize
	}

	function initResize(e) {
		e = e || window.event;
		e.preventDefault();

		startX = e.clientX;
		startY = e.clientY;

		startWidth = icon.offsetWidth;
		startHeight = icon.offsetHeight;

		startLeft = icon.offsetLeft;
		startTop = icon.offsetTop;
		
		border = e.target.classList[1];
		
		document.onmouseup = stopResize;
		document.onmousemove = doResize;
	}
	
	function doResize(e) {
		e = e || window.event;
		e.preventDefault();
		
		if (border == "iconErig" || border == "iconCbr" || border == "iconCtr") {
			icon.style.width = startWidth + e.clientX - startX + "px";
		}
		if (border == "iconEbot" || border == "iconCbr" || border == "iconCbl") {
			icon.style.height = startHeight + e.clientY - startY + "px";
		}

		if (border == "iconElef" || border == "iconCtl" || border == "iconCbl") {
			icon.style.left = startLeft + e.clientX - startX + "px";
			icon.style.width = startWidth + (e.clientX - startX) * -1 + "px";
		}
		if (border == "iconEtop" || border == "iconCtl" || border == "iconCtr") {
			icon.style.top = startTop + e.clientY - startY + "px";
			icon.style.height = startHeight + (e.clientY - startY) * -1 + "px";
		}	

		//_______________________
		w = icon.offsetWidth;
		h = icon.offsetHeight;
		r = gcd (w, h);
		//_______________________
		function isBetween(a, b, c) {
			if (a >= b && a <= c) return true
			return false
		}

		let dim = [w,h]
        let gdc = r
		let asp = [w/r,h/r]
		let div = (w/r)/(h/r)

		let sSize = 1
		let mSize = 1.17
		let bSize = 1.40

		responsiveIcon()

		function responsiveIcon() {
			if (isBetween(w, 1, 50) || isBetween(h, 1, 50)) {
				if (isBetween(div, 0.5, 1.5)) {
					icon.style.gridTemplateRows = "100% 0%"
					icon.style.gridTemplateColumns = "none"

					icon.children[0].style.display = "block"
					icon.children[0].style.padding = "2px"
					icon.children[0].style.maxWidth = ""
					icon.children[0].children[0].style.backgroundSize = "contain"

					icon.children[1].style.display = "none"
				}
				if (div < 0.5) {
					icon.style.gridTemplateRows = "100% 0%"
					icon.style.gridTemplateColumns = "none"

					icon.children[0].style.display = "block"
					icon.children[0].style.padding = "2px"
					icon.children[0].children[0].style.backgroundSize = "cover"
					icon.children[0].style.maxWidth = ""

					icon.children[1].style.display = "none"
				}
				if (div > 1.5) {
					icon.style.gridTemplateRows = "100% 100%"
					icon.style.gridTemplateColumns = "none"

					icon.children[0].style.display = "none"
					icon.children[0].style.maxWidth = ""

					icon.children[1].style.display = "block"
					icon.children[1].style.textAlign = "center"
					icon.children[1].style.fontSize = ""
					icon.children[1].style.fontSize = (h === 50) ? "" : rawr(icon.children[1].offsetHeight, 2.35, 44) + "em"
				}
				if (div > 3.5) {
					icon.style.gridTemplateRows = "100%"
					icon.style.gridTemplateColumns = "auto auto"

					icon.children[0].style.display = "block"
					icon.children[0].style.padding = "2px"
					icon.children[0].style.height = "100%"

					icon.style.gridTemplateColumns = icon.children[0].offsetHeight + "px auto"

					icon.children[1].style.display = "block"
					icon.children[1].style.textAlign = "left"
					icon.children[1].style.marginLeft = "8px"
					icon.children[1].style.fontSize = (h === 50) ? "" : rawr(icon.children[1].offsetHeight, 2.35, 44) + "em"
				}
				return
			}
			if (isBetween(w, 51, 90) || isBetween(h, 51, 90)) {
				if (isBetween(div, 0.5, 2.5)) {
					icon.style.gridTemplateRows = "auto 1.30em 0"
					icon.style.gridTemplateColumns = "none"

					icon.children[0].style.display = "block"
					icon.children[0].style.padding = "2px"
					icon.children[0].style.maxWidth = ""
					icon.children[0].style.height = "100%"
					icon.children[0].children[0].style.backgroundSize = "contain"

					icon.children[1].style.display = "block"
					icon.children[1].style.textAlign = "center"
					icon.children[1].style.fontSize = "1em"
					icon.children[1].style.marginLeft = ""
				}
				if (div < 0.5) {
					icon.style.gridTemplateRows = "100% 0%"
					icon.style.gridTemplateColumns = "none"

					icon.children[0].style.display = "block"
					icon.children[0].style.padding = "2px"
					icon.children[0].children[0].style.backgroundSize = "cover"
					icon.children[0].style.maxWidth = ""

					icon.children[1].style.display = "none"
				}
				if (div > 2.5) {
					icon.style.gridTemplateRows = "100% 100% 0"
					icon.style.gridTemplateColumns = "auto 100% 0"

					icon.children[0].style.display = "block"
					icon.children[0].style.padding = "2px"
					icon.children[0].style.height = "100%"

					icon.style.gridTemplateColumns = icon.children[0].offsetHeight + "px auto"

					icon.children[1].style.display = "block"
					icon.children[1].style.textAlign = "left"
					icon.children[1].style.marginLeft = "8px"
					icon.children[1].style.fontSize = rawr(icon.children[1].offsetHeight, 1.2, 44) + "em"
				}
				if (div > 6) {
					icon.style.gridTemplateRows = "100% 0%"
					icon.style.gridTemplateColumns = "none"

					icon.children[0].style.display = "block"
					icon.children[0].style.padding = "2px"
					icon.children[0].children[0].style.backgroundSize = "cover"
					icon.children[0].style.maxWidth = ""

					icon.children[1].style.display = "none"
				}
				return
			}
			if (isBetween(w, 91, 200) || isBetween(h, 91, 200)) {
				if (isBetween(div, 0.5, 1.5)) {
					icon.style.gridTemplateRows = (h < 91) ? "auto 1.30em 0" : ""
					icon.style.gridTemplateColumns = ""

					icon.children[0].style.display = ""
					icon.children[0].style.padding = ""
					icon.children[0].style.height = ""
					icon.children[0].style.maxWidth = ""
					icon.children[0].children[0].style.backgroundSize = ""

					icon.style.gridTemplateColumns = ""

					icon.children[1].style.display = ""
					icon.children[1].style.textAlign = ""
					icon.children[1].style.marginLeft = ""
					icon.children[1].style.fontSize = ""
				}
				if (div < 0.5 || div > 1.5) {
					icon.style.gridTemplateRows = "100% 0%"
					icon.style.gridTemplateColumns = "none"

					icon.children[0].style.display = "block"
					icon.children[0].style.padding = "2px"
					icon.children[0].children[0].style.backgroundSize = "cover"
					icon.children[0].style.maxWidth = ""

					icon.children[1].style.display = "none"
				}
				return
			}
			if (w > 200 || h > 200) {
				if (isBetween(div, 0.5, 1.5)) {
					icon.style.gridTemplateRows = "auto 3.90em 0"
					icon.style.gridTemplateColumns = ""

					icon.children[0].style.display = "block"
					icon.children[0].style.padding = "8px"
					icon.children[0].style.height = "100%"
					icon.children[0].style.maxWidth = ""
					icon.children[0].children[0].style.backgroundSize = ""

					icon.children[1].style.display = "block"
					icon.children[1].style.textAlign = "center"
					icon.children[1].style.marginLeft = ""
					icon.children[1].style.fontSize = rawr(icon.children[1].offsetHeight, 1.2, 44) + "em"
				}
				if (div < 0.5 || div > 1.5) {
					icon.style.gridTemplateRows = "100% 0%"
					icon.style.gridTemplateColumns = "none"

					icon.children[0].style.display = "block"
					icon.children[0].style.padding = "2px"
					icon.children[0].children[0].style.backgroundSize = "cover"
					icon.children[0].style.maxWidth = ""

					icon.children[1].style.display = "none"
				}
				return
			}
		}
		
	}
	function rawr(px, dem = 2.35, dpx = 44) {
		let per = px/dpx * 100
		let nem = per/100 * dem
		return nem
	}

	function stopResize() {
		document.onmouseup = null;
		document.onmousemove = null;

        console.log("Dimensions = " + w + "x" + h);
        console.log("Gcd        = " + r);
        console.log("Aspect     = " + w/r + ":" + h/r);
        console.log("Division   = " + (w/r)/(h/r));
		console.log("_________________________________________")
	}

	function gcd (a, b) {
		return (b == 0) ? a : gcd (b, a%b);
	}
}
//--------------------------------------------------------------------icon resizing|

//------------------------------------------------------------------------------------------------------folder behavior|

//unselect all folders when desktop click:--|
$(document).mousedown(function(event) { 
	var $target = $(event.target);
	if(
		!$target.closest(".icon").length && 
		$(".icon").hasClass('active') && 
		keyPressCtrl == 0
	) {
		$(".icon").removeClass('active');
		$(".icon").css("border" , '');
	}        
});
//------------------------------------------|

//selectBox behavior---------------------------------------------------------------------------------------------------|
selectBox();
function selectBox() {
	var pos1 = 0, pos2 = 0, posxIn = 0, posyIn = 0;
	
	//when desktop click------------------------------------------------|
	document.getElementById('background').onmousedown = function(event) {
		var $target = event.target;
		//if not clicking folder or window------------------------------|
		if(
			$target.id === "background"
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
			
			if (dll.areRectanglesOverlap(icon,sBox)) {
				//light up colliding folder hover border:
				icon.className += " active";
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
		}
		
		function doResize(e) {
			e = e || window.event;
			e.preventDefault();
			
			if (border == "windowErig" || border == "windowCbr" || border == "windowCtr") {
				wndw.style.width = startWidth + e.clientX - startX + "px";
			}
			if (border == "windowEbot" || border == "windowCbr" || border == "windowCbl") {
				wndw.style.height = startHeight + e.clientY - startY + "px";
			}

			if (border == "windowElef" || border == "windowCtl" || border == "windowCbl") {
				wndw.style.left = startLeft + e.clientX - startX + "px";
				wndw.style.width = startWidth + (e.clientX - startX) * -1 + "px";
			}
			if (border == "windowEtop" || border == "windowCtl" || border == "windowCtr") {
				wndw.style.top = startTop + e.clientY - startY + "px";
				wndw.style.height = startHeight + (e.clientY - startY) * -1 + "px";
			}	

			
		}
	}
//------------------------------------------------------------------window resizing|

//------------------------------------------------------------------------------------------------------window behavior|