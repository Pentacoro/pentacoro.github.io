let task = Task.id("TASKID")
let mem  = task.mem
mem.class = {}
let desktop = task

mem.class.IconDesk = class IconDesk {
    stat = 0
    coor = 
    {
        px : -1,
        py : -1,
        tx : -1,
        ty : -1,
        ax : null,
        ay : null
    }
    constructor(p){
        this.stat = p.stat || this.stat
        this.coor = p.coor || this.coor

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
        if (this.coor.ax==null||this.coor.ay==null) {
            mem.repositionIcons([this],true,false)
        } else {
            mem.repositionIcons([this],true,true)
        }

        let newIcon = document.createElement("div")
        newIcon.setAttribute("class", "icon")
        newIcon.setAttribute("title", this.name)
        newIcon.setAttribute("id", "Icon: "+this.name)
        newIcon.setAttribute("style",   "left:"+this.coor.px+"px;"+
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
        if (system.mem.var.envfocus!=desktop) this.node.classList.add("blur")

        this.statNode()
        this.poseNode()
        this.clic()
    }
    deleteNode(fromGrid = false){
        this.node.parentNode.removeChild(this.node);
        
        if (fromGrid == false) {
            desktop.mem.grid.gridArr[this.coor.ax][this.coor.ay].used = false;
            desktop.mem.grid.gridArr[this.coor.ax][this.coor.ay].icon = null;
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
        File.at(this.file).conf.icon.coor = this.coor
        this.node.childNodes[1].innerText = this.name
    }
    clic(){
        this.node.oncontextmenu = e => openMenu(e,this)
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
                for (icon of desktop.pocket) {
                    //light up all hover border onmousedown:-|
                    icon.highlight(true)
                    //---------------------------------------|
                }
            } else {
                if (system.mem.var.shSelect == true && !system.mem.var.dragging) {
                    //light up 1 hover border onmousedown:
                    _this.highlight(true)
                    node.style.backgroundColor = 'rgb(0,0,0,0)'
                    
                    //when mousedown on unselected icon
                    if(!e.ctrlKey) {
                        for (icon of desktop.pocket){
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
    
            if(cfg.audio.icons && !system.mem.var.dragging) {
                plexos.Sound[0].volume = 0.5
                plexos.Sound[0].play()
            }
            
            document.onmouseup = closeDragIcon
            if(e.button == 0) document.onmousemove = iconDrag
            jsc.iframeAntiHover(true)
        }								 
    
        function iconDrag(e) {
            e = e || window.event
            e.preventDefault()
            
            //calculate new cursor position:
            pos1 = pos3 - e.clientX
            pos2 = pos4 - e.clientY
            pos3 = e.clientX
            pos4 = e.clientY
    
            system.mem.var.dragging = true
            
            
            //managing selected icons
            for (icon of desktop.pocket){
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
            jsc.iframeAntiHover(false)
            
            let iconsToValidate = []
    
            //send all icons to position evaluation
            for (icon of desktop.pocket){
                if (cfg.desktop.grid.enabled && icon.stat == 2) {
                    iconsToValidate.push(icon)
                }
            }
            mem.repositionIcons(iconsToValidate, true, true)
    
            //update HTML of icons after evaluation
            for (icon of desktop.pocket){
                icon.poseNode()
                icon.statNode(1)
            }
            
            //unselect other folders on mouseup W/O drag UNLESS ctrl
            if(e.ctrlKey == false && system.mem.var.dragging == false && e.button == 0) {
                for (icon of desktop.pocket){
                    if (icon != _this) desktop.pocket = desktop.pocket.remove(icon)
                    icon.statNode(0)
                    icon.highlight(false)
                }
                _this.statNode(1)
            } else {
                for (icon of desktop.pocket){
                    icon.highlight(false)
                }
                _this.statNode(1)
            }
            
            system.mem.var.dragging = false
        }
    }
    gray(coin){
        if ( coin ) {
            this.node?.classList.add("blur")
        } else {
            this.node?.classList.remove("blur")      
        }
    }
    highlight(coin) {
        if (coin) {
            this.node.classList.add("highlight")
            return
        } 
        this.node.classList.remove("highlight")
    }
    rename(e){
        let iconText = this.node.childNodes[1]
        let editFile = File.at(this.file)
        let editFrom = File.at(editFile.conf.from)
        let thisIcon = this
        //make h3 editable --------------------|
        iconText.setAttribute("contenteditable", "true")
        iconText.setAttribute("spellcheck", "false")
        
        //select h3 content --------------------|
        let exte = iconText.innerText.match(/\.(?:.(?<!\.))+$/s)
        exte = (exte!=null && exte.length > 0) ? exte[0] : ""
        this.statNode(1)
        this.stat = 0
        jsc.selectText(iconText,0, iconText.innerText.replace(exte,"").length)
    
        iconText.style.textShadow = "none"
        iconText.style.display = "block"
    
        //restore -> leave icon unmodified
        document.body.oncontextmenu = iconRenamingRestore
        window.onkeydown = (e) => {if(e.key == "Escape"){
            iconRenamingRestore()
            return false
        }}
        function iconRenamingRestore(){
            system.mem.var.shSelect = true
            
            thisIcon.statNode()
    
            iconText.textContent = thisIcon.name
            iconText.setAttribute("contenteditable", "false");
            iconText.style.backgroundColor = ""
            iconText.style.textShadow = ""
    
            iconText.blur();
            jsc.clearSelection();
    
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
                !jsc.iconNameExists(iconText.textContent, editFile.conf.icon, editFrom) &&
                jsc.validIconName(iconText.textContent)
            ) {
                //if the name is allowed --------------------|
                system.mem.var.shSelect = true;
    
                if (editFrom === plexos.vtx) thisIcon.node.id = "Icon: "+iconText.textContent
                
                iconText.setAttribute("contenteditable", "false")
                editFile.conf.icon.name = iconText.textContent
                thisIcon.node.setAttribute("title", iconText.textContent)
                iconText.style.backgroundColor = ""
                iconText.style.textShadow = ""
    
                //insert into fylesystem
                if (iconText.textContent != editFile.name) { //if the name changed
                    if (editFrom === plexos.vtx){
                        Task.openInstance("Desktop").mem.getIcon(editFile.name).file = editFrom.conf.addr +"/"+ iconText.textContent
                        Task.openInstance("Desktop").mem.getIcon(editFile.name).name = iconText.textContent
                    }
                    editFile.rename(iconText.textContent)
                    if (thisIcon.task) {
                        taskid = thisIcon.task
                        task   = Task.id(taskid)
                        task.mem.iconArray = task.mem.iconArray.remove(thisIcon)
                        document.getElementsByClassName("list ID_"+taskid)[0].removeChild(thisIcon.node)
    
                        editFile.render(taskid)
                        thisIcon = task.mem.iconArray[task.mem.iconArray.length-1]
    
                        for (icon of task.mem.iconArray) {
                            if (icon.name == iconText.textContent) {
                                icon.statNode(1)
                                task.pocket.push(icon)
                            }
                        }
                    }
                }
    
                thisIcon.statNode(0)
                iconText.blur()
                jsc.clearSelection()
    
                nullifyOnEvents(iconText)
            } else {
                //if the name not allowed --------------------|
                system.mem.var.shSelect = false
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
                        for (icon of Task.id(thisIcon.task).mem.iconArray){
                            icon.statNode(0)
                            Task.id(thisIcon.task).pocket = Task.id(thisIcon.task).pocket.remove(icon)
                        }
                    } else {
                        for (icon of Task.openInstance("Desktop")?.mem.iconArr){
                            icon.statNode(0)
                            Task.openInstance("Desktop").pocket = Task.openInstance("Desktop").pocket.remove(icon)
                        }
                    }
                    thisIcon.statNode(1)
                    thisIcon.stat = 0
    
                    jsc.selectText(iconText)
                }
            }
        }
        }, 0) //TIMEOUT
    }
}

//icon behavior------------------------------------------------------------------------|
mem.repositionIcons = function(icons, mustSet = false, hasPrev = true){
    let w = cfg.desktop.grid.width
    let h = cfg.desktop.grid.height
    let wm = (cfg.desktop.grid.modHmargin == 0) ? cfg.desktop.grid.hMargin : cfg.desktop.grid.modHmargin
    let hm = (cfg.desktop.grid.modVmargin == 0) ? cfg.desktop.grid.vMargin : cfg.desktop.grid.modVmargin
    
    let invalidIcons = []
    let iconAmount   = icons.length

    for(icon of icons) validateIconPosition(icon)

    function validateIconPosition(icon){
        let coords = icon.coor
        //find closest grid for its tPos
        x = Math.round((coords.tx + desktop.node.scrollLeft - wm)/(w + wm))*(w + wm) + wm
        y = Math.round((coords.ty + desktop.node.scrollTop  - hm)/(h + hm))*(h + hm) + hm
        
        //get its spot in grid array
        tx = Math.round((x - wm)/(w + wm))
        ty = Math.round((y - hm)/(h + hm))

        if(desktop.mem.grid.gridAvailable(tx, ty)) {
            //if object exists and is not used (valid position)
            let newGrid = desktop.mem.grid.gridArr[tx][ty]
    
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

        if (desktop.mem.grid.gridArr[px]) {
             if(desktop.mem.grid.gridArr[px][py]) {
                oldGrid = desktop.mem.grid.gridArr[px][py]
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
            newGrid = mem.orderIconPosition()
            if (newGrid === undefined) return
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

    if(cfg.audio.icons && system.mem.var.dragging) {
        if(invalidIcons.length == iconAmount) {
            plexos.Sound[1].play()
        } else if (invalidIcons.length == 0) {
            plexos.Sound[2].play()
        } else {
            plexos.Sound[3].play()
        }
    }
}

mem.orderIconPosition = function(){
    for (x = 0; x < desktop.mem.grid.gridArr.length; x++){
        for(y = 0; y < desktop.mem.grid.gridArr[x].length; y++){
            if (desktop.mem.grid.gridArr[x][y].used == false){
                return [desktop.mem.grid.gridArr[x][y],x,y]
            }
        }
    }
}