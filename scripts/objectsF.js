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