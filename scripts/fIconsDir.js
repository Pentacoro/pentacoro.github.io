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
        crteIconDirNode(this)
    }
    deleteNode(){
        dlteIconDirNode(this)
    }
    statNode(num){
        statIconDirNode(this.node, this, num)
    }
    drag(){
        dragIconDir(this.node, this)
    }
    menu(){
        menuIconDir(this.node, this)
    }
}

function crteIconDirNode(_this) {
        //Icon HTML structure-----|
        let newIcon = document.createElement("div")
        newIcon.setAttribute("class", "explorerIcon ID_"+_this.task)

        let newIconImage = document.createElement("div")
        newIconImage.setAttribute("class", "explorerIconImage ID_"+_this.task)
        newIconImage.setAttribute("style", _this.imag)
        newIcon.appendChild(newIconImage)

        let newIconText = document.createElement("span")
        newIconText.setAttribute("class", "explorerIconText ID_"+_this.task)
        let newIconTextNode = document.createTextNode(_this.text)
        newIconText.appendChild(newIconTextNode)
        newIcon.appendChild(newIconText)

        document.getElementsByClassName("list ID_"+_this.task)[0].appendChild(newIcon)
        //------------------------|

    _this.node = newIcon

    _this.statNode()
    _this.drag()
    _this.menu()
}
function dragIconDir(node, _this){

    node.onmousedown = e => dragMouseDown(e, node, _this)

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
            if (shouldSelect == true && !dragging) {
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

            dragging = true
        }

        function dragMouseEnd(e, node) {
            e.preventDefault()
            document.onmousemove = null
            document.onmouseup   = null

            //unselect other folders on mouseup W/O drag UNLESS ctrl
            if(keyPressCtrl == false && dragging == false && e.button == 0) {
                for (icon of findTask(_this.task).pocket){
                    findTask(_this.task).pocket = findTask(_this.task).pocket.remove(icon)
                    icon.statNode(0)
                    lowlight(icon.node)
                }
                _this.statNode(1)
                findTask(_this.task).pocket.push(_this)
            } else {
                for (icon of findTask(_this.task).pocket){
                    lowlight(icon.node)
                }

                _this.statNode(1)
            }
            dragging = false
        }
    }
}

function menuIconDir(node, _this) {
    node.oncontextmenu = e => openMenu(e,_this)
}

function dlteIconDirNode(_this) {
    let delIcon = _this.node
    delIcon.parentNode.removeChild(delIcon);

    findTask(_this.task).pocket = findTask(_this.task).pocket.remove(_this)
    findTask(_this.task).mem.iconArray = findTask(_this.task).mem.iconArray.remove(_this)

    if (addrObj(addrObj(_this.file).conf.from) === currentVertex) { //delete desktop icon if file is from vertex
        let rawr = addrObj(_this.file).conf.icon
        rawr.deleteNode()
        deskRefresh(null, desktop)
    }
}


function statIconDirNode(node, _this, num) {
    //0 => unselected | 1 => selected | 2 => moving
    _this.stat = (num != undefined) ? num : _this.stat

    switch(_this.stat){
        case 0:
            node.classList.remove("active")
            break
        case 1:
            if(!node.classList.contains("active")) node.className += " active"
            break
        case 2: 

            break
        default: 
    }
}
