import Task from "/plexos/lib/classes/system/task.js"
import File from "/plexos/lib/classes/filesystem/file.js"

let task    = Task.id(/TASKID/)
let desktop = task
let mem     = task.mem
let cfg     = mem.cfg

mem.grid = {}
mem.grid.gridArr = []
mem.grid.evaluateIconGrid = function (
    a = null, 
){
    //take existing config values
    let w      = cfg.grid.width 
    let h      = cfg.grid.height
    let wm     = cfg.grid.hMargin
    let hm     = cfg.grid.vMargin
    let ewm    = null
    let ehm    = null
    let wl     = cfg.grid.hLength
    let hl     = cfg.grid.vLength
    let autowm = cfg.grid.autoHmargin
    let autohm = cfg.grid.autoVmargin
    let autowl = cfg.grid.autoHlength
    let autohl = cfg.grid.autoVlength
    
    let windowW = desktop.node.offsetWidth
    let windowH = desktop.node.offsetHeight

    //check open instance of grid settings
    let gridSettings = Task.get("Desktop Grid Settings")
    if (!gridSettings) cfg.grid.visibleNodes = false

    //set margin to modified margins if set without auto
    if (cfg.grid.modHmargin && !autowm) wm = cfg.grid.modHmargin
    if (cfg.grid.modVmargin && !autohm) hm = cfg.grid.modVmargin
    
    //evaluate optimal grid length if enabled
    let gridHorizontal = Math.round((windowW-(w+wm*3)/2)/(w+wm))
    let gridVertical = Math.round((windowH-(h+hm*3)/2)/(h+hm))

    let gridArrX = null
    let gridArrY = null
    if(desktop.mem.grid.gridArr) gridArrX = desktop.mem.grid.gridArr.length
    if(desktop.mem.grid.gridArr[0]) gridArrY = desktop.mem.grid.gridArr[0].length

    let rowsCanContain = (gridHorizontal+1+(gridHorizontal-gridArrX))*(gridVertical) >= mem.iconArr.length
    let colsCanContain = (gridVertical+1+(gridVertical-gridArrY))*(gridHorizontal) >= mem.iconArr.length

    //evaluate optimal margin if enabled
    if(autowm){
        if (
            autowl && 
            (rowsCanContain || 
            cfg.grid.hideOnShrink)
        ) { 
            ewm = Math.round(windowW - w * gridHorizontal) / (gridHorizontal+1)
        } else {
            ewm = Math.round(windowW - w * wl) / (wl+1)
        }
        if (ewm < wm) ewm = wm
        cfg.grid.modHmargin = ewm
    } else {
        ewm = wm
    }
    if(autohm){
        if (
            autohl && 
            (colsCanContain || 
            cfg.grid.hideOnShrink)
        ) { 
            ehm = Math.round(windowH - h * gridVertical) / (gridVertical+1)
        } else {
            ehm = Math.round(windowH - h * hl) / (hl+1)
        }
        if (ehm < hm) ehm = hm
        cfg.grid.modVmargin = ehm
    } else {
        ehm = hm
    }

    //get first array and HTML elements if not made yet
    if(desktop.mem.grid.gridArr.length === 0 || a === 0) {
        desktop.mem.grid.gridArr = new Array(cfg.grid.hLength)
        for (let i = 0; i < desktop.mem.grid.gridArr.length; i++) {
            desktop.mem.grid.gridArr[i] = new Array(cfg.grid.vLength)
        }
        
        //fill each coordinate with an object
        for (let x = 0; x < desktop.mem.grid.gridArr.length; x++){
            for(let y = 0; y < desktop.mem.grid.gridArr[x].length; y++){
                desktop.mem.grid.gridArr[x][y] = {
                    posX:(x+1) * ewm + x * w,
                    posY:(y+1) * ehm + y * h,
                    arrX: x, arrY: y,
                    width : w, height: h, id: "id" + x + "-" + y,
                    used: false, icon: null
                }
                createGridNode(desktop.mem.grid.gridArr[x][y])
            }
        }
    }
    //if auto margin is on
    if( (autowm || autohm) || a === 2 || a === 3) shiftTiles()
    //if auto length is on
    if( (autowl || autohl) || a == 1 || a === 3) {
        let gridArrX = null
        let gridArrY = null
        if(desktop.mem.grid.gridArr) gridArrX = desktop.mem.grid.gridArr.length
        if(desktop.mem.grid.gridArr[0]) gridArrY = desktop.mem.grid.gridArr[0].length

        if (cfg.grid.modHmargin > 0 && !autowm){
            ewm = cfg.grid.modHmargin - 0.001
            gridHorizontal = Math.round((windowW*1-(w+ewm*3)/2)/(w+ewm))
        }
        if (cfg.grid.modVmargin > 0  && !autohm){
            ehm = cfg.grid.modVmargin - 0.001
            gridVertical = Math.round((windowH*1-(h+ehm*3)/2)/(h+ehm)); 
        }

        //if (cfg.grid.lastHautoLocked) gridHorizontal = gridArrX
        //if (cfg.grid.lastHautoLocked) gridVertical = gridArrY
    
        let gridHdiff = (autowl) ? gridHorizontal - gridArrX : wl - gridArrX
        let gridVdiff = (autohl) ? gridVertical - gridArrY : hl - gridArrY
        
        let gridHFinal= (autowl) ? gridHorizontal : wl
        let gridVFinal= (autohl) ? gridVertical : hl

        let minRelativeHlength = Math.ceil(mem.iconArr.length/gridVFinal)
        let minRelativeVlength = Math.ceil(mem.iconArr.length/gridHFinal)

        let rowsCanContain = (gridArrX+gridHdiff)*(gridVFinal) >= mem.iconArr.length
        let colsCanContain = (gridArrY+gridVdiff)*(gridHFinal) >= mem.iconArr.length
        let rowsCouldContain = (gridArrX+gridHdiff)*(hl) >= mem.iconArr.length
        let colsCouldContain = (gridArrY+gridVdiff)*(wl) >= mem.iconArr.length
        let autoRowsCouldContain = (gridHorizontal+1+gridHdiff)*(hl) >= mem.iconArr.length
        let autoColsCouldContain = (gridVertical  +1+gridVdiff)*(wl) >= mem.iconArr.length
        let autoCanContain = gridVertical*gridHorizontal >= mem.iconArr.length
        let gridCanContain = gridHFinal*gridVFinal >= mem.iconArr.length

        let iconsForShiftLate = []

        //check for row/column length changes
        if( (autowl) || a == 1 || a === 3) {
            //if shorter row AND still can contain all icons
            if (gridHdiff < 0){
                if ( ( (rowsCanContain) && (gridCanContain || autoRowsCouldContain) ) || cfg.grid.hideOnShrink ) {
                    handleShorterRow()
                    cfg.grid.lastHautoLocked = false
                } else if (!autowl && gridHFinal < minRelativeHlength) {
                    gridHFinal = minRelativeHlength
                    handleShorterRow()
                    cfg.grid.lastHautoLocked = true
                }
            }
            //if longer row
            if (gridHdiff > 0){
                handleLongerRow()
                if (autoCanContain && gridVdiff < 0 && autohl) handleShorterColumn()
            }
        }

        if( (autohl) || a == 1 || a === 3) {
            //if shorter column AND still can contain all icons
            if (gridVdiff < 0){
                if ( ( (colsCanContain) && (gridCanContain || autoColsCouldContain) ) || cfg.grid.hideOnShrink ) {
                    handleShorterColumn()
                    cfg.grid.lastVautoLocked = false
                } else if ( !autohl && gridVFinal < minRelativeVlength) {
                    gridVFinal = minRelativeVlength
                    handleShorterColumn()
                    cfg.grid.lastVautoLocked = true
                }
            }
            //if longer column
            if (gridVdiff > 0){
                handleLongerColumn()
                if (autoCanContain && gridHdiff < 0 && autowl) handleShorterRow()
            }   
        }

        function handleShorterRow(){
            cfg.grid.hLength = gridHFinal
            for (let i = 0; i > gridHdiff; i--) {
                let delColumns = desktop.mem.grid.gridArr.splice(gridHFinal+(gridHdiff*-1 + i - 1), 1)
                delColumns.forEach(column => {
                    column.forEach(object => {
                        let objectNode = document.getElementById(object.id)
                        objectNode.parentElement.removeChild(objectNode)
                        let validatedIcons = []
                        let iconsForShift = []
                        if(object.icon && cfg.grid.stickToBorder){
                            iconsForShift.push(object.icon)
                            let checkNextSlot = function(obj) {
                                let nextSlot = (obj.arrX != 0) ? desktop.mem.grid.gridArr[obj.arrX - 1][obj.arrY] : {icon: null}
                                if (nextSlot.icon) {
                                    iconsForShift.push(nextSlot.icon)
                                    checkNextSlot(nextSlot)
                                } else if (obj.arrX != 0) {
                                    for(let icon of iconsForShift) {
                                        icon.coords.tx = icon.coords.tx - w - ewm
                                        if (icon.coords.ax < gridHFinal+(gridHdiff*-1 + i - 1)) {
                                            desktop.mem.grid.gridArr[icon.coords.ax][icon.coords.ay].icon = null
                                            desktop.mem.grid.gridArr[icon.coords.ax][icon.coords.ay].used = false
                                        }
                                    }
                                    validatedIcons = mem.repositionIcons(iconsForShift,true,false)
                                    for(let icon of validatedIcons) {
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
                            validatedIcons = mem.repositionIcons(iconsForShift,true,false)
                            for(let icon of validatedIcons) {
                                icon.poseNode()
                                icon.statNode()
                            }
                        }
                    })
                })
            }
        }
        function handleLongerRow(){
            cfg.grid.hLength = gridHFinal
            for (let x = desktop.mem.grid.gridArr.length; x < gridHFinal; x++){
                desktop.mem.grid.gridArr.push(new Array(cfg.grid.vLength))
                for(let y = 0; y < desktop.mem.grid.gridArr[x].length; y++){
                    desktop.mem.grid.gridArr[x][y] = {
                        posX:(x+1) * ewm + x * w,
                        posY:(y+1) * ehm + y * h,
                        arrX: x, arrY: y,
                        width : w, height: h, id: "id" + x + "-" + y,
                        used: false, icon: null
                    }
                    createGridNode(desktop.mem.grid.gridArr[x][y])
                }
            }

            desktop.mem.grid.gridArr[gridHFinal - gridHdiff - 1]?.forEach(object => {
                if(object.icon && cfg.grid.stickToBorder){
                    let iconsForShift = []
                    iconsForShift.push(object.icon)
                    let checkNextSlot = function(obj) {
                        let nextSlot = (obj.arrX != 0) ? desktop.mem.grid.gridArr[obj.arrX - 1][obj.arrY] : {icon: null}
                        if (nextSlot.icon) {
                            iconsForShift.push(nextSlot.icon)
                            checkNextSlot(nextSlot)
                        } else if (obj.arrX != 0) {
                            for(let icon of iconsForShift) {
                                icon.coords.tx = icon.coords.tx + w*gridHdiff + ewm*gridHdiff
                                if (icon.coords.ax < gridHFinal) {
                                    desktop.mem.grid.gridArr[icon.coords.ax][icon.coords.ay].icon = null
                                    desktop.mem.grid.gridArr[icon.coords.ax][icon.coords.ay].used = false
                                }
                            }
                            mem.repositionIcons(iconsForShift,true,true)
                            for(let icon of iconsForShift) {
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
            cfg.grid.vLength = gridVFinal
            desktop.mem.grid.gridArr.forEach(column => {
                for (let i = 0; i > gridVdiff; i--) {
                    let delRows = column.splice(gridVFinal+(gridVdiff*-1 + i - 1), 1)
                    delRows.forEach(object =>{
                        let objectNode = document.getElementById(object.id);
                        objectNode.parentElement.removeChild(objectNode)
                        let validatedIcons = []
                        let iconsForShift = []
                        if(object.icon && cfg.grid.stickToBorder){
                            iconsForShift.push(object.icon)
                            let checkNextSlot = function(obj) {
                                let nextSlot = (obj.arrY != 0) ? desktop.mem.grid.gridArr[obj.arrX][obj.arrY - 1] : {icon: null}
                                if (nextSlot.icon) {
                                    iconsForShift.push(nextSlot.icon)
                                    checkNextSlot(nextSlot)
                                } else if (obj.arrY != 0) {
                                    for(let icon of iconsForShift) {
                                        icon.coords.ty = icon.coords.ty - h - ehm
                                        if (icon.coords.ay < gridVFinal+(gridVdiff*-1 + i - 1)) {
                                            desktop.mem.grid.gridArr[icon.coords.ax][icon.coords.ay].icon = null
                                            desktop.mem.grid.gridArr[icon.coords.ax][icon.coords.ay].used = false
                                        }
                                    }
                                    validatedIcons = mem.repositionIcons(iconsForShift,true,false)
                                    for(let icon of validatedIcons) {
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
                            validatedIcons = mem.repositionIcons(validatedIcons,true,false)
                            for(let icon of iconsForShift) {
                                icon.poseNode()
                                icon.statNode()
                            }
                        }
                    })
                }
            })
        }
        function handleLongerColumn(){
            cfg.grid.vLength = gridVFinal
            for (let x = 0; x < desktop.mem.grid.gridArr.length; x++){
                for(let y = desktop.mem.grid.gridArr[x].length; y < gridVFinal; y++){
                    desktop.mem.grid.gridArr[x].push({
                        posX:(x+1) * ewm + x * w,
                        posY:(y+1) * ehm + y * h,
                        arrX: x, arrY: y,
                        width : w, height: h, id: "id" + x + "-" + y,
                        used: false, icon: null
                    })
                    createGridNode(desktop.mem.grid.gridArr[x][y]);
                }
            }
            desktop.mem.grid.gridArr.forEach(column => {
                let object = column[gridVFinal - gridVdiff - 1]
                if(object && object.icon && cfg.grid.stickToBorder){
                    let iconsForShift = []
                    iconsForShift.push(object.icon)
                    let checkNextSlot = function(obj) {
                        let nextSlot = (obj.arrY != 0) ? desktop.mem.grid.gridArr[obj.arrX][obj.arrY - 1] : {icon: null}
                        if (nextSlot.icon) {
                            iconsForShift.push(nextSlot.icon)
                            checkNextSlot(nextSlot)
                        } else if (obj.arrY != 0) {
                            for(let icon of iconsForShift) {
                                icon.coords.ty = icon.coords.ty + h*gridVdiff + ehm*gridVdiff
                                if (icon.coords.ay < gridVFinal) {
                                    desktop.mem.grid.gridArr[icon.coords.ax][icon.coords.ay].icon = null
                                    desktop.mem.grid.gridArr[icon.coords.ax][icon.coords.ay].used = false
                                }
                            }
                            mem.repositionIcons(iconsForShift,true,true)
                            for(let icon of iconsForShift) {
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

        if (iconsForShiftLate.length > 0){
            let validatedIcons = mem.repositionIcons(iconsForShiftLate,true,false)
            for(let icon of validatedIcons) {
                icon.poseNode()
                icon.statNode()
            }
        }

        task.emit("desktop-grid-length-change")

        if(autowm){
            if (
                autowl && 
                (rowsCouldContain || autoCanContain ||
                cfg.grid.hideOnShrink)
            ) { 
                ewm = Math.round(windowW - w * gridHorizontal) / (gridHorizontal+1)
            } else {
                ewm = Math.round(windowW - w * wl) / (wl+1)
            }
            if (ewm < wm) ewm = wm
            cfg.grid.modHmargin = ewm
        } else {
            ewm = wm
        }
        if(autohm){
            if (
                autohl && 
                (colsCouldContain || autoCanContain ||
                cfg.grid.hideOnShrink)
            ) { 
                ehm = Math.round(windowH - h * gridVertical) / (gridVertical+1)
            } else {
                ehm = Math.round(windowH - h * hl) / (hl+1)
            }
            if (ehm < hm) ehm = hm
            cfg.grid.modVmargin = ehm
        } else {
            ehm = hm
        }

        if (autowm || autohm) shiftTiles()
    }

    //draw array elements on the DOM
    function createGridNode(object) {
        let gridLayer = document.getElementById("gridLayer")

        let newGrid = document.createElement("div")
        newGrid.setAttribute("id", object.id)
        newGrid.setAttribute("class", "gridElement")
        newGrid.style.left = object.posX + "px"
        newGrid.style.top = object.posY + "px"
        newGrid.style.width = object.width  + "px"
        newGrid.style.height = object.height + "px"

        newGrid.style.position = "absolute"
        newGrid.style.zIndex = "-980"
        newGrid.style.pointerEvents = "none"

        newGrid.style.borderRadius = cfg.grid.borderRadius + "px"
        if (cfg.grid.visibleNodes === true) newGrid.style.backgroundColor = "rgba(127,127,127,0.5)"
        if (cfg.grid.visibleNodes === false)newGrid.style.backgroundColor = "rgba(127,127,127,0)"

        gridLayer.appendChild(newGrid)
    }
    function updateGridNode(object) {
        let updGrid = document.getElementById(object.id);
        updGrid.style.left = object.posX + "px"
        updGrid.style.top = object.posY + "px"
        updGrid.style.width = object.width  + "px"
        updGrid.style.height = object.height + "px"
        if (cfg.grid.visibleNodes === true) updGrid.style.backgroundColor = "rgba(127,127,127,0.5)"
        if (cfg.grid.visibleNodes === false)updGrid.style.backgroundColor = "rgba(127,127,127,0)"
    }
    function shiftTiles() {
        for (let x = 0; x < desktop.mem.grid.gridArr.length; x++){
            for(let y = 0; y < desktop.mem.grid.gridArr[x].length; y++){
                desktop.mem.grid.gridArr[x][y].posX = (x+1) * ewm + x * w
                desktop.mem.grid.gridArr[x][y].posY = (y+1) * ehm + y * h
                desktop.mem.grid.gridArr[x][y].width  = w
                desktop.mem.grid.gridArr[x][y].height = h
                updateGridNode(desktop.mem.grid.gridArr[x][y])

                if(desktop.mem.grid.gridArr[x][y].icon){
                    desktop.mem.grid.gridArr[x][y].icon.coords.px = desktop.mem.grid.gridArr[x][y].posX
                    desktop.mem.grid.gridArr[x][y].icon.coords.py = desktop.mem.grid.gridArr[x][y].posY
                    desktop.mem.grid.gridArr[x][y].icon.coords.tx = desktop.mem.grid.gridArr[x][y].posX
                    desktop.mem.grid.gridArr[x][y].icon.coords.ty = desktop.mem.grid.gridArr[x][y].posY
                    desktop.mem.grid.gridArr[x][y].icon.poseNode()
                }
            }
        }
        task.emit("desktop-grid-margin-change")
    }

    //check border gap
    desktop.mem.grid.checkGridGap()

    //save changes in config source file
    if (!gridSettings) File.at(cfg.path+"/grid.json").write(JSON.stringify(eval(cfg.grid), null, "\t"))
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
    let w = cfg.grid.width
    let h = cfg.grid.height
    let ewm = (cfg.grid.modHmargin) ? cfg.grid.modHmargin : cfg.grid.hMargin
    let ehm = (cfg.grid.modVmargin) ? cfg.grid.modVmargin : cfg.grid.vMargin
    let wl = cfg.grid.hLength
    let hl = cfg.grid.vLength

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
    cfg.grid.autoHlength = true
    cfg.grid.autoVlength = true
    desktop.mem.grid.evaluateIconGrid(1)
    cfg.grid.autoHlength = false
    cfg.grid.autoVlength = false
}
desktop.mem.grid.autoMargin = function() {
    cfg.grid.autoHmargin = true
    cfg.grid.autoVmargin = true
    desktop.mem.grid.evaluateIconGrid(1)
    cfg.grid.autoHmargin = false
    cfg.grid.autoVmargin = false
}