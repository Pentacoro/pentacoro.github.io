// JavaScript Document

	//deactivate other folders:
	var folderCl = document.getElementsByClassName("folder");
	for (var i = 0; i < folderCl.length; i++) {
		
		var current = document.getElementsByClassName("active");
			if (current.length > 0) {
			current[0].className = current[0].className.replace(" active", "");
		}
	}
	//------------------------

	for (var i = 0; i < classActive.length; i++) {
		//set position for selected folders:----------------------------------

		//--------------------------------------------------------------------
			
		//make folders solid when stopped-------------------------------------

		//--------------------------------------------------------------------
	}
	/*
	var right = document.createElement("div");
	right.className = "windowBorder";
	right.id = "windowRight";
	wndw.appendChild(right);

	var bottom = document.createElement("div");
	bottom.className = "windowBorder";
	bottom.id = "windowBottom";
	wndw.appendChild(bottom);

	var br = document.createElement("div");
	br.className = "windowBorder";
	br.id = "windowBr";
	wndw.appendChild(br);
	*/