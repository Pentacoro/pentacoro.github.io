import {plexos} from "/plexos/ini/system.js"
import {nodeGetters, iframeAntiHover} from "/plexos/lib/functions/dll.js"
import Task from "../system/task.js"

let System = plexos.System

export default class Window {
	stat = 1
	uiux = []
	posX = 200
	posY = 200
    constructor(p){
		if (!p.task) {
			delete this
			return
		}

        this.stat = p.stat || this.stat // 0 => minimized | 1/2 => open/selected | 3/4 => maximized/selected
        this.uiux = p.uiux || this.uiux
        this.posX = p.posX || this.posX
        this.posY = p.posY || this.posY
        
        this.widt = p.widt
        this.heig = p.heig
        this.minW = p.minW
        this.minH = p.minH
        
        this.task = p.task
		this.icon = p.icon || null
        
        this.name = p.name
		this.move = p.move || []
        this.resi = p.resi

		plexos.Windows.push(this)
		this.createNode()

		Task.id(this.task).window = this 
		Task.id(this.task).node   = this.cont
    }
    createNode(){
		let newWindow = document.createElement("div")
		newWindow.setAttribute("class", "window "+this.task)
		newWindow.setAttribute("id", "window_" + plexos.Windows.indexOf(this))
	
		let newWindowInner = document.createElement("div")
		newWindowInner.setAttribute("class", "windowInner")
		newWindow.appendChild(newWindowInner)
	
		if (this.uiux) {
			let newHeader = document.createElement("div")
			newHeader.setAttribute("class", "header")
			newWindowInner.appendChild(newHeader)
			this.move.push(newHeader)

			if (this.icon) {
				let newHeaderIcon = document.createElement("div")
				newHeaderIcon.setAttribute("class", "headerIcon")
				newHeaderIcon.setAttribute("style", `background-image: url('${this.icon}')`)
				newHeader.appendChild(newHeaderIcon)
			}

			let newHeaderText = document.createElement("span")
			newHeaderText.setAttribute("class", "headerText")
			newHeader.appendChild(newHeaderText)
			let newWindowTextNode = document.createTextNode(this.name)
			newHeaderText.appendChild(newWindowTextNode)

			let newHeaderButtons = document.createElement("div")
			newHeaderButtons.setAttribute("class", "headerButtons")
			newHeader.appendChild(newHeaderButtons)
	
				for (let button of this.uiux) {
					let newWindowButton = document.createElement("button")
					newWindowButton.setAttribute("class", "windowButton"+" "+button.class)
					newHeaderButtons.appendChild(newWindowButton)
					newWindowButton.onclick = button.function
				}

				let newWindowX = document.createElement("button")
				newWindowX.setAttribute("class", "windowButton X")
				newHeaderButtons.appendChild(newWindowX)
				newWindowX.onclick = ()=>Task.id(this.task).end()
		}
			let newContent = document.createElement("div")
			newContent.setAttribute("class", "content")
			newWindowInner.appendChild(newContent)
		
	
		let newWindowBorder = document.createElement("div")
		newWindowBorder.setAttribute("class", "windowBorder")
		newWindow.appendChild(newWindowBorder)
	
			if (this.resi == true) {
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

		Task.id(this.task)?.focus()
		
		//Getting minimum size to apply to the content,
		//instead of the window node, by comparing the 
		//size of the window to that of the content.
		//This should work for different css themes.
		let diffW = (newWindow.offsetWidth - newWindow.firstChild.children[1].offsetWidth)
		let diffH = (newWindow.offsetHeight - newWindow.firstChild.children[1].offsetHeight)
		this.widt += diffW
		this.heig += diffH
		this.minW += diffW
		this.minH += diffH

		newWindow.setAttribute  ("style", 
									"left:"+this.posX+"px;"+
									"top:"+this.posY+"px;"+
									"width:"+this.widt+"px;"+
									"height:"+this.heig+"px;"+
									"min-width:"+this.minW+"px;"+
									"min-height:"+this.minH+"px;"+
									"z-index: 0;");
	
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
		
		this.node = newWindow
		this.cont = newContent

		this.node.onmousedown = e => {
			Task.id(this.task).focus()
			this.statNode()
		}
	
		this.statNode()
		this.poseNode()
		this.drag()
		this.size()
		this.focus(true)
    }
    deleteNode(){
		//delete window
		let thisIndex = plexos.Windows.indexOf(this)
		plexos.Windows.splice(thisIndex, 1)

		//if the window was focused, shift focus behind it
		if (thisIndex === 0) {
			if (plexos.Windows.length > 0) {
				Task.id(plexos.Windows[0].task).focus()
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
    statNode(){
		//only works with moveable windows & if window isn't at front already 
		if (this.move && this.node.id != "window_" + 0) {
			//send to first array index
			let thisIndex = plexos.Windows.indexOf(this)
			plexos.Windows.splice(thisIndex, 1)
			plexos.Windows.unshift(this)

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
    poseNode(){
		this.node.style.top = this.posY + "px"
		this.node.style.left = this.posX + "px"
	
		this.node.style.height = this.heig + "px"
		this.node.style.width = this.widt + "px"
    }
    drag(){
		let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
		let window = this.node
		let _this = this
		
		for (let node of this.move) {
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
			_this.posX = _this.posX - pos1
			_this.posY = _this.posY - pos2
			_this.poseNode()
		}
	
		function closeDragWindow() {
			//stop moving when mouse button is released:
			document.onmouseup = null
			document.onmousemove = null
			iframeAntiHover(false)
		}
    }
    size(){
		let startX, startY, startWidth, startHeight, startLeft, startTop, border
		let window = this.node
		let _this = this
	
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
	
			startWidth = _this.widt
			startHeight = _this.heig
	
			startLeft = _this.posX
			startTop = _this.posY
			
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
					_this.widt = startWidth + e.clientX - startX
				} else {
					_this.widt = minWidth
				}
			}
			//when sizing towards ↓
			if (border == "windowEbot" || border == "windowCbr" || border == "windowCbl") {
				if ((startHeight + e.clientY - startY) > minHeight){
					_this.heig = startHeight + e.clientY - startY
				} else {
					_this.heig = minHeight
				}
			}
			//when sizing towards ← ---------- [accounting for window min-width]
			if (border == "windowElef" || border == "windowCtl" || border == "windowCbl") {
				if (startLeft + e.clientX - startX < startLeft + (startWidth - minWidth)){
					_this.posX = startLeft + e.clientX - startX
					_this.widt = startWidth + (e.clientX - startX) * -1
				} else {
					//stuck in minimum size
					_this.posX = startLeft + (startWidth - minWidth)
					_this.widt = minWidth
				}
			//when sizing towards ↑ ---------- [accounting for window min-height]
			}
			if (border == "windowEtop" || border == "windowCtl" || border == "windowCtr") {
				if (startTop + e.clientY - startY < startTop + (startHeight - minHeight)){
					_this.posY = startTop + e.clientY - startY
					_this.heig = startHeight + (e.clientY - startY) * -1
				} else {
					//stuck in minimum size
					_this.posY = startTop + (startHeight - minHeight)
					_this.heig = minHeight
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