import {plexos} from "/plexos/ini/system.js"
import {nodeGetters, iframeAntiHover} from "/plexos/lib/functions/dll.js"
import Task from "../system/task.js"
import File from "../filesystem/file.js"

let System = plexos.System
let Manager= Task.get("Window Manager")

export default class Window {
	static AppParameters = class {
		constructor(p) {
			this.sizeDrawMethod = p?.sizeDrawMethod || "default"
			// "default"     => same as "content"
			// "content"     => apply size parameters bound to content
			// "window"      => apply size parameters bound to window
			// "fit-content" => window size determined by content html (nullifies initialSize)

			this.initialDrawSize = p?.initialDrawSize || "default"
			// [ W , H ]     => specify initial width and height (nullifies initialAspectRatio)
			// "default"     => same as "mid"
			// "very-tiny"   => 1:6 of desktop size
			// "tiny"        => 1:4 of desktop size
			// "mid"         => 1:3 of desktop size
			// "big"         => 1:2 of desktop size
			// "very-big"    => 75% of desktop size
			// "maximized"   => launch maximized, with "very-big", "container" and "center" size, ratio and position parameters

			this.initialAspectRatio = p?.initialAspectRatio || "default"
			// W/H           => specify initial width and height aspect ratios
			// "default"     => 4:3 aspect ratio ( 4/3 )
			// "container"   => same aspect ratio as desktop

			this.initialDrawPosition = p?.initialDrawPosition || "default"
			// [ X , Y ]     => specify initial left and top positions
			// "default"     => same as "event"
			// "event"       => draw window below and to the right of event trigger
			// "center"      => perfectly centered

			this.saveDrawParameters = p?.saveDrawParameters || "disabled"
			// "default"     => same as "app"
			// "app"         => retrieve draw parameters from last closed app instance
			// "file"        => retrieve draw parameters specific to each file opened in app instance (requires filePath)
			// "disabled"    => parameters are never saved to registry/always defined by initial parameters

			if (p?.filePath!==undefined) this.filePath = p.filePath

			this.minimizeable = ((p?.minimizeable!==undefined) ? p?.minimizeable : true)
			this.maximizeable = ((p?.maximizeable!==undefined) ? p?.maximizeable : true)
			this.resizeable = ((p?.resizeable!==undefined) ? p?.resizeable : true)
			this.buttons = p?.buttons || []
			this.minW = p?.minW || 180
			this.minH = p?.minH || 100
		}
	}
	static maximize(window) {
		if (window.drawParams.maximized) {
			window.drawParams.maximized = false
			window.poseNode()
			Task.id(window.task).off("viewport-resize", () => {
				window.poseNode()
			})
		} else {
			window.drawParams.maximized = true
			window.poseNode()
			Task.id(window.task).on("viewport-resize", () => {
				window.poseNode()
			})
		}
	}

	static close(window) {
		if (window.appParams.saveDrawParameters !== "disabled") Manager.setInitialDrawParams(window)
		Task.id(window.task).end()
	}
	defineSize() {
		let calculateWindowSize = function(containerWidth, containerHeight, sizeRatio, aspectRatio) {
			// Calculate the target area for the window based on the size ratio
			const targetArea = containerWidth * containerHeight * sizeRatio
		
			// Calculate the width and height based on the aspect ratio
			const targetWidth = Math.sqrt(targetArea * aspectRatio)
			const targetHeight = targetWidth / aspectRatio
		
			// Check if the calculated width and height fit within the container
			if (targetWidth > containerWidth || targetHeight > containerHeight) {
				// Adjust to fit within the container if necessary
				const widthScale  = containerWidth  / targetWidth
				const heightScale = containerHeight / targetHeight
				const scale = Math.min(widthScale, heightScale)
		
				return {
					width:  targetWidth * scale,
					height: targetHeight * scale,
				}
			}
		
			// Return the calculated dimensions
			return {
				width:  targetWidth,
				height: targetHeight,
			}
		}
		//SIZE
		let drawSize = {
			width  : null,
			height : null,
		}
		//if size drawing method is "fit-content", skip calculating initial draw size
		if (this.appParams.sizeDrawMethod === "fit-content") {
			drawSize.width  = 0
			drawSize.height = 0
		
		//otherwise, calculate depending on method and initial draw size
		} else {
			if (Array.isArray(this.appParams.initialDrawSize)) {
				drawSize.width  = this.appParams.initialDrawSize[0]
				drawSize.height = this.appParams.initialDrawSize[1]
			} else {
				//define aspect ratio
				let aspectRatio = 1
				if (Array.isArray(this.appParams.initialAspectRatio)) aspectRatio = this.appParams.initialAspectRatio[0]/this.appParams.initialAspectRatio[1]
				else if (this.appParams.initialAspectRatio === "default") aspectRatio = 4/3
				else if (this.appParams.initialAspectRatio === "container") aspectRatio = this.container.offsetWidth/this.container.offsetHeight

				//define size ratio
				let sizeRatio = 1/3
				switch (this.appParams.initialDrawSize) {
					case "default":
					case "mid":
						sizeRatio = 1/3; break 
					case "very-tiny":
						sizeRatio = 1/6; break 
					case "tiny":
						sizeRatio = 1/4; break 
					case "big":
						sizeRatio = 1/2; break
					case "very-big":
					case "maximized":
						sizeRatio = 1/(1+1/3); break //75%
					default:
						sizeRatio = 1/3
				}
				drawSize = calculateWindowSize(
					this.container.offsetWidth,
					this.container.offsetHeight,
					sizeRatio,
					aspectRatio
				)
			}
		}
		return drawSize
	}
	definePosition() {
		//POSITION
		let drawPos  = {
			posX   : null,
			posY   : null
		}
		if  (
				Array.isArray(this.appParams.initialDrawPosition) && 
				this.appParams.initialDrawSize!=="maximized"
			) {
			drawPos.posX = this.appParams.initialDrawPosition[0]
			drawPos.posY = this.appParams.initialDrawPosition[1]
		} else {
			switch (this.appParams.initialDrawPosition) {
				default:
					drawPos.posX = this.container.offsetWidth/2 - this.node.offsetWidth/2
					drawPos.posY = this.container.offsetHeight/2 - this.node.offsetHeight/2
			}
		}
		return drawPos
	}
    constructor(p){
		if (!p.task) {
			delete this
			return
		}

		this.task = p.task
        this.name = p.name
		this.icon = p.icon || null

		this.container = p.container || Task.get("Desktop").node
		
        this.state   = p.state   || 1 
		// 0 => minimized
		// 1 => open
		// 2 => maximized

		this.appParams = (p.appParams!==undefined) ? new Window.AppParameters(p.appParams) : new Window.AppParameters()

		this.drawParams = p.drawParams || null
		/* 
		{
			posX :   0,
			posY :   0,
			width  : 0,
			height : 0,
			maximized : false,
		}
		 */
        
		this.keyNodes = p.keyNodes || {
			dragElements : [],
			windowHeader : null,
			buttonPocket : null,
			innerDrawing : null,
			buttons : {},
			content : null,
			title : null,
			image : null,
		}

		Manager.mem.windows.push(this)
		this.createNode()

		Task.id(this.task).window = this 
		Task.id(this.task).node   = this.keyNodes.content
    }
    createNode(){
		let newWindow = document.createElement("div")
		newWindow.setAttribute("class", "window "+this.task)
		newWindow.classList.add("building")
		newWindow.setAttribute("id", "window_" + Manager.mem.windows.indexOf(this))
	
		let newWindowInner = document.createElement("div")
		newWindowInner.setAttribute("class", "windowInner")
		newWindow.appendChild(newWindowInner)
		this.keyNodes.innerDrawing = newWindowInner
	
			let newHeader = document.createElement("div")
			newHeader.setAttribute("class", "header")
			newWindowInner.appendChild(newHeader)
			this.keyNodes.windowHeader = newHeader
			this.keyNodes.dragElements.push(newHeader)

			let newHeaderBackground = document.createElement("div")
			newHeaderBackground.setAttribute("class", "headerBackground")
			newHeader.appendChild(newHeaderBackground)

			if (this.icon) {
				let newHeaderIcon = document.createElement("img")
				newHeaderIcon.setAttribute("class", "headerIcon")
				newHeaderIcon.setAttribute("src", this.icon)
				newHeader.appendChild(newHeaderIcon)
				this.keyNodes.image = newHeaderIcon
			}

			let newHeaderText = document.createElement("span")
			newHeaderText.setAttribute("class", "headerText")
			newHeader.appendChild(newHeaderText)
			let newWindowTextNode = document.createTextNode(this.name)
			newHeaderText.appendChild(newWindowTextNode)
			this.keyNodes.title = newHeaderText

			let newHeaderButtons = document.createElement("div")
			newHeaderButtons.setAttribute("class", "headerButtons")
			newHeader.appendChild(newHeaderButtons)
			this.keyNodes.buttonPocket = newHeaderButtons

			if (this.appParams.buttons.length>0) {
				for (let button of this.appParams.buttons) {
					let newWindowButton = document.createElement("button")
					if (button.class) newWindowButton.setAttribute("class", `windowButton ${button.class}`)
					if (button.image) newWindowButton.style.backgroundImage = button.image
					this.keyNodes.buttonPocket.appendChild(newWindowButton)
					newWindowButton.onclick = button.function
				}
			}

			if (this.appParams.minimizeable) {
				let buttonMinimize = document.createElement("button")
				buttonMinimize.setAttribute("class", "windowButton _")
				this.keyNodes.buttonPocket.appendChild(buttonMinimize)
				this.keyNodes.buttons.minimize = buttonMinimize
				buttonMinimize.onclick = e => {
					return
				}
			}

			if (this.appParams.maximizeable) {
				let buttonMaximize = document.createElement("button")
				buttonMaximize.setAttribute("class", "windowButton O")
				this.keyNodes.buttonPocket.appendChild(buttonMaximize)
				this.keyNodes.buttons.maximize = buttonMaximize
				buttonMaximize.onclick = () => Window.maximize(this)
			}

			let buttonClose = document.createElement("button")
			buttonClose.setAttribute("class", "windowButton X")
			this.keyNodes.buttonPocket.appendChild(buttonClose)
			this.keyNodes.buttons.close = buttonClose
			buttonClose.onclick = ()=> Window.close(this)

		let newContent = document.createElement("div")
		newContent.setAttribute("class", "content")
		newWindowInner.appendChild(newContent)
		this.keyNodes.content = newContent
		
		let newWindowBorder = document.createElement("div")
		newWindowBorder.setAttribute("class", "windowBorder")
		newWindow.appendChild(newWindowBorder)
	
			if (this.appParams.resizeable) {
				let newWindowEtop = document.createElement("div")
				newWindowEtop.setAttribute("class", "windowEdge windowEtop")
				let newWindowEbot = document.createElement("div")
				newWindowEbot.setAttribute("class", "windowEdge windowEbot")
				let newWindowElef = document.createElement("div")
				newWindowElef.setAttribute("class", "windowEdge windowElef")
				let newWindowErig = document.createElement("div")
				newWindowErig.setAttribute("class", "windowEdge windowErig")
				let newWindowCtl = document.createElement("div")
				newWindowCtl.setAttribute("class", "windowCorner windowCtl")
				let newWindowCtr = document.createElement("div")
				newWindowCtr.setAttribute("class", "windowCorner windowCtr")
				let newWindowCbr = document.createElement("div")
				newWindowCbr.setAttribute("class", "windowCorner windowCbr")
				let newWindowCbl = document.createElement("div")
				newWindowCbl.setAttribute("class", "windowCorner windowCbl")
				newWindowBorder.appendChild(newWindowEtop)
				newWindowBorder.appendChild(newWindowEbot)
				newWindowBorder.appendChild(newWindowElef)
				newWindowBorder.appendChild(newWindowErig)
				newWindowBorder.appendChild(newWindowCtl)
				newWindowBorder.appendChild(newWindowCtr)
				newWindowBorder.appendChild(newWindowCbr)
				newWindowBorder.appendChild(newWindowCbl)
			}
	
		document.getElementById("windowLayer").appendChild(newWindow)
		
		if(this.drawParams===null) {
			this.drawParams = {
				posX :   0,
				posY :   0,
				width  : 0,
				height : 0,
				maximized : false,
			}

			//try to get initial drawParams from registry first
			let drawParams = null

			if (this.appParams.saveDrawParameters !== "disabled") drawParams = Manager.getInitialDrawParams(this)

			//if there are none, do it from scratch from instructions
			if (drawParams===null) {
				drawParams = this.defineSize()
				this.drawParams.width  = drawParams.width
				this.drawParams.height = drawParams.height
			} else {
				this.drawParams = drawParams
			}
		}

		if (this.appParams.initialDrawSize === "maximized") this.drawParams.maximized = true

		newWindow.setAttribute
		(
			"style", 
			"left:"+0+"px;"+
			"top: "+0+"px;"+
			"width :"+((this.drawParams.width >0) ? this.drawParams.width +"px;":"fit-content;")+
			"height:"+((this.drawParams.height>0) ? this.drawParams.height+"px;":"fit-content;")+
			"min-width :"+((this.appParams.minW>0) ? +this.appParams.minW  +"px;":"fit-content;")+
			"min-height:"+((this.appParams.minH>0) ? +this.appParams.minH  +"px;":"fit-content;")+
			"z-index: 0;"
		)

		this.node = newWindow
		this.cont = newContent

		//adjust size for content if set to that method
		if (this.appParams.sizeDrawMethod === "content" || this.appParams.sizeDrawMethod === "default") {
			let diffW = (this.node.offsetWidth  - this.keyNodes.content.offsetWidth)
			let diffH = (this.node.offsetHeight - this.keyNodes.content.offsetHeight)
			this.drawParams.width  += diffW
			this.drawParams.height += diffH
			this.node.style.width  = this.drawParams.width  +"px"
			this.node.style.height = this.drawParams.height +"px"
		}
	
		for (let button of newWindow.getElementsByClassName("windowButton")){
			button.onmousedown = e => {
				button.classList.add("mousedown")
				window.onmouseup = e => {
					button.classList.remove("mousedown")
					window.onmouseup = null
				}
			}
		}

		nodeGetters(newContent, newContent.classList[0], newWindow.classList[1])
		
		this.node.onmousedown = e => {
			Task.id(this.task).focus()
			this.statNode()
		}
	
		this.statNode()
		this.poseNode()
		this.drag()
		this.size()
		this.focus()
    }
    deleteNode(){
		//delete window
		let thisIndex = Manager.mem.windows.indexOf(this)
		Manager.mem.windows.splice(thisIndex, 1)

		//if the window was focused, shift focus behind it
		if (thisIndex === 0) {
			if (Manager.mem.windows.length > 0) {
				Task.id(Manager.mem.windows[0].task).focus()
			} else {
				Task.get("Desktop")?.focus()
			}
		}

		if (this.node) this.node.parentElement.removeChild(this.node)

		//make DOM elements's IDs and zIndex match new object arrangement
		for(let window of document.getElementsByClassName("window")){ 
			let windowId = window.id.match(/(\d+)/)[0]
			let windowInt= parseInt(windowId)
			
			if(windowInt > thisIndex){
				window.id = "window_" + (windowInt - 1)
				window.style.zIndex = (windowInt - 1) *-1
			}
		}
    }
	setTitle(string){
		this.name = string
		if (this.keyNodes.title) this.keyNodes.title.innerText = string
	}
	setImage(src){
		if (this.keyNodes.image) {
			if (!src) this.keyNodes.image.classList.add("hidden")
			this.keyNodes.image.classList.remove("hidden")
			this.keyNodes.image.setAttribute("src",src)
		}
	}
    statNode(){
		//only works with moveable windows & if window isn't at front already 
		if (this.keyNodes.dragElements && this.node.id != "window_" + 0) {
			//send to first array index
			let thisIndex = Manager.mem.windows.indexOf(this)
			Manager.mem.windows.splice(thisIndex, 1)
			Manager.mem.windows.unshift(this)

			//make DOM elements's IDs and zIndex match new object arrangement
			for(let window of document.getElementsByClassName("window")){ 
				let windowId = window.id.match(/(\d+)/)[0]
				let windowInt= parseInt(windowId)

				if(window != this.node && windowInt < thisIndex){
					window.id = "window_" + (windowInt + 1)
					window.style.zIndex = (windowInt + 1) *-1
				}
			}
			//make this window's ID and zIndex match its object position
			this.node.id = "window_" + 0
			this.node.style.zIndex = 0

			/*principle: ---------------|
			
				Let's say this is our list of window HTML elements, represented as an array ordered
			from front to back.

				[0][1][2][3][4][5] 
				
				*this is an abstract representation of our DOM elements for explanation purposes.
				*the window class as a selector would return an array that would always order the
				window elements from oldest to newest, which for this principle turns out useless.

				The window at 0 will always be the one at the front, manifested through a zIndex of 0 
			while all others have a zIndex equal to their index's negation.

				Let's say we clicked the window number 3, so we'd want that window to be at the front;
			the following would happen:

				 ┏━►┓━►┓━►┓            =0 +1 +1 +1                     
				[0][1][2][3][4][5] => [3][0][1][2][4][5] => [0][1][2][3][4][5]
				 ┗◄━━━━━━━┛

				The third window's array position would be set to 0, while every window that was in 
			front of it would sum +1 to theirs, and every window that was behind it would be unchanged.

				The benefit of this rotation is to keep our Z dimension clean and better administrate
			its range. It's also a good way to pack everything related to windows nicely together:
			the array, the objects and their Z position.

			|---------------  principle*/
		}
    }
	sizeNode(){
		if (this.drawParams.width<=0 || this.drawParams.height<=0) return

		this.node.style.width  = this.drawParams.width  +"px"
		this.node.style.height = this.drawParams.height +"px"
	}
    poseNode(){
		if (this.drawParams.maximized) {
			this.node.style.top  = this.container.offsetTop  + "px"
			this.node.style.top  = this.node.offsetTop  - this.keyNodes.innerDrawing.offsetTop  + "px"
			this.node.style.left = this.container.offsetLeft + "px"
			this.node.style.left = this.node.offsetLeft - this.keyNodes.innerDrawing.offsetLeft + "px"

			if (this.drawParams.width<=0 || this.drawParams.height<=0) return
			this.node.style.width  = this.container.offsetWidth  +"px"
			this.node.style.width  = this.container.offsetWidth  - this.keyNodes.innerDrawing.offsetWidth  + this.node.offsetWidth +"px"
			this.node.style.height = this.container.offsetHeight +"px"
			this.node.style.height = this.container.offsetHeight - this.keyNodes.innerDrawing.offsetHeight + this.node.offsetHeight+"px"
			return
		}

		this.node.style.top  = this.drawParams.posY + "px"
		this.node.style.left = this.drawParams.posX + "px"

		if (this.drawParams.width<=0 || this.drawParams.height<=0) return
		this.node.style.width  = this.drawParams.width  +"px"
		this.node.style.height = this.drawParams.height +"px"
    }
    drag(){
		let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
		let window = this.node
		const _this = this
		
		for (let node of this.keyNodes.dragElements) {
			//if present, the header is where you move the window from:
			node.onmousedown = dragMouseDown
		}
	
		function dragMouseDown(e) {
			e = e || window.event
			e.preventDefault()
	
			_this.statNode()
	
			if (e.target.classList.contains("windowButton") == false) {
				//get initial cursor position:
				pos3 = e.clientX
				pos4 = e.clientY
	
				document.onmouseup = closeDragWindow
				document.onmousemove = windowDrag
				iframeAntiHover(true)
			}
		}
		
		function windowDrag(e) {
			e = e || window.event
			e.preventDefault()
	
			//calculate new cursor position:
			pos1 = pos3 - e.clientX
			pos2 = pos4 - e.clientY
			pos3 = e.clientX
			pos4 = e.clientY
	
			//set the window's new position:
			_this.drawParams.posX = _this.drawParams.posX - pos1
			_this.drawParams.posY = _this.drawParams.posY - pos2
			_this.poseNode()
		}
	
		function closeDragWindow() {
			//correct if header's altitude goes beyond viewport
			if (_this.node.offsetTop + _this.keyNodes.innerDrawing.offsetTop < 0) {
				//if header disappears above viewport, place window precisely beneath viewport border
				_this.node.style.top  = _this.container.offsetTop  + "px"
				_this.node.style.top  = _this.node.offsetTop - _this.keyNodes.innerDrawing.offsetTop  + "px"
				_this.drawParams.posY = _this.node.offsetTop
			}
			if (_this.node.offsetTop + _this.keyNodes.innerDrawing.offsetTop > _this.container.offsetHeight - _this.keyNodes.windowHeader.offsetHeight) {
				//if header disappears below viewport, place window in such a way that the header is perfectly surfacing
				_this.node.style.top  = _this.container.offsetHeight - _this.keyNodes.innerDrawing.offsetTop - _this.keyNodes.windowHeader.offsetHeight + "px"
				_this.drawParams.posY = _this.node.offsetTop
			}
			//stop moving when mouse button is released:
			document.onmouseup = null
			document.onmousemove = null
			iframeAntiHover(false)
		}
    }
    size(){
		let startX, startY, startWidth, startHeight, startLeft, startTop, border
		let window = this.node
		const _this = this
	
		let windowBorder = window.getElementsByClassName("windowBorder")[0]
	
		windowBorder.childNodes.forEach((border) => {
			if(
				border.classList
			) {
				border.onmousedown = initResize
			}
		});
	
		function initResize(e) {
			e.preventDefault()
	
			_this.statNode()
	
			startX = e.clientX
			startY = e.clientY
	
			startWidth  = _this.drawParams.width 
			startHeight = _this.drawParams.height
	
			startTop  = _this.drawParams.posY
			startLeft = _this.drawParams.posX
			
			border = e.target.classList[1]
			
			document.onmouseup = stopResize
			document.onmousemove = doResize
			iframeAntiHover(true)
		}
		
		function doResize(e) {
			e.preventDefault()
	
			//get int for window min-height and min-width css values
			let minHeight = parseInt(getComputedStyle(_this.node,null).getPropertyValue("min-height"))
			let minWidth = parseInt(getComputedStyle(_this.node,null).getPropertyValue("min-width"))
			
			//when sizing towards →
			if (border == "windowErig" || border == "windowCbr" || border == "windowCtr") {
				if ((startWidth + e.clientX - startX) > minWidth){
					_this.drawParams.width  = startWidth + e.clientX - startX
				} else {
					_this.drawParams.width  = minWidth
				}
			}
			//when sizing towards ↓
			if (border == "windowEbot" || border == "windowCbr" || border == "windowCbl") {
				if ((startHeight + e.clientY - startY) > minHeight){
					_this.drawParams.height = startHeight + e.clientY - startY
				} else {
					_this.drawParams.height = minHeight
				}
			}
			//when sizing towards ← ---------- [accounting for window min-width]
			if (border == "windowElef" || border == "windowCtl" || border == "windowCbl") {
				if (startLeft + e.clientX - startX < startLeft + (startWidth - minWidth)){
					_this.drawParams.posX = startLeft + e.clientX - startX
					_this.drawParams.width  = startWidth + (e.clientX - startX) * -1
				} else {
					//stuck in minimum size
					_this.drawParams.posX = startLeft + (startWidth - minWidth)
					_this.drawParams.width  = minWidth
				}
			//when sizing towards ↑ ---------- [accounting for window min-height]
			}
			if (border == "windowEtop" || border == "windowCtl" || border == "windowCtr") {
				if (startTop + e.clientY - startY < startTop + (startHeight - minHeight)){
					_this.drawParams.posY = startTop + e.clientY - startY
					_this.drawParams.height = startHeight + (e.clientY - startY) * -1
				} else {
					//stuck in minimum size
					_this.drawParams.posY = startTop + (startHeight - minHeight)
					_this.drawParams.height = minHeight
				}
			}
	
			_this.poseNode()
		}
	
		function stopResize() {
			document.onmouseup = null
			document.onmousemove = null
			iframeAntiHover(false)
		}
    }
	focus(){
		this.node.classList.remove("blur")
		this.cont.classList.remove("blur")
		this.node.focus()
		if (this.node.onfocus) this.node.onfocus()
	}
	blur(){
		this.node.classList.add("blur")
		this.cont.classList.add("blur")
		this.node.blur()
		if (this.node.onblur) this.node.onblur()
	}
}