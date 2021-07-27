var iconGridArray = [];
evaluateIconGrid();
function evaluateIconGrid(
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
    if(w == null) w = cfg.desk.grid.width ;
    if(h == null) h = cfg.desk.grid.height;
    if(wm == null) wm = cfg.desk.grid.hMargin;
    if(hm == null) hm = cfg.desk.grid.vMargin;
    if(wl == null) wl = cfg.desk.grid.hLength;
    if(hl == null) hl = cfg.desk.grid.vLength;
    if(autowm == null) autowm = cfg.desk.grid.autoHmargin;
    if(autohm == null) autohm = cfg.desk.grid.autoVmargin;
    if(autowl == null) autowl = cfg.desk.grid.autoHlength;
    if(autohl == null) autohl = cfg.desk.grid.autoVlength;

    //set background size
    idBackground.style.width = document.body.offsetWidth + "px";
    idBackground.style.height = document.body.offsetHeight - cfg.desk.navB.height + "px";

    //get some useful booleans
    let wChanged = cfg.desk.grid.width  !== w;
    let hChanged = cfg.desk.grid.height !== h;
    let wmChanged = cfg.desk.grid.hMargin !== wm;
    let hmChanged = cfg.desk.grid.vMargin !== hm;
    let wlChanged = cfg.desk.grid.hLength !== wl;
    let hlChanged = cfg.desk.grid.vLength !== hl;

    //set new values to config
    cfg.desk.grid.width  = w;
    cfg.desk.grid.height = h;
    cfg.desk.grid.hMargin = wm;
    cfg.desk.grid.vMargin = hm;
    cfg.desk.grid.hLength = wl;
    cfg.desk.grid.vLength = hl;
    cfg.desk.grid.autoHmargin = autowm;
    cfg.desk.grid.autoVmargin = autohm; 
    cfg.desk.grid.autoHlength = autowl;
    cfg.desk.grid.autoVlength = autohl; 
    
    let windowW = idBackground.offsetWidth;
    let windowH = idBackground.offsetHeight;
    
    //optimal number of icons that can fit in a row / column
    let gridHorizontal = Math.round((windowW-(w+wm*3)/2)/(w+wm));
    let gridVertical = Math.round((windowH-(h+hm*3)/2)/(h+hm));
    
    //evaluate optimal margin if enabled
    if(autowm || cfg.desk.grid.modHmargin > 0){
        ewm = (autowl) ? Math.round(windowW - w * gridHorizontal) / (gridHorizontal+1) : Math.round(windowW - w * wl) / (wl+1)
        if (ewm < wm) ewm = wm
        if (autowm) cfg.desk.grid.modHmargin = ewm;
    } else {
        ewm = wm;
    }
    if(autohm || cfg.desk.grid.modVmargin > 0){
        ehm = (autohl) ? Math.round(windowH - h * gridVertical) / (gridVertical+1) : Math.round(windowH - h * hl) / (hl+1)
        if (ehm < hm) ehm = hm
        if (autohm) cfg.desk.grid.modVmargin = ehm;
    } else {
        ehm = hm;
    }

    //get first array and HTML elements if not made yet
    if(iconGridArray.length === 0 || a == 0) {
        iconGridArray = new Array(gridHorizontal);
        for (var i = 0; i < iconGridArray.length; i++) {
            iconGridArray[i] = new Array(gridVertical);
        }

        cfg.desk.grid.hLength = gridHorizontal;
        cfg.desk.grid.vLength = gridVertical;
        
        //fill each coordinate with an object
        for (x = 0; x < iconGridArray.length; x++){
            for(y = 0; y < iconGridArray[x].length; y++){
                iconGridArray[x][y] = {
                    posX:(x+1) * ewm + x * w,
                    posY:(y+1) * ehm + y * h,
                    arrX: x, arrY: y,
                    widt: w, heig: h, id: "id" + x + "-" + y,
                    used: false, icon: null
                }
                createGridNode(iconGridArray[x][y]);
            }
        }
    }
    //if updating object is necessary
    if( (wChanged || hChanged || wmChanged || hmChanged || autowm || autohm) || a == 2) {
    
        if (document.getElementsByClassName("grid_graph")) {
            if (document.getElementsByClassName("grid_graph")[0]) {
                if (cfg.desk.grid.autoHmargin) document.getElementsByClassName("grid_graph")[0].children[4].innerText = parseFloat(cfg.desk.grid.modHmargin).toFixed(2);
                if (cfg.desk.grid.autoVmargin) document.getElementsByClassName("grid_graph")[0].children[5].innerText = parseFloat(cfg.desk.grid.modVmargin).toFixed(2);
            }
        }
        

        for (x = 0; x < iconGridArray.length; x++){
            for(y = 0; y < iconGridArray[x].length; y++){
                iconGridArray[x][y].posX = (x+1) * ewm + x * w;
                iconGridArray[x][y].posY = (y+1) * ehm + y * h;
                iconGridArray[x][y].widt = w;
                iconGridArray[x][y].heig = h;
                updateGridNode(iconGridArray[x][y]);

                if(iconGridArray[x][y].icon){
                    iconGridArray[x][y].icon.coor.px = iconGridArray[x][y].posX;
                    iconGridArray[x][y].icon.coor.py = iconGridArray[x][y].posY;
                    iconGridArray[x][y].icon.coor.tx = iconGridArray[x][y].posX;
                    iconGridArray[x][y].icon.coor.ty = iconGridArray[x][y].posY;
                    iconGridArray[x][y].icon.poseNode();
                }
            }
        }
    }
    //if array lengths change
    if( (autowl == true || autohl == true || wlChanged || hlChanged) || a == 1) {
        let iconGridArrayX = null;
        let iconGridArrayY = null;
        if(iconGridArray) iconGridArrayX = iconGridArray.length;
        if(iconGridArray[0]) iconGridArrayY = iconGridArray[0].length;

        if (cfg.desk.grid.modHmargin > 0){
            ewm = cfg.desk.grid.modHmargin;
            gridHorizontal = Math.round((windowW-(w+ewm)/2)/(w+ewm));
        }
        if (cfg.desk.grid.modVmargin > 0){
            ehm = cfg.desk.grid.modVmargin;
            gridVertical = Math.round((windowH-(h+ehm)/2)/(h+ehm));  
        }

        let gridHdiff = (autowl) ? gridHorizontal - iconGridArrayX : wl - iconGridArrayX;
        let gridVdiff = (autohl) ? gridVertical - iconGridArrayY : hl - iconGridArrayY;
        
        let gridHFinal= (autowl) ? gridHorizontal : wl;
        let gridVFinal= (autohl) ? gridVertical : hl;

        if(document.getElementById("hLength")) document.getElementById("hLength").innerText = gridHFinal;
        if(document.getElementById("vLength")) document.getElementById("vLength").innerText = gridVFinal;

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
            cfg.desk.grid.hLength = gridHFinal;

            let iconsForShiftLate = []

            for (i = 0; i > gridHdiff; i--) {
                let delColumns = iconGridArray.splice(gridHFinal+(gridHdiff*-1 + i - 1), 1)
                delColumns.forEach(column => {
                    column.forEach(object => {
                        let objectNode = document.getElementById(object.id); 
                        objectNode.parentElement.removeChild(objectNode);

                        /*if(object.icon){*/
                        if(object.icon && cfg.desk.grid.sendBorder){
                            iconsForShift = []

                            iconsForShift.push(object.icon)

                            let checkNextSlot = function(obj) {
                                nextSlot = (obj.arrX != 0) ? iconGridArray[obj.arrX - 1][obj.arrY] : {icon: null}
                                if (nextSlot.icon) {
                                    iconsForShift.push(nextSlot.icon)
                                    checkNextSlot(nextSlot)
                                } else if (obj.arrX != 0) {
                                    for(icon of iconsForShift) {
                                        icon.coor.tx = icon.coor.tx - w - ewm
                                        if (icon.coor.ax < gridHFinal+(gridHdiff*-1 + i - 1)) {
                                            iconGridArray[icon.coor.ax][icon.coor.ay].icon = null
                                            iconGridArray[icon.coor.ax][icon.coor.ay].used = false
                                        }
                                    }
                                    repositionIcons(iconsForShift,true,false)
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
                            repositionIcons(iconsForShift,true,false)
                            for(icon of iconsForShift) {
                                icon.poseNode();
                                icon.statNode();
                            }
                        }
                    })
                })
                repositionIcons(iconsForShiftLate,true,false)
                for(icon of iconsForShiftLate) {
                    icon.poseNode()
                    icon.statNode()
                }
            }
        }
        function handleLongerRow(){
            cfg.desk.grid.hLength = gridHFinal;
            for (x = iconGridArray.length; x < gridHFinal; x++){
                iconGridArray.push(new Array(gridVFinal));
                for(y = 0; y < iconGridArray[x].length; y++){
                    iconGridArray[x][y] = {
                        posX:(x+1) * ewm + x * w,
                        posY:(y+1) * ehm + y * h,
                        arrX: x, arrY: y,
                        widt: w, heig: h, id: "id" + x + "-" + y,
                        used: false, icon: null
                    }
                    createGridNode(iconGridArray[x][y]);
                }
            }

            iconGridArray[gridHFinal - gridHdiff - 1].forEach(object => {
                if(object.icon && cfg.desk.grid.sendBorder){
                    iconsForShift = []

                    iconsForShift.push(object.icon)

                    let checkNextSlot = function(obj) {
                        nextSlot = (obj.arrX != 0) ? iconGridArray[obj.arrX - 1][obj.arrY] : {icon: null}
                        if (nextSlot.icon) {
                            iconsForShift.push(nextSlot.icon)
                            checkNextSlot(nextSlot)
                        } else if (obj.arrX != 0) {
                            for(icon of iconsForShift) {
                                icon.coor.tx = icon.coor.tx + w*gridHdiff + ewm*gridHdiff
                                if (icon.coor.ax < gridHFinal) {
                                    iconGridArray[icon.coor.ax][icon.coor.ay].icon = null
                                    iconGridArray[icon.coor.ax][icon.coor.ay].used = false
                                }
                            }
                            repositionIcons(iconsForShift,true,true)
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
            cfg.desk.grid.vLength = gridVFinal;

            let iconsForShiftLate = []

            iconGridArray.forEach(column => {

                for (i = 0; i > gridVdiff; i--) {
                    let delRows = column.splice(gridVFinal+(gridVdiff*-1 + i - 1), 1)
                    delRows.forEach(object =>{

                        let objectNode = document.getElementById(object.id); 
                        objectNode.parentElement.removeChild(objectNode);

                        /*if(object.icon){
                            dlteIconNode(object.icon, true);
                        }*/
                        if(object.icon && cfg.desk.grid.sendBorder){
                            iconsForShift = []

                            iconsForShift.push(object.icon)

                            let checkNextSlot = function(obj) {
                                nextSlot = (obj.arrY != 0) ? iconGridArray[obj.arrX][obj.arrY - 1] : {icon: null}
                                if (nextSlot.icon) {
                                    iconsForShift.push(nextSlot.icon)
                                    checkNextSlot(nextSlot)
                                } else if (obj.arrY != 0) {
                                    for(icon of iconsForShift) {
                                        icon.coor.ty = icon.coor.ty - h - ehm
                                        if (icon.coor.ay < gridVFinal+(gridVdiff*-1 + i - 1)) {
                                            iconGridArray[icon.coor.ax][icon.coor.ay].icon = null
                                            iconGridArray[icon.coor.ax][icon.coor.ay].used = false
                                        }
                                    }
                                    repositionIcons(iconsForShift,true,false)
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
                            repositionIcons(iconsForShift,true,false)
                            for(icon of iconsForShift) {
                                icon.poseNode();
                                icon.statNode();
                            }
                        }
                    })
                }
            })
            repositionIcons(iconsForShiftLate,true,false)
            for(icon of iconsForShiftLate) {
                icon.poseNode()
                icon.statNode()
            }
        }
        function handleLongerColumn(){
            cfg.desk.grid.vLength = gridVFinal;
            for (x = 0; x < iconGridArray.length; x++){
                for(y = iconGridArray[x].length; y < gridVFinal; y++){
                    iconGridArray[x].push({
                        posX:(x+1) * ewm + x * w,
                        posY:(y+1) * ehm + y * h,
                        arrX: x, arrY: y,
                        widt: w, heig: h, id: "id" + x + "-" + y,
                        used: false, icon: null
                    })
                    createGridNode(iconGridArray[x][y]);
                }
            }
            iconGridArray.forEach(column => {
                let object = column[gridVFinal - gridVdiff - 1]
                if(object.icon && cfg.desk.grid.sendBorder){
                    iconsForShift = []

                    iconsForShift.push(object.icon)

                    let checkNextSlot = function(obj) {
                        nextSlot = (obj.arrY != 0) ? iconGridArray[obj.arrX][obj.arrY - 1] : {icon: null}
                        if (nextSlot.icon) {
                            iconsForShift.push(nextSlot.icon)
                            checkNextSlot(nextSlot)
                        } else if (obj.arrY != 0) {
                            for(icon of iconsForShift) {
                                icon.coor.ty = icon.coor.ty + h*gridVdiff + ehm*gridVdiff
                                if (icon.coor.ay < gridVFinal) {
                                    iconGridArray[icon.coor.ax][icon.coor.ay].icon = null
                                    iconGridArray[icon.coor.ax][icon.coor.ay].used = false
                                }
                            }
                            repositionIcons(iconsForShift,true,true)
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

        if (document.getElementsByClassName("grid_graph")) {
            if (document.getElementsByClassName("grid_graph")[1]) {
                document.getElementsByClassName("grid_graph")[1].children[0].children[0].innerText = cfg.desk.grid.hLength;
                document.getElementsByClassName("grid_graph")[1].children[1].innerText = cfg.desk.grid.vLength;
            }
        }
    }

    //graph array elements on the DOM
    function createGridNode(object) {
        let newGrid = document.createElement("div");
        newGrid.setAttribute("id", object.id);
        newGrid.setAttribute("class", "gridElement");
        newGrid.style.left = object.posX + "px";
        newGrid.style.top = object.posY + "px";
        newGrid.style.width = object.widt + "px";
        newGrid.style.height = object.heig + "px";

        newGrid.style.position = "absolute";
        newGrid.style.zIndex = "-980";
        newGrid.style.pointerEvents = "none";

        newGrid.style.borderRadius = cfg.desk.grid.borderRadius + "px";
        if (cfg.desk.grid.visibleNodes === true) newGrid.style.backgroundColor = "rgba(127,127,127,0.5)";
        if (cfg.desk.grid.visibleNodes === false)newGrid.style.backgroundColor = "rgba(127,127,127,0)";

        document.getElementById("gridLayer").appendChild(newGrid);
    }
    function updateGridNode(object) {
        let updGrid = document.getElementById(object.id);
        updGrid.style.left = object.posX + "px";
        updGrid.style.top = object.posY + "px";
        updGrid.style.width = object.widt + "px";
        updGrid.style.height = object.heig + "px";
        if (cfg.desk.grid.visibleNodes === true) updGrid.style.backgroundColor = "rgba(127,127,127,0.5)";
        if (cfg.desk.grid.visibleNodes === false)updGrid.style.backgroundColor = "rgba(127,127,127,0)";
    }
}

function realTimeGridEval(margin = null, length = null){
    if(margin == null) margin = cfg.desk.grid.autoHmargin;
    if(length == null) length = cfg.desk.grid.autoHlength;

    if(margin || length){
        evaluateIconGrid();
        window.addEventListener("resize",evaluateIconGrid);
        return;
    }
    window.removeEventListener("resize",evaluateIconGrid);
}

function gridAvailable(x, y){
    if(gridExists(x, y)){
        if(iconGridArray[x][y].used == false) return true;
    }
    return false;
}
function gridExists(x, y){
    if(iconGridArray[x]){
        if(iconGridArray[x][y]) return true;
    }
    return false;
}