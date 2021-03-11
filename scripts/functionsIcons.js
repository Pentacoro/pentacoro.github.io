var iconGridArray = [];
evaluateIconGrid();
function evaluateIconGrid(e = null, w = null, h = null, wm = null, hm = null, autowm = null, autohm = null){
    //take existing config values if null arguments
    if (w == null) {w = cfg.deskGrid.width };
    if (h == null) {h = cfg.deskGrid.height};
    if (wm == null) {wm = cfg.deskGrid.hMargin};
    if (hm == null) {hm = cfg.deskGrid.vMargin};
    if (autowm == null) {autowm = cfg.deskGrid.autoHmargin};
    if (autohm == null) {autohm = cfg.deskGrid.autoVmargin};

    //get some useful booleans
    let wChanged = cfg.deskGrid.width  == w;
    let hChanged = cfg.deskGrid.height == h;
    let wmChanged = cfg.deskGrid.hMargin == wm;
    let hmChanged = cfg.deskGrid.vMargin == hm;

    //set new values to config
    cfg.deskGrid.width  = w;
    cfg.deskGrid.height = h;
    cfg.deskGrid.hMargin = wm;
    cfg.deskGrid.vMargin = hm;
    cfg.deskGrid.autoHmargin = autowm;
    cfg.deskGrid.autoVmargin = autohm; 
    
    let windowW = idBackground.offsetWidth;
    let windowH = idBackground.offsetHeight - cfg.deskNavB.height;
    
    //number of icons that can fit in a row / column
    let gridHorizontal = Math.round((windowW-(w+wm*2)/2)/(w+wm));
    let gridVertical = Math.round((windowH-(h+hm*2)/2)/(h+hm));

    //evaluate optimal margin if enabled
    if (autowm === true){
        ewm = Math.round(windowW - w * gridHorizontal) / (gridHorizontal+1);
        cfg.deskGrid.modHmargin = ewm;
    } else {
        ewm = wm;
        cfg.deskGrid.modHmargin = 0
    }
    if (autohm === true){
        ehm = Math.round(windowH - h * gridVertical) / (gridVertical+1);
        cfg.deskGrid.modVmargin = ehm;
    } else {
        ehm = hm
        cfg.deskGrid.modVmargin = 0
    }

    //get first array and HTML elements if not made yet
    if(iconGridArray.length === 0) {
        iconGridArray = new Array(gridHorizontal);
        for (var i = 0; i < iconGridArray.length; i++) {
            iconGridArray[i] = new Array(gridVertical);
        }
    
        //fill each coordinate with an object
        for (x = 0; x < iconGridArray.length; x++){
            for(y = 0; y < iconGridArray[x].length; y++){
                iconGridArray[x][y] = {
                    posX:(x+1) * ewm + x * w,
                    posY:(y+1) * ehm + y * h,
                    widt: w, heig: h, id: "id" + x + "-" + y
                }
                createGridNode(iconGridArray[x][y]);
            }
        }
    }
    //if array lengths change
    if(gridHorizontal != iconGridArray.length || gridVertical != iconGridArray[0].length) {

        cfg.deskGrid.hLength = gridHorizontal; 
        cfg.deskGrid.vLength = gridVertical;

        let gridHdiff = gridHorizontal - iconGridArray.length;
        let gridVdiff = gridVertical - iconGridArray[0].length;

        //if shorter row
        if (gridHdiff < 0){
            let delColumns = iconGridArray.splice(gridHorizontal, gridHdiff*-1)
            delColumns.forEach(column => {
                column.forEach(object => {
                    let objectNode = document.getElementById(object.id); 
                    objectNode.parentElement.removeChild(objectNode);
                })
            })
        }
        //if longer row
        if (gridHdiff > 0){
            for (x = iconGridArray.length; x < gridHorizontal; x++){
                iconGridArray.push(new Array(gridVertical));
                for(y = 0; y < iconGridArray[x].length; y++){
                    iconGridArray[x][y] = {
                        posX:(x+1) * ewm + x * w,
                        posY:(y+1) * ehm + y * h,
                        widt: w, heig: h, id: "id" + x + "-" + y
                    }
                    createGridNode(iconGridArray[x][y]);
                }
            }
        }
        //if shorter column 
        if (gridVdiff < 0){
            iconGridArray.forEach(column => {
                let delRows = column.splice(gridVertical, gridVdiff*-1)
                delRows.forEach(object =>{
                    let objectNode = document.getElementById(object.id); 
                    objectNode.parentElement.removeChild(objectNode);
                })
            })
        }
        //if longer column
        if (gridVdiff > 0){
            for (x = 0; x < iconGridArray.length; x++){
                for(y = iconGridArray[x].length; y < gridVertical; y++){
                    iconGridArray[x].push({
                        posX:(x+1) * ewm + x * w,
                        posY:(y+1) * ehm + y * h,
                        widt: w, heig: h, id: "id" + x + "-" + y
                    })
                    createGridNode(iconGridArray[x][y]);
                }
            }
        }
    }
    //if updating object is necessary
    if(wChanged || hChanged || wmChanged || hmChanged || autowm === true || autohm === true) {
        for (x = 0; x < iconGridArray.length; x++){
            for(y = 0; y < iconGridArray[x].length; y++){
                iconGridArray[x][y] = {
                    posX:(x+1) * ewm + x * w,
                    posY:(y+1) * ehm + y * h,
                    widt: w, heig: h, id: "id" + x + "-" + y
                }
                updateGridNode(iconGridArray[x][y]);
            }
        }
    }
    //graph array elements on the DOM
    function createGridNode(object) {
        let newGrid = document.createElement("div");
        newGrid.setAttribute("id", object.id);
        newGrid.setAttribute("class", "gridElement");
        newGrid.style.left = object.posX + "px";
        newGrid.style.top = object.posY + "px";
        newGrid.style.width = object.widt + "px";
        newGrid.style.height = object.heig + "px";

        newGrid.style.position = "absolute";
        newGrid.style.zIndex = "-980";
        newGrid.style.pointerEvents = "none";

        newGrid.style.backgroundColor = "rgba(127,127,127,0.5)";
        newGrid.style.borderRadius = cfg.deskGrid.borderRadius + "px";

        document.getElementById("gridLayer").appendChild(newGrid);
    }
    function updateGridNode(object) {
        let updGrid = document.getElementById(object.id);
        updGrid.style.left = object.posX + "px";
        updGrid.style.top = object.posY + "px";
        updGrid.style.width = object.widt + "px";
        updGrid.style.height = object.heig + "px";
    }
}

function turnOn_deskGrid_realTimeEvaluation(){
    evaluateIconGrid();
    window.onresize = evaluateIconGrid;
}
function turnOff_deskGrid_realTimeEvaluation(){
    window.onresize = null;
}

//icon behavior------------------------------------------------------------------------|
var shouldSelect = true;

var dragging = false;

function dragIcon(elmnt, _this) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	
	elmnt.onmousedown = dragMouseDown;	

	function dragMouseDown(e) {
		e = e || window.event;
        e.preventDefault();

        if(e.button == 0) 
		
		//get initial cursor position:
		pos3 = e.clientX;
		pos4 = e.clientY;
		
		//when mousedown on selected icon
		if (_this.stat == 1) {
			//managing selected icons
			for (var i = 0; i < classActive.length; i++) {
				//light up all hover border onmousedown:-|
				highlight(classActive[i]);
				//---------------------------------------|
			}
		} else {
            if (shouldSelect == true) {
                //light up 1 hover border onmousedown:
                highlight(elmnt);
                elmnt.style.backgroundColor = 'rgb(0,0,0,0)';
                
                //when mousedown on unselected icon
                if(keyPressCtrl == false && dragging == false) {
                    for (i = iconArray.length - 1; i >= 0; i--){
                        iconArray[i].stat = 0;
                        iconArray[i].statNode();
                    }
                    _this.stat = 1;
                    highlight(elmnt);
                } else if(keyPressCtrl == true) {
                    _this.stat = 1;
                    highlight(elmnt);
                }
            }
		}
		
        document.onmouseup = closeDragIcon;
		if(e.button == 0) {document.onmousemove = iconDrag}
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
		
        dragging = true;
		
		//managing selected icons
		for (i = iconArray.length - 1; i >= 0; i--){
            if (iconArray[i].stat == 1 || iconArray[i].stat == 2) {
                //set position for selected icons:------------|
                iconArray[i].posY = (iconArray[i].posY - pos2);
                iconArray[i].posX = (iconArray[i].posX - pos1);
                //--------------------------------------------|
                
                iconArray[i].stat = 2;
                iconArray[i].poseNode();
                iconArray[i].statNode();
            }
		}
	}

	function closeDragIcon(e) {	
		//stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
        iframeAntiHover (false);

        let w = cfg.deskGrid.width; let h = cfg.deskGrid.height; let wm = cfg.deskGrid.hMargin; let hm = cfg.deskGrid.vMargin;
		
		//managing selected icons
		for (i = iconArray.length - 1; i >= 0; i--){
            if (iconGrid == true && iconArray[i].stat == 2) {
			    //set position grid for selected icons:----------------------------------|
				iconArray[i].posY = (Math.round((iconArray[i].posY - hm)/(h + hm))*(h + hm) + hm);
				iconArray[i].posX = (Math.round((iconArray[i].posX - wm)/(w + wm))*(w + wm) + wm);
                //-----------------------------------------------------------------------|

                iconArray[i].stat = 1;
                iconArray[i].poseNode();
                iconArray[i].statNode();
            }
		}
		
		//unselect other folders on mouseup W/O drag UNLESS ctrl
		if(keyPressCtrl == false && dragging == false && e.button == 0) {
			for (i = iconArray.length - 1; i >= 0; i--){
                iconArray[i].stat = 0;
                iconArray[i].statNode();
            }
            _this.stat = 1;
            _this.statNode();
        } else {
            for (i = iconArray.length - 1; i >= 0; i--){
                lowlight(document.getElementById(iconArray[i].text));
            }

            _this.stat = 1;
            _this.statNode();
        }
        
		dragging = false;
	}
}

function menuIcon(elmnt, _this) {

    elmnt.oncontextmenu = iconMenu;

    function iconMenu(e) {
        e.preventDefault();

        if(
            e.target.classList.contains("icon") ||
            e.target.parentNode.classList.contains("icon")
        ) {
            closeMenu();

            idCtextMenu.style.display = "grid";
            idCtextMenu.style.top = e.clientY + "px";
            idCtextMenu.style.left = e.clientX + "px";

            idDesktMenu.blur();
            idCtextMenu.blur();
            clearSelection();
            
            iconMenuOpen(elmnt, _this);

            return false;
        }
    }
}

function statIconNode(elmnt, _this) {
    //0 => unselected | 1 => selected | 2 => moving
    switch(_this.stat){
        case 0:
            elmnt.classList.remove("active");
            elmnt.style.border = '';
            elmnt.style.zIndex = '';
            break;
        case 1:
            if(!elmnt.classList.contains("active")){elmnt.className += " active"};
            elmnt.style.opacity = '1';
			elmnt.style.zIndex = '';
			elmnt.style.border = '';
			elmnt.style.backgroundColor = '';
            break;
        case 2: 
            elmnt.style.opacity = '0.5';
            elmnt.style.zIndex = '1000';
            elmnt.style.border = '3px solid rgb(0,0,0,0.0)';
            elmnt.style.backgroundColor = 'rgb(0,0,0,0)';
            break;
        default: 
    }
}

function poseIconNode(elmnt, _this) {
    elmnt.style.top = _this.posY + "px";
    elmnt.style.left = _this.posX + "px";
}

function crteIconNode(_this) {
    //Icon HTML structure-----|
    let newIcon = document.createElement("div");
    newIcon.setAttribute("class", "icon");
    newIcon.setAttribute("id", _this.text);
    newIcon.setAttribute("style", "left:"+_this.posX+"px;top:"+_this.posY+"px;");

    let newIconImage = document.createElement("div");
    newIconImage.setAttribute("class", "iconImage");
    newIconImage.setAttribute("style", _this.imag);
    newIcon.appendChild(newIconImage);

    let newIconText = document.createElement("h3");
    let newIconTextNode = document.createTextNode(_this.text);
    newIconText.appendChild(newIconTextNode);
    newIcon.appendChild(newIconText);

    document.getElementById("iconLayer").appendChild(newIcon);
    //------------------------|

    _this.statNode();
    _this.poseNode();
    _this.drag();
    _this.menu();
}

function dlteIconNode(_this) {
    let delIcon = document.getElementById(_this.text);
    delIcon.parentNode.removeChild(delIcon);
    for (i = iconArray.length - 1; i >= 0; i--){
        if (iconArray[i].text == _this.text) {
            iconArray.splice(i, 1);
        }
    }
}

function deleteSelectedNodes(){
    let iconsToDelete = iconArray.filter((icon) => {return icon.stat == 1})
    for(icon of iconsToDelete){
        if(icon.stat == 1){
            icon.deleteNode();
        }
    }
}

//------------------------------------------------------------------------icon behavior|

/*
<div class="icon" id="Folder 1" style="left: 10px;top: 10px;">
	<div class="iconImage" style="background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');"></div>
	<h3>Folder 1</h3>
</div>
*/