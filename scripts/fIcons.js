//javascript.js
//f.js
//fPocket.js

class Icon {
    constructor(image, name, program = null, state = 0, x = 0, y = 0){
        this.stat = state
        this.coor = {px: x, py: y, tx: x, ty: y, ax: null, ay: null}

        this.file = {}
        this.imag = image
        this.text = name
        this.apps = program

        this.drop = []
    }
    createNode(){
        crteIconNode(this)
    }
    deleteNode(){
        dlteIconNode(this)
    }
    statNode(num){
        statIconNode(this.node, this, num)
    }
    poseNode(){
        poseIconNode(this.node, this)
    }
    drag(){
        dragIcon(this.node, this)
    }
    menu(){
        menuIcon(this.node, this)
    }
}

//icon behavior------------------------------------------------------------------------|
var shouldSelect = true

var dragging = false

function highlight(hIcon) {
    hIcon.classList.add("highlight")
} 
function lowlight(hIcon) {
    hIcon.classList.remove("highlight")
} 

function dragIcon(node, _this) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
	
	node.onmousedown = dragMouseDown

	function dragMouseDown(e) {
		e = e || window.event
        e.preventDefault()

        if(e.button == 0) {}
		
		//get initial cursor position:
		pos3 = e.clientX
		pos4 = e.clientY
		
		//when mousedown on selected icon
		if (_this.stat == 1) {
			//managing selected icons
			for (icon of desktop.pocket) {
				//light up all hover border onmousedown:-|
				highlight(icon.node)
				//---------------------------------------|
			}
		} else {
            if (shouldSelect == true && !dragging) {
                //light up 1 hover border onmousedown:
                highlight(node)
                node.style.backgroundColor = 'rgb(0,0,0,0)'
                
                //when mousedown on unselected icon
                if(!keyPressCtrl) {
                    for (icon of desktop.pocket){
                        desktop.pocket = desktop.pocket.remove(icon)
                        icon.statNode(0)
                    }
                    desktop.pocket.push(_this)
                    _this.stat = 1
                    highlight(node)
                } else if(keyPressCtrl) {
                    desktop.pocket.push(_this)
                    _this.stat = 1
                    highlight(node)
                }
            }
		}

        if(cfg.sound.icons && !dragging) {
            sys.audiArr[0].volume = 0.5
            sys.audiArr[0].play()
        }
		
        document.onmouseup = closeDragIcon
		if(e.button == 0) document.onmousemove = iconDrag
		iframeAntiHover (true)
	}								 

	function iconDrag(e) {
		e = e || window.event
        e.preventDefault()
		
		//calculate new cursor position:
		pos1 = pos3 - e.clientX
		pos2 = pos4 - e.clientY
		pos3 = e.clientX
		pos4 = e.clientY

        dragging = true
        
		
		//managing selected icons
		for (icon of desktop.pocket){
            //godGrasp layer
            document.getElementById("godGrasp").appendChild(icon.node)
            //set position for selected icons:------------|
            icon.coor.tx = (icon.coor.tx - pos1)
            icon.coor.ty = (icon.coor.ty - pos2)
            iconGridArray[icon.coor.ax][icon.coor.ay].used = false
            iconGridArray[icon.coor.ax][icon.coor.ay].icon = null
            //--------------------------------------------|
            
            icon.statNode(2)
            icon.poseNode()
		}
	}

	function closeDragIcon(e) {	
		//stop moving when mouse button is released:
		document.onmouseup = null
		document.onmousemove = null
        iframeAntiHover (false)
		
        let iconsToValidate = []

		//send all icons to position evaluation
		for (icon of desktop.pocket){
            if (cfg.desk.grid.enabled && icon.stat == 2) {
			    iconsToValidate.push(icon)
            }
		}
        repositionIcons(iconsToValidate, true, true)

        //update HTML of icons after evaluation
        for (icon of desktop.pocket){
            icon.poseNode()
            icon.statNode(1)
        }
		
		//unselect other folders on mouseup W/O drag UNLESS ctrl
		if(keyPressCtrl == false && dragging == false && e.button == 0) {
			for (icon of desktop.pocket){
                if (icon != _this) desktop.pocket = desktop.pocket.remove(icon)
                icon.statNode(0)
                lowlight(icon.node)
            }
            _this.statNode(1)
        } else {
            for (icon of desktop.pocket){
                lowlight(icon.node)
            }
            _this.statNode(1)
        }
        
		dragging = false
	}
}

function menuIcon(node, _this) {

    node.oncontextmenu = e => openMenu(e,_this)
}

function statIconNode(node, _this, num) {
    //0 => unselected | 1 => selected | 2 => moving
    _this.stat = (num != undefined) ? num : _this.stat

    switch(_this.stat){
        case 0:
            node.classList.remove("active")
            node.classList.remove("moving")
            node.style.backgroundColor = ''

            //back to icon layer
            document.getElementById("iconLayer").appendChild(node)
            break
        case 1:
            if(!node.classList.contains("active")) node.className += " active"
            node.classList.remove("moving")
			node.style.backgroundColor = ''

            //back to icon layer
            document.getElementById("iconLayer").appendChild(node)
            break
        case 2: 
            if(!node.classList.contains("moving")) node.className += " moving"

            //godGrasp layer
            document.getElementById("godGrasp").appendChild(node)
            break
        default: 
    }
}

function poseIconNode(node, _this) {
    node.style.left = _this.coor.tx + "px";
    node.style.top = _this.coor.ty + "px";
    node.style.width = cfg.desk.grid.width + "px";
    node.style.height = cfg.desk.grid.height + "px";

    function rawr(px, dem = 2.35, dpx = 44) {
		let per = px/dpx * 100
		let nem = per/100 * dem
		return nem
	}
    function stylize(node, styleName = "style1") {
        let styleClass
        for (className of node.classList) {
            if (className.match(/style(\d+)/)) {
                styleClass = className.match(/style(\d+)/)[0]
                node.classList.remove(styleClass)
            }
        }
        node.classList.add(styleName)
        node.children[1].style.fontSize = ""
        node.style.gridTemplateColumns = ""
    }
    function isBetween(a, b, c) {
        if (a >= b && a <= c) return true
        return false
    }
    function gcd (a, b) {
		return (b == 0) ? a : gcd (b, a%b);
	}

    //_______________________
    w = node.offsetWidth
    h = node.offsetHeight
    r = gcd (w, h)
    //_______________________


    let dim = [w,h]
    let gdc = r
    let asp = [w/r,h/r]
    let div = (w/r)/(h/r)

    let sSize = 1
    let mSize = 1.17
    let bSize = 1.40

    responsiveIcon(node)

    function responsiveIcon(node) {
        if (isBetween(w, 1, 50) || isBetween(h, 1, 50)) {
            if (isBetween(div, 0.5, 1.5)) {
                stylize(node, "style1")
            }
            if (div < 0.5) {
                stylize(node, "style2")
            }
            if (div > 1.5) {
                stylize(node, "style3")
                node.children[1].style.fontSize = (h === 50) ? "" : rawr(node.children[1].offsetHeight, 2.35, 44) + "em"
            }
            if (div > 3.5) {
                stylize(node, "style4")
                node.style.gridTemplateColumns = node.children[0].offsetHeight + "px auto"
                node.children[1].style.fontSize = (h === 50) ? "" : rawr(node.children[1].offsetHeight, 2.35, 44) + "em"
            }
            return
        }
        if (isBetween(w, 51, 90) || isBetween(h, 51, 90)) {
            if (isBetween(div, 0.5, 2.5)) {
                stylize(node, "style5")
            }
            if (div < 0.5) {
                stylize(node, "style2")
            }
            if (div > 2.5) {
                stylize(node, "style4")
                node.style.gridTemplateColumns = node.children[0].offsetHeight + "px auto"
                node.children[1].style.fontSize = rawr(node.children[1].offsetHeight, 1.2, 44) + "em"
            }
            if (div > 6) {
                stylize(node, "style2")
            }
            return
        }
        if (isBetween(w, 91, 200) || isBetween(h, 91, 200)) {
            if (isBetween(div, 0.5, 1.5)) {
                stylize(node, "style6")
            }
            if (div < 0.5 || div > 1.5) {
                stylize(node, "style2")
            }
            return
        }
        if (w > 200 || h > 200) {
            if (isBetween(div, 0.5, 1.5)) {
                stylize(node, "style7")
                node.children[1].style.fontSize = rawr(node.children[1].offsetHeight, 1.2, 44) + "em"
            }
            if (div < 0.5 || div > 1.5) {
                stylize(node, "style2")
            }
            return
        }
    }
}

function crteIconNode(_this) {
    //Icon HTML structure-----|
    let newIcon = document.createElement("div")
    newIcon.setAttribute("class", "icon")
    newIcon.setAttribute("id", "Icon: "+_this.text)
    newIcon.setAttribute("style",   "left:"+_this.coor.px+"px;"+
                                    "top:"+_this.coor.py+"px;"+
                                    "width:"+cfg.desk.grid.width+"px;"+
                                    "height:"+cfg.desk.grid.height+"px;")

    let newIconImage = document.createElement("div")
    let newIconFrame = document.createElement("div")
    newIconImage.setAttribute("class", "iconImage")
    newIconImage.setAttribute("style", _this.imag)
    newIconFrame.setAttribute("class", "iconFrame")
    
    newIconFrame.appendChild(newIconImage)
    newIcon.appendChild(newIconFrame)

    let newIconText = document.createElement("h3")
    let newIconTextNode = document.createTextNode(_this.text)
    newIconText.appendChild(newIconTextNode)
    newIcon.appendChild(newIconText)

    document.getElementById("iconLayer").appendChild(newIcon)
    //------------------------|

    _this.node = document.getElementById("Icon: "+_this.text)

    _this.statNode()
    _this.poseNode()
    _this.drag()
    _this.menu()
}

function dlteIconNode(_this, fromGrid = false) {
    let delIcon = document.getElementById("Icon: "+_this.text);
    delIcon.parentNode.removeChild(delIcon);
    
    if (fromGrid == false) {
        iconGridArray[_this.coor.ax][_this.coor.ay].used = false;
        iconGridArray[_this.coor.ax][_this.coor.ay].icon = null;
    }
    desktop.memory.iconArray = desktop.memory.iconArray.remove(_this)
    desktop.pocket = desktop.pocket.remove(_this)
}

function repositionIcons(icons, mustSet = false, hasPrev = true){
    let w = cfg.desk.grid.width
    let h = cfg.desk.grid.height
    let wm = (cfg.desk.grid.modHmargin == 0) ? cfg.desk.grid.hMargin : cfg.desk.grid.modHmargin
    let hm = (cfg.desk.grid.modVmargin == 0) ? cfg.desk.grid.vMargin : cfg.desk.grid.modVmargin

    let invalidIcons = []
    let iconAmount   = icons.length

    for(icon of icons) validateIconPosition(icon)

    function validateIconPosition(icon){
        let coords = icon.coor
    
        //find closest grid for its tPos
        x = Math.round((coords.tx - wm)/(w + wm))*(w + wm) + wm
        y = Math.round((coords.ty - hm)/(h + hm))*(h + hm) + hm
        
        //get its spot in grid array
        tx = Math.round((x - wm)/(w + wm))
        ty = Math.round((y - hm)/(h + hm))
    
        if(gridAvailable(tx, ty)) {
            //if object exists and is not used (valid position)
            let newGrid = iconGridArray[tx][ty]
    
            if(mustSet) {
                newGrid.used = true
                newGrid.icon = icon
    
                coords.px = newGrid.posX
                coords.py = newGrid.posY
                coords.tx = newGrid.posX
                coords.ty = newGrid.posY
                coords.ax = tx
                coords.ay = ty
            }
        } else {
            //if the position is invalid
            invalidIcons.push(icon)
        }
    }

    for(icon of invalidIcons) reintegrateInvalidIcon(icon)

    function reintegrateInvalidIcon(icon){
        let coords = icon.coor;
    
        //get previous position in grid array
        px = Math.round((coords.px - wm)/(w + wm))
        py = Math.round((coords.py - hm)/(h + hm))

        let oldGrid = {used: true}

        if (iconGridArray[px]) {
             if(iconGridArray[px][py]) {
                oldGrid = iconGridArray[px][py]
            }
        }

        if(mustSet && hasPrev && !oldGrid.used){
            oldGrid.used = true
            oldGrid.icon = icon
            coords.tx = coords.px
            coords.ty = coords.py
            coords.ax = px
            coords.ay = py
        }else if(mustSet){
            newGrid = orderIconPosition()
            newGrid[0].used = true
            newGrid[0].icon = icon
            coords.px = newGrid[0].posX
            coords.py = newGrid[0].posY
            coords.tx = newGrid[0].posX
            coords.ty = newGrid[0].posY
            coords.ax = newGrid[1]
            coords.ay = newGrid[2]
        }
    }

    if(cfg.sound.icons && dragging) {
        if(invalidIcons.length == iconAmount) {
            sys.audiArr[1].play()
        } else if (invalidIcons.length == 0) {
            sys.audiArr[2].play()
        } else {
            sys.audiArr[3].play()
        }
    }
}

function orderIconPosition(){
    for (x = 0; x < iconGridArray.length; x++){
        for(y = 0; y < iconGridArray[x].length; y++){
            if (iconGridArray[x][y].used == false){
                return [iconGridArray[x][y],x,y];
            }
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