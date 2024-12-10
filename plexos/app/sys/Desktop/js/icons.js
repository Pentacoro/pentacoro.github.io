import {cfg, plexos} from "/plexos/ini/system.js"
import {getTask, iframeAntiHover, selectText, clearSelection, nullifyOnEvents} from "/plexos/lib/functions/dll.js"
import Task from "/plexos/lib/classes/System/task.js"
import File from "/plexos/lib/classes/files/file.js"
import ContextMenu from "/plexos/lib/classes/interface/contextmenu.js"

let System = plexos.System
let task    = getTask(/TASKID/)
let desktop = task
let mem     = task.mem

mem.class   = {}
mem.class.IconDesk = class IconDesk {
    stat = 0
    constructor(p){
        this.stat = p.stat || this.stat
        this.coor = p.coor || null

        this.file = p.file || ""
        this.imag = p.imag
        this.name = p.name
        this.type = p.type
        this.exte = p.exte || (this.type==="Directory") ? "dir" : (this.name.match(/\.(?:.(?<!\.))+$/s)!=null) ? this.name.match(/(?:.(?<!\.))+$/s)[0] : ""

        this.drop = []
    }
    createNode(){
        //Icon HTML structure-----|
        if (desktop.mem.iconArr.includes(this)) return

        let newIcon = document.createElement("div")
        this.node = newIcon

        newIcon.setAttribute("class", "icon")
        newIcon.setAttribute("title", this.name)
        newIcon.setAttribute("id", "Icon: "+this.name)
        if (this.coor) newIcon.setAttribute("style",    "left:"+this.coor.px+"px;"+
                                                        "top:"+this.coor.py+"px;"+
                                                        "width:"+cfg.desktop.grid.width+"px;"+
                                                        "height:"+cfg.desktop.grid.height+"px;")

        let newIconImage = document.createElement("div")
        let newIconFrame = document.createElement("div")
        newIconImage.setAttribute("class", "iconImage")
        newIconImage.setAttribute("style", "background-image: url('"+this.imag+"');")
        newIconFrame.setAttribute("class", "iconFrame")
        
        newIconFrame.appendChild(newIconImage)
        newIcon.appendChild(newIconFrame)

        let newIconText = document.createElement("h3")
        let newIconTextNode = document.createTextNode(this.name)
        newIconText.appendChild(newIconTextNode)
        newIcon.appendChild(newIconText)

        document.getElementById("iconLayer").appendChild(newIcon)

        desktop.mem.iconArr.push(this)
        //------------------------|

        this.node = document.getElementById("Icon: "+this.name)
        if (System.mem.var.envfocus!=desktop) this.node.classList.add("blur")

        this.clic()
    }
    deleteNode(fromGrid = false){
        if (this.node) this.node.remove()
        delete this.node

        if (!fromGrid) {
            desktop.mem.grid.gridArr[this.coor.ax][this.coor.ay].used = false
            desktop.mem.grid.gridArr[this.coor.ax][this.coor.ay].icon = null
        }

        desktop.mem.iconArr = desktop.mem.iconArr.remove(this)
        desktop.pocket = desktop.pocket.remove(this)
    }
    statNode(num){
        //0 => unselected | 1 => selected | 2 => moving
        this.stat = (num != undefined) ? num : this.stat

        switch(this.stat){
            case 0:
                this.node.classList.remove("active")
                this.node.classList.remove("moving")
                this.node.style.backgroundColor = ''

                //back to icon layer
                document.getElementById("iconLayer").appendChild(this.node)
                break
            case 1:
                if(!this.node.classList.contains("active")) this.node.className += " active"
                if(!desktop.pocket.includes(this)) desktop.pocket.push(this)
                this.node.classList.remove("moving")
                this.node.style.backgroundColor = ''

                //back to icon layer
                document.getElementById("iconLayer").appendChild(this.node)
                break
            case 2: 
                if(!this.node.classList.contains("moving")) this.node.className += " moving"

                //dragLayer layer
                document.getElementById("dragLayer").appendChild(this.node)
                break
            default: 
        }
    }
    poseNode(){
        if (!this.node) return
        let node = this.node

        node.style.left = this.coor.tx + "px"
        node.style.top = this.coor.ty + "px"
        node.style.width = cfg.desktop.grid.width + "px"
        node.style.height = cfg.desktop.grid.height + "px"
    
        function rawr(px, dem = 2.35, dpx = 44) {
            let per = px/dpx * 100
            let nem = per/100 * dem
            return nem
        }
        function stylize(node, styleName = "style1") {
            let styleClass
            for (let className of node.classList) {
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
            return (b == 0) ? a : gcd (b, a%b)
        }
    
        //_______________________
        let w = node.offsetWidth
        let h = node.offsetHeight
        let r = gcd (w, h)
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
                    node.children[1].style.fontSize = (h === 50) ? "" : rawr(node.children[1].offsetHeight, 37.6, 44) + "px"
                }
                if (div > 3.5) {
                    stylize(node, "style4")
                    node.style.gridTemplateColumns = node.children[0].offsetHeight + "px auto"
                    node.children[1].style.fontSize = (h === 50) ? "" : rawr(node.children[1].offsetHeight, 37.6, 44) + "px"
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
                    node.children[1].style.fontSize = rawr(node.children[1].offsetHeight, 19.2, 44) + "px"
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
                    node.children[1].style.fontSize = rawr(node.children[1].offsetHeight, 19.2, 44) + "px"
                }
                if (div < 0.5 || div > 1.5) {
                    stylize(node, "style2")
                }
                return
            }
        }
        File.at(this.file).cfg.icon.coor = this.coor
        this.node.childNodes[1].innerText = this.name
    }
    clic(){
        this.node.oncontextmenu = e => ContextMenu.open(e,this)
        this.node.onmousedown = e => this.drag(e);
        this.node.ondblclick = e => File.at(this.file).open()
    }
    drag(e){
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
        let node = this.node
        let _this = this 
	
        dragMouseDown(e)
        function dragMouseDown(e) {
            e = e || window.event
            e.preventDefault()
            
            //get initial cursor position:
            pos3 = e.clientX + desktop.node.scrollLeft
            pos4 = e.clientY + desktop.node.scrollTop
            
            //when mousedown on selected icon
            if (_this.stat == 1) {
                //managing selected icons
                for (let icon of desktop.pocket) {
                    //light up all hover border onmousedown:-|
                    icon.highlight(true)
                    //---------------------------------------|
                }
            } else {
                if (System.mem.var.shSelect == true && !System.mem.var.dragging) {
                    //light up 1 hover border onmousedown:
                    _this.highlight(true)
                    node.style.backgroundColor = 'rgb(0,0,0,0)'
                    
                    //when mousedown on unselected icon
                    if(!e.ctrlKey) {
                        for (let icon of desktop.pocket){
                            desktop.pocket = desktop.pocket.remove(icon)
                            icon.statNode(0)
                        }
                        desktop.pocket.push(_this)
                        _this.stat = 1
                        _this.highlight(true)
                    } else if(e.ctrlKey) {
                        desktop.pocket.push(_this)
                        _this.stat = 1
                        _this.highlight(true)
                    }
                }
            }
    
            if(cfg.audio.icons && !System.mem.var.dragging) {
                plexos.Sound[0].volume = 0.5
                plexos.Sound[0].play()
            }
            
            document.onmouseup = closeDragIcon
            if(e.button == 0) document.onmousemove = iconDrag
            iframeAntiHover(true)
        }								 
    
        function iconDrag(e) {
            e = e || window.event
            e.preventDefault()
            
            //calculate new cursor position:
            pos1 = pos3 - e.clientX
            pos2 = pos4 - e.clientY
            pos3 = e.clientX
            pos4 = e.clientY
    
            System.mem.var.dragging = true
            
            
            //managing selected icons
            for (let icon of desktop.pocket){
                //dragLayer layer
                document.getElementById("dragLayer").appendChild(icon.node)
                //set position for selected icons:------------|
                icon.coor.tx = (icon.coor.tx - pos1)
                icon.coor.ty = (icon.coor.ty - pos2)
                desktop.mem.grid.gridArr[icon.coor.ax][icon.coor.ay].used = false
                desktop.mem.grid.gridArr[icon.coor.ax][icon.coor.ay].icon = null
                //--------------------------------------------|
                
                icon.statNode(2)
                icon.poseNode()
            }
        }
    
        function closeDragIcon(e) {	
            //stop moving when mouse button is released:
            document.onmouseup = null
            document.onmousemove = null
            iframeAntiHover(false)
            
            let iconsToValidate = []
    
            //send all icons to position evaluation
            for (let icon of desktop.pocket){
                if (cfg.desktop.grid.enabled && icon.stat == 2) {
                    iconsToValidate.push(icon)
                }
            }
            mem.repositionIcons(iconsToValidate, true, true)
    
            //update HTML of icons after evaluation
            for (let icon of desktop.pocket){
                icon.poseNode()
                icon.statNode(1)
            }
            
            //unselect other folders on mouseup W/O drag UNLESS ctrl
            if(e.ctrlKey == false && System.mem.var.dragging == false && e.button == 0) {
                for (let icon of desktop.pocket){
                    if (icon != _this) desktop.pocket = desktop.pocket.remove(icon)
                    icon.statNode(0)
                    icon.highlight(false)
                }
                _this.statNode(1)
            } else {
                for (let icon of desktop.pocket){
                    icon.highlight(false)
                }
                _this.statNode(1)
            }
            
            System.mem.var.dragging = false
        }
    }
    focus(){
        this.node?.classList.remove("blur")  
    }
    blur(){
        this.node?.classList.add("blur")
    }
    highlight(coin) {
        if (coin) {
            this.node.classList.add("highlight")
            return
        } 
        this.node.classList.remove("highlight")
    }
    rename(e){
        if (!this.node) return
        let iconText = this.node.childNodes[1]
        let editFile = File.at(this.file)
        let editFrom = File.at(editFile.cfg.parent)
        let thisIcon = this
        //make h3 editable --------------------|
        iconText.setAttribute("contenteditable", "true")
        iconText.setAttribute("spellcheck", "false")
        
        //select h3 content --------------------|
        let exte = iconText.innerText.match(/\.(?:.(?<!\.))+$/s)
        exte = (exte!=null && exte.length > 0) ? exte[0] : ""
        this.statNode(1)
        this.stat = 0
        selectText(iconText,0, iconText.innerText.replace(exte,"").length)
    
        iconText.style.textShadow = "none"
        iconText.style.display = "block"
    
        //restore -> leave icon unmodified
        document.body.oncontextmenu = iconRenamingRestore
        window.onkeydown = (e) => {if(e.key == "Escape"){
            iconRenamingRestore()
            return false
        }}
        function iconRenamingRestore(){
            System.mem.var.shSelect = true
            
            thisIcon.statNode()
    
            iconText.textContent = thisIcon.name
            iconText.setAttribute("contenteditable", "false");
            iconText.style.backgroundColor = ""
            iconText.style.textShadow = ""
    
            iconText.blur();
            clearSelection();
    
            nullifyOnEvents(iconText)
        }
    
        setTimeout( () => {
        document.body.onmousedown = iconRenaming
        iconText.onkeydown = (e) => {
            if(e.key == "Enter" && e.shiftKey == false){
                iconRenaming()
                return false
            }
        }
        function iconRenaming(){
            if(
                !File.nameAvailable(iconText.textContent, editFile.cfg.icon, editFrom) &&
                File.validName(iconText.textContent)
            ) {
                //if the name is allowed --------------------|
                System.mem.var.shSelect = true;
    
                if (editFrom === plexos.vtx) thisIcon.node.id = "Icon: "+iconText.textContent
                
                iconText.setAttribute("contenteditable", "false")
                editFile.cfg.icon.name = iconText.textContent
                thisIcon.node.setAttribute("title", iconText.textContent)
                iconText.style.backgroundColor = ""
                iconText.style.textShadow = ""
    
                //insert into fyleSystem
                if (iconText.textContent != editFile.name) { //if the name changed
                    if (editFrom === plexos.vtx){
                        task.mem.getIcon(editFile.name).file = editFrom.cfg.addr +"/"+ iconText.textContent
                        task.mem.getIcon(editFile.name).name = iconText.textContent
                    }
                    editFile.rename(iconText.textContent)
                    if (thisIcon.task) {
                        let taskid = thisIcon.task
                        let task = getTask(taskid)
                        task.mem.iconArray = task.mem.iconArray.remove(thisIcon)
                        document.getElementsByClassName("list ID_"+taskid)[0].removeChild(thisIcon.node)
    
                        editFile.render(taskid)
                        thisIcon = task.mem.iconArray[task.mem.iconArray.length-1]
    
                        for (let icon of task.mem.iconArray) {
                            if (icon.name == iconText.textContent) {
                                icon.statNode(1)
                                task.pocket.push(icon)
                            }
                        }
                    }
                }
    
                thisIcon.statNode(0)
                iconText.blur()
                clearSelection()
    
                nullifyOnEvents(iconText)
            } else {
                //if the name not allowed --------------------|
                System.mem.var.shSelect = false
                iconText.style.backgroundColor = "#c90000"
    
                //insist -> keep only edited selected
                document.body.onclick = iconRenamingInsist
                window.onkeyup = (e) => {
                    if(e.key == "Enter"){
                        iconRenamingInsist()
                        return false
                    }
                }
                function iconRenamingInsist(){
                    if (thisIcon.task) {
                        for (let icon of getTask(thisIcon.task).mem.iconArray){
                            icon.statNode(0)
                            getTask(thisIcon.task).pocket = getTask(thisIcon.task).pocket.remove(icon)
                        }
                    } else {
                        for (let icon of task?.mem.iconArr){
                            icon.statNode(0)
                            task.pocket = task.pocket.remove(icon)
                        }
                    }
                    thisIcon.statNode(1)
                    thisIcon.stat = 0
    
                    selectText(iconText)
                }
            }
        }
        }, 0) //TIMEOUT
    }
}

//icon behavior------------------------------------------------------------------------|
mem.repositionIcons = function(icons, mustSet = false){
    let w = cfg.desktop.grid.width
    let h = cfg.desktop.grid.height
    let wm = (cfg.desktop.grid.modHmargin == 0) ? cfg.desktop.grid.hMargin : cfg.desktop.grid.modHmargin
    let hm = (cfg.desktop.grid.modVmargin == 0) ? cfg.desktop.grid.vMargin : cfg.desktop.grid.modVmargin
    
    let invalidIcons = []
    let validatedIcons = []
    let iconAmount   = icons.length

    for(let icon of icons) validateIconPosition(icon)

    function validateIconPosition(icon){
        if (!icon.coor) icon.coor = {
            px:-1,
            py:-1,
            tx:-1,
            ty:-1,
            ax:null,
            ay:null
        }
        //find closest grid for its tPos
        let x = Math.round((icon.coor.tx + desktop.node.scrollLeft - wm)/(w + wm))*(w + wm) + wm
        let y = Math.round((icon.coor.ty + desktop.node.scrollTop  - hm)/(h + hm))*(h + hm) + hm
        
        //get its spot in grid array
        let tx = Math.round((x - wm)/(w + wm))
        let ty = Math.round((y - hm)/(h + hm))

        if(desktop.mem.grid.gridAvailable(tx, ty)) {
            //if object exists and is not used (valid position)
            let newGrid = desktop.mem.grid.gridArr[tx][ty]
    
            if(mustSet && icon.coor) {
                newGrid.used = true
                newGrid.icon = icon
    
                icon.coor.px = newGrid.posX
                icon.coor.py = newGrid.posY
                icon.coor.tx = newGrid.posX
                icon.coor.ty = newGrid.posY
                icon.coor.ax = tx
                icon.coor.ay = ty

                File.at(icon.file).cfg.coor = icon.coor
                validatedIcons.push(icon)
            }
        } else {
            //if the position is invalid
            invalidIcons.push(icon)
        }
    }

    for(let icon of invalidIcons) reintegrateInvalidIcon(icon)

    function reintegrateInvalidIcon(icon){
        if (!icon.coor) icon.coor = {
            px:-1,
            py:-1,
            tx:-1,
            ty:-1,
            ax:null,
            ay:null
        }
    
        //get previous position in grid array
        let px = Math.round((icon.coor.px - wm)/(w + wm))
        let py = Math.round((icon.coor.py - hm)/(h + hm))

        let oldGrid = {used: true}

        if (desktop.mem.grid.gridArr[px]) {
             if(desktop.mem.grid.gridArr[px][py]) {
                oldGrid = desktop.mem.grid.gridArr[px][py]
            }
        }

        if(mustSet && icon.coor && !oldGrid.used){
            oldGrid.used = true
            oldGrid.icon = icon
            icon.coor.tx = icon.coor.px
            icon.coor.ty = icon.coor.py
            icon.coor.ax = px
            icon.coor.ay = py

            File.at(icon.file).cfg.coor = icon.coor
            validatedIcons.push(icon)
        }else if(mustSet){
            let newGrid = mem.orderIconPosition()
            if (newGrid === undefined) {
                icon.deleteNode(true)
                icon.coor = null
                File.at(icon.file).cfg.icon.coor = null
                mem.var.hiddenIcons = mem.var.hiddenIcons + 1
                task.emit("desktop-icon-hidden")
                return
            }
            newGrid[0].used = true
            newGrid[0].icon = icon
            icon.coor.px = newGrid[0].posX
            icon.coor.py = newGrid[0].posY
            icon.coor.tx = newGrid[0].posX
            icon.coor.ty = newGrid[0].posY
            icon.coor.ax = newGrid[1]
            icon.coor.ay = newGrid[2]

            File.at(icon.file).cfg.coor = icon.coor
            validatedIcons.push(icon)
        }
    }
    
    if(cfg.audio.icons && System.mem.var.dragging) {
        if(invalidIcons.length == iconAmount) {
            plexos.Sound[1].play()
        } else if (invalidIcons.length == 0) {
            plexos.Sound[2].play()
        } else {
            plexos.Sound[3].play()
        }
    }

    return validatedIcons
}

mem.orderIconPosition = function(){
    for (let x = 0; x < desktop.mem.grid.gridArr.length; x++){
        for(let y = 0; y < desktop.mem.grid.gridArr[x].length; y++){
            if (desktop.mem.grid.gridArr[x][y].used == false){
                return [desktop.mem.grid.gridArr[x][y],x,y]
            }
        }
    }
}