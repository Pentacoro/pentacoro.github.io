//window dragging------------------------------------------------------------------|
function dragWndw(wndw, _this) {
	let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	
	if (_this.uiux != 0) {
		//if present, the header is where you move the window from:
		wndw.getElementsByClassName("header")[0].onmousedown = dragMouseDown;
		wndw.onmousedown = () => _this.statNode();
	} else {
		//otherwise, move the window from anywhere inside the DIV:
		wndw.onmousedown = dragMouseDown;
	}

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();

		_this.statNode();

		if (e.target.classList.contains("windowButton") == false) {
			//get initial cursor position:
			pos3 = e.clientX;
			pos4 = e.clientY;

			document.onmouseup = closeDragWindow;
			document.onmousemove = windowDrag;
			iframeAntiHover (true);
		}
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
		_this.posX = _this.posX - pos1;
		_this.posY = _this.posY - pos2;
		_this.poseNode();
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
function sizeWndw(wndw, _this) {
	let startX, startY, startWidth, startHeight, startLeft, startTop, border;

	let windowBorder = wndw.getElementsByClassName("windowBorder")[0];

	windowBorder.childNodes.forEach((border) => {
		if(
			border.classList
		) {
			border.onmousedown = initResize;
		}
	});

	function initResize(e) {
		e = e || window.event;
		e.preventDefault();

		_this.statNode();

		startX = e.clientX;
		startY = e.clientY;

		startWidth = _this.widt;
		startHeight = _this.heig;

		startLeft = _this.posX;
		startTop = _this.posY;
		
		border = e.target.classList[1];
		
		document.onmouseup = stopResize;
		document.onmousemove = doResize;
		iframeAntiHover (true);
	}
	
	function doResize(e) {
		e = e || window.event;
		e.preventDefault();

		//get int for wndw min-height and min-width css values
		let minHeight = parseInt(window.getComputedStyle(wndw,null).getPropertyValue("min-height"));
		let minWidth = parseInt(window.getComputedStyle(wndw,null).getPropertyValue("min-width"));
		
		//when sizing towards →
		if (border == "windowErig" || border == "windowCbr" || border == "windowCtr") {
			_this.widt = startWidth + e.clientX - startX;
		}
		//when sizing towards ↓
		if (border == "windowEbot" || border == "windowCbr" || border == "windowCbl") {
			_this.heig = startHeight + e.clientY - startY;
		}
		//when sizing towards ← ---------- [accounting for wndw min-width]
		if (border == "windowElef" || border == "windowCtl" || border == "windowCbl") {
			if (startLeft + e.clientX - startX < startLeft + (startWidth - minWidth)){
				_this.posX = startLeft + e.clientX - startX;
				_this.widt = startWidth + (e.clientX - startX) * -1;
			} else {
				//stuck in minimum size
				_this.posX = startLeft + (startWidth - minWidth);
				_this.widt = minWidth;
			}
		//when sizing towards ↑ ---------- [accounting for wndw min-height]
		}
		if (border == "windowEtop" || border == "windowCtl" || border == "windowCtr") {
			if (startTop + e.clientY - startY < startTop + (startHeight - minHeight)){
				_this.posY = startTop + e.clientY - startY;
				_this.heig = startHeight + (e.clientY - startY) * -1;
			} else {
				//stuck in minimum size
				_this.posY = startTop + (startHeight - minHeight);
				_this.heig = minHeight;
			}
		}

		_this.poseNode();
	}

	function stopResize() {
		document.onmouseup = null;
		document.onmousemove = null;
		iframeAntiHover (false);
	}
}
//------------------------------------------------------------------window resizing|

//----------------------------------------------------------------------------------window behavior|

function statWndwNode(elmnt, _this) {
    //if window isn't at front already
    if(
        elmnt.id != "windowNumber" + 0
    ) {
		//send to first array index
		let thisIndex = windowArray.indexOf(_this);
		windowArray.splice(thisIndex, 1)
        windowArray.unshift(_this);

		//make DOM elements's IDs and zIndex match new object arrangement
		for(wndw of document.getElementsByClassName("window")){ 
			let windowId = wndw.id.match(/(\d+)/)[0];
			let windowInt= parseInt(windowId);

			if(wndw != elmnt && windowInt < thisIndex){
				wndw.id = "windowNumber" + (windowInt + 1);
				wndw.style.zIndex = (windowInt + 1) *-1;
			}
		}
		//make this window's ID and zIndex match its object position
		elmnt.id = "windowNumber" + 0;
		elmnt.style.zIndex = 0;

		/*principle: ---------------|
		
			Let's say this is our list of window HTML elements, represented as an array whose 
		indexes stand for their ID number, as well as match their associated object's index
		within the windowArray:

			[0][1][2][3][4][5] 
			
			!this is an abstract representation of our DOM elements for explanation purposes.
			!the window class as a selector would return an array that would always order the
			window elements from oldest to newest, which for this principle turns out useless.

			The window at 0 will always be the one at the front, manifested through a zIndex of 0 
		while all others have a zIndex equal to their index's negation.

			Let's say we clicked the window number 3, so we'd want that window to be at the front;
		the following would happen:

			 ┏━►┓━►┓━►┓            =0 +1 +1 +1                     
			[0][1][2][3][4][5] => [3][0][1][2][4][5] => [0][1][2][3][4][5]
			 ┗◄━━━━━━━┛

			The third window's ID would be set to 0, while every window that was in front of it 
		would sum +1 to theirs, and every window that was behind it would be unchanged.

			The benefit of this rotation is to keep our Z dimension clean and better administrate
		its range. It's also a good way to pack everything related to windows nicely together:
		the array, the objects, their associated HTML element and their Z position.
	
		|---------------  principle*/
    }
}

function poseWndwNode(elmnt, _this) {
    elmnt.style.top = _this.posY + "px";
    elmnt.style.left = _this.posX + "px";

	elmnt.style.height = _this.heig + "px";
	elmnt.style.width = _this.widt + "px";
}

function crteWndwNode(_this) {
    let newWindow = document.createElement("div");
    newWindow.setAttribute("class", "window "+_this.task);
    newWindow.setAttribute("style", "left:"+_this.posX+"px;top:"+_this.posY+"px;width:"+_this.widt+"px;height:"+_this.heig+"px;z-index: 0;");
	newWindow.setAttribute("id", "windowNumber" + windowArray.indexOf(_this));

    let newWindowInner = document.createElement("div");
    newWindowInner.setAttribute("class", "windowInner");
    newWindow.appendChild(newWindowInner);

		let newHeader = document.createElement("div");
		newHeader.setAttribute("class", "header");
		newWindowInner.appendChild(newHeader);

			let newWindowText = document.createElement("span");
			newWindowText.setAttribute("class", "windowName");
			let newWindowTextNode = document.createTextNode(_this.name);
			newWindowText.appendChild(newWindowTextNode);
			newHeader.appendChild(newWindowText);

			if (_this.uiux > 1){
				let newWindow_ = document.createElement("span");
				newWindow_.setAttribute("class", "windowButton _");
				newHeader.appendChild(newWindow_);
			}
			if (_this.uiux > 2){
				let newWindowO = document.createElement("span");
				newWindowO.setAttribute("class", "windowButton O");
				newHeader.appendChild(newWindowO);
			}
			if (_this.uiux > 0){
				let newWindowX = document.createElement("span");
				newWindowX.setAttribute("class", "windowButton X");
				newHeader.appendChild(newWindowX);
			}
			switch (_this.uiux){
				case 0:
					newHeader.style.gridTemplateColumns = "";
					break;
				case 1:
					newHeader.style.gridTemplateColumns = "auto 36px";
					break;
				case 2:
					newHeader.style.gridTemplateColumns = "auto 36px 36px";
					break;
				case 3:
					newHeader.style.gridTemplateColumns = "auto 36px 36px 36px";
					break;
			}

		let newContent = document.createElement("div");
		newContent.setAttribute("class", "content");
		newWindowInner.appendChild(newContent);

	let newWindowBorder = document.createElement("div");
	newWindowBorder.setAttribute("class", "windowBorder");
	newWindow.appendChild(newWindowBorder);

		if (_this.resi == true) {
			let newWindowEtop = document.createElement("div");
			newWindowEtop.setAttribute("class", "windowEdge windowEtop");
			let newWindowEbot = document.createElement("div");
			newWindowEbot.setAttribute("class", "windowEdge windowEbot");
			let newWindowElef = document.createElement("div");
			newWindowElef.setAttribute("class", "windowEdge windowElef");
			let newWindowErig = document.createElement("div");
			newWindowErig.setAttribute("class", "windowEdge windowErig");
			let newWindowCtl = document.createElement("div");
			newWindowCtl.setAttribute("class", "windowCorner windowCtl");
			let newWindowCtr = document.createElement("div");
			newWindowCtr.setAttribute("class", "windowCorner windowCtr");
			let newWindowCbr = document.createElement("div");
			newWindowCbr.setAttribute("class", "windowCorner windowCbr");
			let newWindowCbl = document.createElement("div");
			newWindowCbl.setAttribute("class", "windowCorner windowCbl");
			newWindowBorder.appendChild(newWindowEtop);
			newWindowBorder.appendChild(newWindowEbot);
			newWindowBorder.appendChild(newWindowElef);
			newWindowBorder.appendChild(newWindowErig);
			newWindowBorder.appendChild(newWindowCtl);
			newWindowBorder.appendChild(newWindowCtr);
			newWindowBorder.appendChild(newWindowCbr);
			newWindowBorder.appendChild(newWindowCbl);
		}


    document.getElementById("windowLayer").appendChild(newWindow);

	let diffW = (newWindow.offsetWidth - newWindow.firstChild.children[1].offsetWidth);
	let diffH = (newWindow.offsetHeight - newWindow.firstChild.children[1].offsetHeight);
	_this.widt += diffW;
	_this.heig += diffH;
	_this.minW += diffW;
	_this.minH += diffH;

	for (i = 0; i < document.getElementsByClassName("windowButton").length; i++){
		let windowButton = document.getElementsByClassName("windowButton")[i];
		windowButton.onmousedown = () => {windowButtonClick(windowButton)};
	}
	function windowButtonClick(button){
		button.classList.add("mousedown");
		window.onmouseup = () => {
			button.classList.remove("mousedown");
			window.onmouseup = null;
		}
		switch (button.classList[1]) {
			case "_": console.log("_"); break;
			case "O": console.log("O"); break;
			case "X": console.log("X"); break;
		}
	}

    _this.statNode();
    _this.poseNode();
    _this.drag();
	_this.size();
    /*_this.menu();*/
}

function dlteWndwNode(_this) {
	//delete window
	let thisIndex = windowArray.indexOf(_this);
	windowArray.splice(thisIndex, 1);

	let delWindow = document.getElementById("windowNumber" + thisIndex);
	delWindow.parentNode.removeChild(delWindow);

	//make DOM elements's IDs and zIndex match new object arrangement
	for(wndw of document.getElementsByClassName("window")){ 
		let windowId = wndw.id.match(/(\d+)/)[0];
		let windowInt= parseInt(windowId);
		
		if(windowInt > thisIndex){
			wndw.id = "windowNumber" + (windowInt - 1);
			wndw.style.zIndex = (windowInt - 1) *-1;
		}
	}
}

//------------------------------------------------------------------------icon behavior|

/*
<div class="window explorerExe">
	<div class="windowInner">
		<div class="header"><span class="windowName">Explorer ONE</span>
			<span class="windowButton _">_</span><span class="windowButton O">O</span><span class="windowButton X"></span>
		</div>
		<div class="content">
			<h1 style="text-align: center; padding: .5em">Lorem Ipsum Dolor</h1>
			<p style="text-align: center; padding: .5em">Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae dicta esse sapiente veritatis nostrum molestiae perferendis dolorum quasi magnam voluptatibus fugit itaque inventore rerum iste repellat, a tenetur numquam quisquam quibusdam nam, libero atque dolores provident corrupti. Itaque iusto temporibus porro eum nostrum. Id molestiae laboriosam odio voluptatum fugiat a.</p>
			<p style="text-align: center; padding: .5em">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Odit blanditiis sed consequatur dolor iusto assumenda ipsam recusandae sapiente esse provident ab hic nulla quae suscipit quia enim quo perferendis aperiam, qui ipsum velit? Ea dolor nam, vel deserunt distinctio, similique voluptatem ipsa sequi dolorem magnam rerum et harum, odit laboriosam!</p>
			<p style="text-align: center; padding: .5em">Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis praesentium sit eveniet accusantium culpa quos magni corrupti alias nulla! Mollitia maiores velit dolorem veritatis cumque reiciendis facilis illo ad, similique obcaecati? Iusto quis, amet sequi non doloremque, consequatur eos porro obcaecati quo magnam ratione ipsum tempore modi! Enim, nisi voluptates.</p>
		</div>
	</div>
	<div class="windowBorder">
		<div class="windowEdge windowEtop"></div>
		<div class="windowEdge windowEbot"></div>
		<div class="windowEdge windowElef"></div>
		<div class="windowEdge windowErig"></div>
		<div class="windowCorner windowCtl"></div>
		<div class="windowCorner windowCtr"></div>
		<div class="windowCorner windowCbr"></div>
		<div class="windowCorner windowCbl"></div>
	</div>
</div>
*/