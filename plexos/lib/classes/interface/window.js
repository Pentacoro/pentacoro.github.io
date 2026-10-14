import plexos from "/boot/plexos.js"
import {nodeGetters, iframeAntiHover, genRanHex} from "/plexos/lib/functions/dll.js"
import { themeConstruct } from "/plexos/lib/functions/theme.js"
import Task from "../system/task.js"
import File from "../filesystem/file.js"
import ProxyFile from "../filesystem/proxy.js"

let System = plexos.System

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
			// "center"      => perfectly centered on the desktop container
			// "window"      => centered on the task's primary window

			this.windowKey = p?.windowKey || null
			this.savePosition = !!p?.savePosition
			this.parentTaskId = p?.parentTaskId || null

			this.saveDrawParameters = p?.saveDrawParameters || "disabled"
			// "default"     => same as "app"
			// "app"         => retrieve draw parameters from last closed app instance
			// "file"        => retrieve draw parameters specific to each file opened in app instance (requires filePath)
			// "window"      => named dialog: persist under windowDrawParameters.windows[windowKey] (pos only when fit-content)
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
			System.bus.off("viewport-resize", () => {
				window.poseNode()
			})
		} else {
			window.drawParams.maximized = true
			window.poseNode()
			System.bus.on("viewport-resize", () => {
				window.poseNode()
			})
		}
	}

	// Task that owns a modal stack blocking this window (parent chrome, or a lower dialog).
	static hostOfPersistent(window) {
		const own = Task.id(window.task)
		if (own?.window === window && own.topPersistentWindow?.()) return own
		const parentId = window.appParams?.parentTaskId
		if (parentId) {
			const parent = Task.id(parentId)
			const top = parent?.topPersistentWindow?.()
			if (top && top !== window) return parent
			if (parent?.window === window && top) return parent
		}
		return null
	}

	static close(window) {
		if (window.appParams.saveDrawParameters !== "disabled" || window.appParams.savePosition) {
			Task.get("Window Manager").setInitialDrawParams(window)
		}
		const task = Task.id(window.task)
		if (!task) return
		if (task.window === window) {
			for (const extra of [...(task.persistentWindows || [])]) extra.deleteNode()
			task.persistentWindows = []
			task.end()
			return
		}
		// Extra window on the same task (not a child Popup task).
		task.persistentWindows = (task.persistentWindows || []).filter(w => w !== window)
		task.windows = (task.windows || []).filter(w => w !== window)
		const onClose = window.onClose
		window.onClose = null
		window.deleteNode()
		if (onClose) onClose()
		const next = task.persistentWindows.at(-1)
		if (next) {
			next.statNode()
			next.focus()
		}
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
				case "window": { // center on parentTaskId's primary window, else desktop
					const parentId = this.appParams.parentTaskId
					const parent = (parentId ? Task.id(parentId)?.window : null) || Task.id(this.task)?.window
					if (parent && parent !== this && parent.node) {
						const pw = parent.drawParams.width || parent.node.offsetWidth
						const ph = parent.drawParams.height || parent.node.offsetHeight
						drawPos.posX = parent.drawParams.posX + (pw - this.node.offsetWidth) / 2
						drawPos.posY = parent.drawParams.posY + (ph - this.node.offsetHeight) / 2
						break
					}
				}
				case "center":
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

		const taskRef = Task.id(p.task)
		let registryParameters = {}
		if (taskRef?.appID && plexos.Core.registry) {
			try {
				const registryAppEntry = plexos.Core.registry.getAppParams(taskRef.appID)
				if (registryAppEntry?.windowDrawParameters?.default) {
					registryParameters = ProxyFile.unwrapProxy(registryAppEntry.windowDrawParameters.default)
				}
			} catch (e) {
				console.error(e)
			}
		}
		this.appParams = (p.appParams!==undefined)
			? new Window.AppParameters({...registryParameters, ...p.appParams})
			: new Window.AppParameters(registryParameters)


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

		Task.get("Window Manager").mem.windows.push(this)
		this.createNode()

		const owner = Task.id(this.task)
		if (!owner.window) { // don't replace the caller's primary with a child dialog
			owner.window = this
			owner.node = this.keyNodes.content
		}
    }
    createNode(){
		this.wid = "wid-" + genRanHex(8) // unique query scope; two windows must not share a task-id selector
		this._windowIndex = Task.get("Window Manager").mem.windows.indexOf(this)
		themeConstruct("window", this)

		if (this.keyNodes.modalShield) {
			this.keyNodes.modalShield.onmousedown = e => {
				e.preventDefault()
				e.stopPropagation()
				Task.id(this.task).attentionPersistent()
			}
		}
		if (this.keyNodes.buttons.minimize) {
			this.keyNodes.buttons.minimize.onclick = () => {}
		}
		if (this.keyNodes.buttons.maximize) {
			this.keyNodes.buttons.maximize.onclick = () => {
				if (this.isModalLocked()) {
					Task.id(this.task).attentionPersistent()
					return
				}
				Window.maximize(this)
			}
		}
		if (this.keyNodes.buttons.close) {
			this.keyNodes.buttons.close.onclick = () => {
				if (this.isModalLocked()) {
					Task.id(this.task).attentionPersistent()
					return
				}
				Window.close(this)
			}
		}
		for (const button of this.node.getElementsByClassName("windowButton")) {
			if (button._themeAction) {
				button.onclick = e => {
					if (this.isModalLocked()) {
						Task.id(this.task).attentionPersistent()
						return
					}
					button._themeAction(e)
				}
			}
		}

		const newWindow = this.node
		
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

			if (this.appParams.saveDrawParameters !== "disabled") drawParams = Task.get("Window Manager").getInitialDrawParams(this)

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
		this.cont = this.keyNodes.content

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

		nodeGetters(this.cont, this.cont.classList[0], this.wid)
		
		this.node.onmousedown = e => {
			const host = Window.hostOfPersistent(this)
			if (host) {
				e.stopPropagation()
				e.preventDefault()
				host.attentionPersistent()
				return
			}
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
		let thisIndex = Task.get("Window Manager").mem.windows.indexOf(this)
		Task.get("Window Manager").mem.windows.splice(thisIndex, 1)

		//if the window was focused, shift focus behind it
		if (thisIndex === 0) {
			if (Task.get("Window Manager").mem.windows.length > 0) {
				Task.id(Task.get("Window Manager").mem.windows[0].task).focus()
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
			let thisIndex = Task.get("Window Manager").mem.windows.indexOf(this)
			Task.get("Window Manager").mem.windows.splice(thisIndex, 1)
			Task.get("Window Manager").mem.windows.unshift(this)

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

			const host = Window.hostOfPersistent(_this)
			if (host) {
				e.stopPropagation()
				host.attentionPersistent()
				return
			}
	
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

			const host = Window.hostOfPersistent(_this)
			if (host) {
				e.stopPropagation()
				host.attentionPersistent()
				return
			}
	
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
	isModalLocked() {
		return this.node?.classList.contains("modal-locked")
	}
	// Shown while a persistent child is open: blocks drag, resize, and window buttons.
	lockModal() {
		if (!this.node) return
		this.node.classList.add("modal-locked")
	}
	unlockModal() {
		this.node?.classList.remove("modal-locked")
	}
}