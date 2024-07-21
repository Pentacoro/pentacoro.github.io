let task = Task.id("TASKID")
let mem  = task.mem
let desktop = task

desktop.mem.grid = {}
desktop.mem.grid.gridArr = []
desktop.mem.grid.evaluateIconGrid = function (
    e = null,
    a = null, 
    w = null, 
    h = null, 
    wm = null, 
    hm = null, 
    wl = null, 
    hl = null, 
    autowm = null, 
    autohm = null, 
    autowl = null,
    autohl = null,
    dir = null, 
    des = null
){
    //take existing config values if null arguments
    if(w == null) w = cfg.desktop.grid.width 
    if(h == null) h = cfg.desktop.grid.height
    if(wm == null) wm = cfg.desktop.grid.hMargin
    if(hm == null) hm = cfg.desktop.grid.vMargin
    if(wl == null) wl = cfg.desktop.grid.hLength
    if(hl == null) hl = cfg.desktop.grid.vLength
    if(autowm == null) autowm = cfg.desktop.grid.autoHmargin
    if(autohm == null) autohm = cfg.desktop.grid.autoVmargin
    if(autowl == null) autowl = cfg.desktop.grid.autoHlength
    if(autohl == null) autohl = cfg.desktop.grid.autoVlength

    //get some useful booleans
    let wChanged = cfg.desktop.grid.width  !== w
    let hChanged = cfg.desktop.grid.height !== h
    let wmChanged = cfg.desktop.grid.hMargin !== wm
    let hmChanged = cfg.desktop.grid.vMargin !== hm
    let wlChanged = cfg.desktop.grid.hLength !== wl
    let hlChanged = cfg.desktop.grid.vLength !== hl

    //set new values to config
    cfg.desktop.grid.width  = w
    cfg.desktop.grid.height = h
    cfg.desktop.grid.hMargin = wm
    cfg.desktop.grid.vMargin = hm
    cfg.desktop.grid.hLength = wl
    cfg.desktop.grid.vLength = hl
    cfg.desktop.grid.autoHmargin = autowm
    cfg.desktop.grid.autoVmargin = autohm
    cfg.desktop.grid.autoHlength = autowl
    cfg.desktop.grid.autoVlength = autohl
    
    let windowW = desktop.node.offsetWidth
    let windowH = desktop.node.offsetHeight
    
    //optimal number of icons that can fit in a row / column
    let gridHorizontal = Math.round((windowW-(w+wm*3)/2)/(w+wm))
    let gridVertical = Math.round((windowH-(h+hm*3)/2)/(h+hm))
    
    //evaluate optimal margin if enabled
    if(autowm || cfg.desktop.grid.modHmargin > 0){
        ewm = (autowl) ? Math.round(windowW - w * gridHorizontal) / (gridHorizontal+1) : Math.round(windowW - w * wl) / (wl+1)
        if (ewm < wm) ewm = wm
        if (autowm) cfg.desktop.grid.modHmargin = ewm
    } else {
        ewm = wm
    }
    if(autohm || cfg.desktop.grid.modVmargin > 0){
        ehm = (autohl) ? Math.round(windowH - h * gridVertical) / (gridVertical+1) : Math.round(windowH - h * hl) / (hl+1)
        if (ehm < hm) ehm = hm
        if (autohm) cfg.desktop.grid.modVmargin = ehm
    } else {
        ehm = hm
    }

    //get first array and HTML elements if not made yet
    if(desktop.mem.grid.gridArr.length === 0 || a == 0) {
        desktop.mem.grid.gridArr = new Array(gridHorizontal);
        for (var i = 0; i < desktop.mem.grid.gridArr.length; i++) {
            desktop.mem.grid.gridArr[i] = new Array(gridVertical);
        }

        cfg.desktop.grid.hLength = gridHorizontal;
        cfg.desktop.grid.vLength = gridVertical;
        
        //fill each coordinate with an object
        for (x = 0; x < desktop.mem.grid.gridArr.length; x++){
            for(y = 0; y < desktop.mem.grid.gridArr[x].length; y++){
                desktop.mem.grid.gridArr[x][y] = {
                    posX:(x+1) * ewm + x * w,
                    posY:(y+1) * ehm + y * h,
                    arrX: x, arrY: y,
                    widt: w, heig: h, id: "id" + x + "-" + y,
                    used: false, icon: null
                }
                createGridNode(desktop.mem.grid.gridArr[x][y])
            }
        }
    }
    //if updating object is necessary
    if( (wChanged || hChanged || wmChanged || hmChanged || autowm || autohm) || a == 2) {
    
        //if the grid app is open update graph
        if (document.getElementsByClassName("grid_graph")) {
            if (document.getElementsByClassName("grid_graph")[0]) {
                if (cfg.desktop.grid.autoHmargin) document.getElementsByClassName("grid_graph")[0].children[4].innerText = parseFloat(cfg.desktop.grid.modHmargin).toFixed(2)
                if (cfg.desktop.grid.autoVmargin) document.getElementsByClassName("grid_graph")[0].children[5].innerText = parseFloat(cfg.desktop.grid.modVmargin).toFixed(2)
            }
        }
        

        for (x = 0; x < desktop.mem.grid.gridArr.length; x++){
            for(y = 0; y < desktop.mem.grid.gridArr[x].length; y++){
                desktop.mem.grid.gridArr[x][y].posX = (x+1) * ewm + x * w
                desktop.mem.grid.gridArr[x][y].posY = (y+1) * ehm + y * h
                desktop.mem.grid.gridArr[x][y].widt = w
                desktop.mem.grid.gridArr[x][y].heig = h
                updateGridNode(desktop.mem.grid.gridArr[x][y])

                if(desktop.mem.grid.gridArr[x][y].icon){
                    desktop.mem.grid.gridArr[x][y].icon.coor.px = desktop.mem.grid.gridArr[x][y].posX
                    desktop.mem.grid.gridArr[x][y].icon.coor.py = desktop.mem.grid.gridArr[x][y].posY
                    desktop.mem.grid.gridArr[x][y].icon.coor.tx = desktop.mem.grid.gridArr[x][y].posX
                    desktop.mem.grid.gridArr[x][y].icon.coor.ty = desktop.mem.grid.gridArr[x][y].posY
                    desktop.mem.grid.gridArr[x][y].icon.poseNode()
                }
            }
        }
    }
    //if array lengths change
    if( (autowl == true || autohl == true || wlChanged || hlChanged) || a == 1) {
        let gridArrX = null
        let gridArrY = null
        if(desktop.mem.grid.gridArr) gridArrX = desktop.mem.grid.gridArr.length
        if(desktop.mem.grid.gridArr[0]) gridArrY = desktop.mem.grid.gridArr[0].length

        if (cfg.desktop.grid.modHmargin > 0){
            ewm = cfg.desktop.grid.modHmargin - 0.001
            gridHorizontal = Math.round((windowW*1-(w+ewm*3)/2)/(w+ewm))
        }
        if (cfg.desktop.grid.modVmargin > 0){
            ehm = cfg.desktop.grid.modVmargin - 0.001
            gridVertical = Math.round((windowH*1-(h+ehm*3)/2)/(h+ehm)); 
        }

        let gridHdiff = (autowl) ? gridHorizontal - gridArrX : wl - gridArrX
        let gridVdiff = (autohl) ? gridVertical - gridArrY : hl - gridArrY
        
        let gridHFinal= (autowl) ? gridHorizontal : wl
        let gridVFinal= (autohl) ? gridVertical : hl

        //if the grid app is open update values
        if(document.getElementById("hLength")) document.getElementById("hLength").innerText = gridHFinal
        if(document.getElementById("vLength")) document.getElementById("vLength").innerText = gridVFinal

        if(autowl == true || wlChanged || a == 1) {
            //if shorter row
            if (gridHdiff < 0){
                handleShorterRow()
            }
            //if longer row
            if (gridHdiff > 0 && gridVdiff >= 0){
                handleLongerRow()
            }
        }

        if(autohl == true || hlChanged || a == 1) {
            //if shorter column 
            if (gridVdiff < 0){
                handleShorterColumn()
                if(gridHdiff > 0) handleLongerRow()
            }
            //if longer column
            if (gridVdiff > 0){
                handleLongerColumn()
            }   
        }

        function handleShorterRow(){
            cfg.desktop.grid.hLength = gridHFinal;

            let iconsForShiftLate = []

            for (i = 0; i > gridHdiff; i--) {
                let delColumns = desktop.mem.grid.gridArr.splice(gridHFinal+(gridHdiff*-1 + i - 1), 1)
                delColumns.forEach(column => {
                    column.forEach(object => {
                        let objectNode = document.getElementById(object.id)
                        objectNode.parentElement.removeChild(objectNode)

                        /*if(object.icon){*/
                        if(object.icon && cfg.desktop.grid.sendBorder){
                            iconsForShift = []

                            iconsForShift.push(object.icon)

                            let checkNextSlot = function(obj) {
                                nextSlot = (obj.arrX != 0) ? desktop.mem.grid.gridArr[obj.arrX - 1][obj.arrY] : {icon: null}
                                if (nextSlot.icon) {
                                    iconsForShift.push(nextSlot.icon)
                                    checkNextSlot(nextSlot)
                                } else if (obj.arrX != 0) {
                                    for(icon of iconsForShift) {
                                        icon.coor.tx = icon.coor.tx - w - ewm
                                        if (icon.coor.ax < gridHFinal+(gridHdiff*-1 + i - 1)) {
                                            desktop.mem.grid.gridArr[icon.coor.ax][icon.coor.ay].icon = null
                                            desktop.mem.grid.gridArr[icon.coor.ax][icon.coor.ay].used = false
                                        }
                                    }
                                    mem.repositionIcons(iconsForShift,true,false)
                                    for(icon of iconsForShift) {
                                        icon.poseNode()
                                        icon.statNode()
                                    }
                                } else if (obj.arrX == 0) {
                                    iconsForShiftLate.push(iconsForShift[0])
                                }
                            }
                            checkNextSlot(object)
                        } else if (object.icon) {
                            iconsForShift = [object.icon]
                            mem.repositionIcons(iconsForShift,true,false)
                            for(icon of iconsForShift) {
                                icon.poseNode()
                                icon.statNode()
                            }
                        }
                    })
                })
                mem.repositionIcons(iconsForShiftLate,true,false)
                for(icon of iconsForShiftLate) {
                    icon.poseNode()
                    icon.statNode()
                }
            }
        }
        function handleLongerRow(){
            cfg.desktop.grid.hLength = gridHFinal
            for (x = desktop.mem.grid.gridArr.length; x < gridHFinal; x++){
                desktop.mem.grid.gridArr.push(new Array(gridVFinal))
                for(y = 0; y < desktop.mem.grid.gridArr[x].length; y++){
                    desktop.mem.grid.gridArr[x][y] = {
                        posX:(x+1) * ewm + x * w,
                        posY:(y+1) * ehm + y * h,
                        arrX: x, arrY: y,
                        widt: w, heig: h, id: "id" + x + "-" + y,
                        used: false, icon: null
                    }
                    createGridNode(desktop.mem.grid.gridArr[x][y])
                }
            }

            desktop.mem.grid.gridArr[gridHFinal - gridHdiff - 1].forEach(object => {
                if(object.icon && cfg.desktop.grid.sendBorder){
                    iconsForShift = []

                    iconsForShift.push(object.icon)

                    let checkNextSlot = function(obj) {
                        nextSlot = (obj.arrX != 0) ? desktop.mem.grid.gridArr[obj.arrX - 1][obj.arrY] : {icon: null}
                        if (nextSlot.icon) {
                            iconsForShift.push(nextSlot.icon)
                            checkNextSlot(nextSlot)
                        } else if (obj.arrX != 0) {
                            for(icon of iconsForShift) {
                                icon.coor.tx = icon.coor.tx + w*gridHdiff + ewm*gridHdiff
                                if (icon.coor.ax < gridHFinal) {
                                    desktop.mem.grid.gridArr[icon.coor.ax][icon.coor.ay].icon = null
                                    desktop.mem.grid.gridArr[icon.coor.ax][icon.coor.ay].used = false
                                }
                            }
                            mem.repositionIcons(iconsForShift,true,true)
                            for(icon of iconsForShift) {
                                icon.poseNode()
                                icon.statNode()
                            }
                        } else if (obj.arrX == 0) {
                            return
                        }
                    }
                    checkNextSlot(object)
                }
            })
        }
        function handleShorterColumn(){
            cfg.desktop.grid.vLength = gridVFinal

            let iconsForShiftLate = []

            desktop.mem.grid.gridArr.forEach(column => {

                for (i = 0; i > gridVdiff; i--) {
                    let delRows = column.splice(gridVFinal+(gridVdiff*-1 + i - 1), 1)
                    delRows.forEach(object =>{

                        let objectNode = document.getElementById(object.id); 
                        objectNode.parentElement.removeChild(objectNode);

                        /*if(object.icon){
                            dlteIconNode(object.icon, true)
                        }*/
                        if(object.icon && cfg.desktop.grid.sendBorder){
                            iconsForShift = []

                            iconsForShift.push(object.icon)

                            let checkNextSlot = function(obj) {
                                nextSlot = (obj.arrY != 0) ? desktop.mem.grid.gridArr[obj.arrX][obj.arrY - 1] : {icon: null}
                                if (nextSlot.icon) {
                                    iconsForShift.push(nextSlot.icon)
                                    checkNextSlot(nextSlot)
                                } else if (obj.arrY != 0) {
                                    for(icon of iconsForShift) {
                                        icon.coor.ty = icon.coor.ty - h - ehm
                                        if (icon.coor.ay < gridVFinal+(gridVdiff*-1 + i - 1)) {
                                            desktop.mem.grid.gridArr[icon.coor.ax][icon.coor.ay].icon = null
                                            desktop.mem.grid.gridArr[icon.coor.ax][icon.coor.ay].used = false
                                        }
                                    }
                                    mem.repositionIcons(iconsForShift,true,false)
                                    for(icon of iconsForShift) {
                                        icon.poseNode()
                                        icon.statNode()
                                    }
                                } else if (obj.arrY == 0) {
                                    iconsForShiftLate.push(iconsForShift[0])
                                }
                            }
                            checkNextSlot(object)
                        } else if (object.icon) {
                            iconsForShift = [object.icon]
                            mem.repositionIcons(iconsForShift,true,false)
                            for(icon of iconsForShift) {
                                icon.poseNode()
                                icon.statNode()
                            }
                        }
                    })
                }
            })
            mem.repositionIcons(iconsForShiftLate,true,false)
            for(icon of iconsForShiftLate) {
                icon.poseNode()
                icon.statNode()
            }
        }
        function handleLongerColumn(){
            cfg.desktop.grid.vLength = gridVFinal
            for (x = 0; x < desktop.mem.grid.gridArr.length; x++){
                for(y = desktop.mem.grid.gridArr[x].length; y < gridVFinal; y++){
                    desktop.mem.grid.gridArr[x].push({
                        posX:(x+1) * ewm + x * w,
                        posY:(y+1) * ehm + y * h,
                        arrX: x, arrY: y,
                        widt: w, heig: h, id: "id" + x + "-" + y,
                        used: false, icon: null
                    })
                    createGridNode(desktop.mem.grid.gridArr[x][y]);
                }
            }
            desktop.mem.grid.gridArr.forEach(column => {
                let object = column[gridVFinal - gridVdiff - 1]
                if(object.icon && cfg.desktop.grid.sendBorder){
                    iconsForShift = []

                    iconsForShift.push(object.icon)

                    let checkNextSlot = function(obj) {
                        nextSlot = (obj.arrY != 0) ? desktop.mem.grid.gridArr[obj.arrX][obj.arrY - 1] : {icon: null}
                        if (nextSlot.icon) {
                            iconsForShift.push(nextSlot.icon)
                            checkNextSlot(nextSlot)
                        } else if (obj.arrY != 0) {
                            for(icon of iconsForShift) {
                                icon.coor.ty = icon.coor.ty + h*gridVdiff + ehm*gridVdiff
                                if (icon.coor.ay < gridVFinal) {
                                    desktop.mem.grid.gridArr[icon.coor.ax][icon.coor.ay].icon = null
                                    desktop.mem.grid.gridArr[icon.coor.ax][icon.coor.ay].used = false
                                }
                            }
                            mem.repositionIcons(iconsForShift,true,true)
                            for(icon of iconsForShift) {
                                icon.poseNode()
                                icon.statNode()
                            }
                        } else if (obj.arrX == 0) {
                            return
                        }
                    }
                    checkNextSlot(object)
                }
            })
        }

        if (Task.openInstance("Settings")) {
            let task = Task.openInstance("Settings")
            if (task.mem.UpdateGraph2) task.mem.UpdateGraph2()
            
            if (document.getElementsByClassName(task.id+".grid_graph")[1]) {
                document.getElementsByClassName(task.id+".grid_graph")[1].children[0].children[0].innerText = cfg.desktop.grid.hLength
                document.getElementsByClassName(task.id+".grid_graph")[1].children[1].innerText = cfg.desktop.grid.vLength
            }
        }
    }

    desktop.mem.grid.checkGridGap()

    //graph array elements on the DOM
    function createGridNode(object) {
        let gridLayer = document.getElementById("gridLayer")

        let newGrid = document.createElement("div")
        newGrid.setAttribute("id", object.id)
        newGrid.setAttribute("class", "gridElement")
        newGrid.style.left = object.posX + "px"
        newGrid.style.top = object.posY + "px"
        newGrid.style.width = object.widt + "px"
        newGrid.style.height = object.heig + "px"

        newGrid.style.position = "absolute"
        newGrid.style.zIndex = "-980"
        newGrid.style.pointerEvents = "none"

        newGrid.style.borderRadius = cfg.desktop.grid.borderRadius + "px"
        if (cfg.desktop.grid.visibleNodes === true) newGrid.style.backgroundColor = "rgba(127,127,127,0.5)"
        if (cfg.desktop.grid.visibleNodes === false)newGrid.style.backgroundColor = "rgba(127,127,127,0)"

        gridLayer.appendChild(newGrid)
    }
    function updateGridNode(object) {
        let updGrid = document.getElementById(object.id);
        updGrid.style.left = object.posX + "px"
        updGrid.style.top = object.posY + "px"
        updGrid.style.width = object.widt + "px"
        updGrid.style.height = object.heig + "px"
        if (cfg.desktop.grid.visibleNodes === true) updGrid.style.backgroundColor = "rgba(127,127,127,0.5)"
        if (cfg.desktop.grid.visibleNodes === false)updGrid.style.backgroundColor = "rgba(127,127,127,0)"
    }
}

desktop.mem.grid.realTimeGridEval = function(margin = null, length = null){
    if(margin == null) margin = cfg.desktop.grid.autoHmargin
    if(length == null) length = cfg.desktop.grid.autoHlength

    if(margin || length){
        desktop.mem.grid.evaluateIconGrid()
        window.addEventListener("resize",desktop.mem.grid.evaluateIconGrid)
        return
    }
    window.removeEventListener("resize",desktop.mem.grid.evaluateIconGrid)
}

desktop.mem.grid.gridAvailable = function(x, y){
    if(desktop.mem.grid.gridExists(x, y)){
        if(desktop.mem.grid.gridArr[x][y].used == false) return true
    }
    return false
}
desktop.mem.grid.gridExists = function(x, y){
    if(desktop.mem.grid.gridArr[x]){
        if(desktop.mem.grid.gridArr[x][y]) return true
    }
    return false
}

desktop.mem.grid.checkGridGap = function() {
    let w = cfg.desktop.grid.width
    let h = cfg.desktop.grid.height
    let ewm = (cfg.desktop.grid.modHmargin) ? cfg.desktop.grid.modHmargin : cfg.desktop.grid.hMargin
    let ehm = (cfg.desktop.grid.modVmargin) ? cfg.desktop.grid.modVmargin : cfg.desktop.grid.vMargin
    let wl = cfg.desktop.grid.hLength
    let hl = cfg.desktop.grid.vLength

    if (gridLayer.getElementsByClassName("gap horizontalGap").length === 0) {
        let newGap = document.createElement("div")
        newGap.setAttribute("class","gap horizontalGap")
        gridLayer.appendChild(newGap)
    }
    let gapH = gridLayer.getElementsByClassName("gap horizontalGap")[0]
    
    gapH.style.left   = (w + ewm) * wl + "px"
    gapH.style.width  = ewm - 0.1 + "px"
    gapH.style.height = (h + ehm) * hl + "px"

    if (gridLayer.getElementsByClassName("gap verticalGap").length === 0) {
        let newGap = document.createElement("div")
        newGap.setAttribute("class","gap verticalGap")
        gridLayer.appendChild(newGap)
    }
    let gapV = gridLayer.getElementsByClassName("gap verticalGap")[0]
    
    gapV.style.top    = (h + ehm) * hl + "px"
    gapV.style.height = ehm - 0.1 + "px"
    gapV.style.width  = (w + ewm) * wl + "px"    
}

desktop.mem.grid.autoLength = function() {
    cfg.desktop.grid.autoHlength = true
    cfg.desktop.grid.autoVlength = true
    desktop.mem.grid.evaluateIconGrid(null,1)
    //deskGrid_UpdateGraph2()
    cfg.desktop.grid.autoHlength = false
    cfg.desktop.grid.autoVlength = false
}
desktop.mem.grid.autoMargin = function() {
    cfg.desktop.grid.autoHmargin = true
    cfg.desktop.grid.autoVmargin = true
    //deskGrid_UpdateGraphAuto()
    desktop.mem.grid.evaluateIconGrid(null,1)
    cfg.desktop.grid.autoHmargin = false
    cfg.desktop.grid.autoVmargin = false
}