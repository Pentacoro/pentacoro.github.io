class IconDir {
    constructor(imag, text, task, apps, file){
        this.stat = 0
        this.file = file
        this.imag = imag
        this.text = text
        this.apps = apps
        this.task = task

        this.drop = []
    }
    createNode(){
        //Icon HTML structure-----|
        let newIcon = document.createElement("div")
        newIcon.setAttribute("class", "explorerIcon ID_"+this.task)

        let newIconImage = document.createElement("div")
        newIconImage.setAttribute("class", "explorerIconImage ID_"+this.task)
        newIconImage.setAttribute("style", this.imag)
        newIcon.appendChild(newIconImage)

        let newIconText = document.createElement("span")
        newIconText.setAttribute("class", "explorerIconText ID_"+this.task)
        let newIconTextNode = document.createTextNode(this.text)
        newIconText.appendChild(newIconTextNode)
        newIcon.appendChild(newIconText)

        document.getElementsByClassName("list ID_"+this.task)[0].appendChild(newIcon)
        //------------------------|

        this.node = newIcon
    
        this.statNode()
        this.clic()
    }
    deleteNode(){
        this.node.parentNode.removeChild(this.node)
    
        findTask(this.task).pocket = findTask(this.task).pocket.remove(this)
        findTask(this.task).mem.iconArray = findTask(this.task).mem.iconArray.remove(this)
    
        if (addrObj(addrObj(this.file).conf.from) === sys.vertex) { //delete desktop icon if file is from vertex
            let rawr = addrObj(this.file).conf.icon
            rawr.deleteNode()
        }
    }
    statNode(num){
        //0 => unselected | 1 => selected | 2 => moving
        this.stat = (num != undefined) ? num : this.stat

        switch(this.stat){
            case 0:
                this.node.classList.remove("active")
                this.node.classList.remove("moving")
                break
            case 1:
                this.node.classList.remove("moving")
                if(!this.node.classList.contains("active")) this.node.className += " active"
                break
            case 2: 
                if(!this.node.classList.contains("moving")) this.node.className += " moving"
                break
            default: 
        }
    }
    drag(e){
        dragMouseDown(e, this.node, this)

        function dragMouseDown(e, node, _this) {
            e = e || window.event
            e.preventDefault()
            
            //when mousedown on selected icon
            if (_this.stat === 1) {
                //managing selected icons
                for (icon of findTask(_this.task).pocket) {
                    //light up all hover border onmousedown:-|
                    highlight(icon.node)
                    //---------------------------------------|
                }
            } else {
                if (system.mem.var.shSelect == true && !system.mem.var.dragging) {
                    //light up 1 hover border onmousedown:
                    highlight(node)
                    
                    //when mousedown on unselected icon
                    if(!keyPressCtrl) {
                        for (icon of findTask(_this.task).pocket){
                            findTask(_this.task).pocket = findTask(_this.task).pocket.remove(icon)
                            icon.statNode(0)
                            lowlight(icon.node)
                        }
                        findTask(_this.task).pocket.push(_this)
                        _this.statNode(1)
                        highlight(node)
                    } else if(keyPressCtrl) {
                        findTask(_this.task).pocket.push(_this)
                        _this.statNode(1)
                        highlight(node)
                    }
                }
            }
    
            document.onmousemove = e => dragMouseMove(e, node)
            document.onmouseup   = e => dragMouseEnd(e, node)
    
            function dragMouseMove(e, node) {
                e.preventDefault()

                for (icon of findTask(_this.task).pocket){
                    icon.statNode(2)
                }

                if (document.getElementById("godGrasp").children.length === 0) {
                    //make pocket representation on godGrasp--------||
                    let pockImg = (findTask(_this.task).pocket.length > 3) ? 3 : findTask(_this.task).pocket.length
    
                    let iconShip = document.createElement("div")
                    iconShip.setAttribute("class", "iconShip")

                    let iconShipImg = document.createElement("div")
                    iconShipImg.setAttribute("class", "iconShipImg")
                    if (pockImg === 1) {
                        iconShipImg.setAttribute("style", _this.imag+"; background-size: 68%;")
                    } else {
                        iconShipImg.setAttribute("style", "background-image: url('./assets/svg/miscUI/pocket_ship_"+pockImg+".svg')")
                    }
    
                    let iconShipSize = document.createElement("div")
                    iconShipSize.setAttribute("class", "iconShipSize")
                    iconShipSize.innerHTML = "<span>" + findTask(_this.task).pocket.length + "</span>"
    
                    iconShip.appendChild(iconShipSize)
                    iconShip.appendChild(iconShipImg)
                    document.getElementById("godGrasp").appendChild(iconShip)
                    //----------------------------------------------||
                } else {
                    let iconShip = document.getElementById("godGrasp").children[0]

                    iconShip.style.top  = e.clientY - iconShip.offsetHeight/2 + "px"
                    iconShip.style.left = e.clientX - iconShip.offsetWidth/2  + "px"
                }

    
                system.mem.var.dragging = true
            }
    
            function dragMouseEnd(e, node) {
                e.preventDefault()
                document.onmousemove = null
                document.onmouseup   = null

                //empty godGrasp
                document.getElementById("godGrasp").innerHTML = ""
    
                //unselect other folders on mouseup W/O drag UNLESS ctrl
                if(keyPressCtrl == false && system.mem.var.dragging == false && e.button == 0) {
                    for (icon of findTask(_this.task).pocket){
                        findTask(_this.task).pocket = findTask(_this.task).pocket.remove(icon)
                        icon.statNode(0)
                        lowlight(icon.node)
                    }
                    _this.statNode(1)
                    findTask(_this.task).pocket.push(_this)
                } else {
                    for (icon of findTask(_this.task).pocket){
                        icon.statNode(1)
                        lowlight(icon.node)
                    }
                }
                system.mem.var.dragging = false
            }
        }
    }
    clic(){
        this.node.onmousedown = e => this.drag(e)
        this.node.oncontextmenu = e => openMenu(e,this)
        this.node.ondblclick = e => findTask(this.task).mem.explorerInit(this.file, this.task)
    }
}
