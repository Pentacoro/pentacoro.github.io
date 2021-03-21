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
    dir = true, 
    des = true
){
    //take existing config values if null arguments
    if(w == null) w = cfg.deskGrid.width ;
    if(h == null) h = cfg.deskGrid.height;
    if(wm == null) wm = cfg.deskGrid.hMargin;
    if(hm == null) hm = cfg.deskGrid.vMargin;
    if(wl == null) wl = cfg.deskGrid.hLength;
    if(hl == null) hl = cfg.deskGrid.vLength;
    if(autowm == null) autowm = cfg.deskGrid.autoHmargin;
    if(autohm == null) autohm = cfg.deskGrid.autoVmargin;
    if(autowl == null) autowl = cfg.deskGrid.autoHlength;
    if(autohl == null) autohl = cfg.deskGrid.autoVlength;

    //set background size
    idBackground.style.width = document.body.offsetWidth + "px";
    idBackground.style.height = document.body.offsetHeight - cfg.deskNavB.height + "px";

    //get some useful booleans
    let wChanged = cfg.deskGrid.width  !== w;
    let hChanged = cfg.deskGrid.height !== h;
    let wmChanged = cfg.deskGrid.hMargin !== wm;
    let hmChanged = cfg.deskGrid.vMargin !== hm;
    let wlChanged = cfg.deskGrid.hLength !== wl;
    let hlChanged = cfg.deskGrid.vLength !== hl;

    //set new values to config
    cfg.deskGrid.width  = w;
    cfg.deskGrid.height = h;
    cfg.deskGrid.hMargin = wm;
    cfg.deskGrid.vMargin = hm;
    cfg.deskGrid.hLength = wl;
    cfg.deskGrid.vLength = hl;
    cfg.deskGrid.autoHmargin = autowm;
    cfg.deskGrid.autoVmargin = autohm; 
    cfg.deskGrid.autoHlength = autowl;
    cfg.deskGrid.autoVlength = autohl; 
    
    let windowW = idBackground.offsetWidth;
    let windowH = idBackground.offsetHeight;
    
    //optimal number of icons that can fit in a row / column
    let gridHorizontal = Math.round((windowW-(w+wm*2)/2)/(w+wm));
    let gridVertical = Math.round((windowH-(h+hm*2)/2)/(h+hm));
    
    //evaluate optimal margin if enabled
    if(autowm || cfg.deskGrid.modHmargin > 0){
        ewm = (autowl) ? Math.round(windowW - w * gridHorizontal) / (gridHorizontal+1) : Math.round(windowW - w * wl) / (wl+1)
        if (autowm) cfg.deskGrid.modHmargin = ewm;
    } else {
        ewm = wm;
    }
    if(autohm || cfg.deskGrid.modVmargin > 0){
        ehm = (autohl) ? Math.round(windowH - h * gridVertical) / (gridVertical+1) : Math.round(windowH - h * hl) / (hl+1)
        if (autohm) cfg.deskGrid.modVmargin = ehm;
    } else {
        ehm = hm;
    }

    //get first array and HTML elements if not made yet
    if(iconGridArray.length === 0 || a == 0) {
        iconGridArray = new Array(gridHorizontal);
        for (var i = 0; i < iconGridArray.length; i++) {
            iconGridArray[i] = new Array(gridVertical);
        }

        cfg.deskGrid.hLength = gridHorizontal;
        cfg.deskGrid.vLength = gridVertical;
        
        //fill each coordinate with an object
        for (x = 0; x < iconGridArray.length; x++){
            for(y = 0; y < iconGridArray[x].length; y++){
                iconGridArray[x][y] = {
                    posX:(x+1) * ewm + x * w,
                    posY:(y+1) * ehm + y * h,
                    widt: w, heig: h, id: "id" + x + "-" + y,
                    used: false, icon: null
                }
                createGridNode(iconGridArray[x][y]);
            }
        }
    }
    //if array lengths change
    if( (autowl == true || autohl == true || wlChanged || hlChanged) || a == 1) {
        let iconGridArrayX = null;
        let iconGridArrayY = null;
        if(iconGridArray) iconGridArrayX = iconGridArray.length;
        if(iconGridArray[0]) iconGridArrayY = iconGridArray[0].length;

        if (cfg.deskGrid.modHmargin > 0){
            ewm = cfg.deskGrid.modHmargin;
            gridHorizontal = Math.round((windowW-(w+ewm)/2)/(w+ewm));
        }
        if (cfg.deskGrid.modVmargin > 0){
            ehm = cfg.deskGrid.modVmargin;
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
                cfg.deskGrid.hLength = gridHFinal;
                let delColumns = iconGridArray.splice(gridHFinal, gridHdiff*-1)
                delColumns.forEach(column => {
                    column.forEach(object => {
                        let objectNode = document.getElementById(object.id); 
                        objectNode.parentElement.removeChild(objectNode);

                        if(object.icon){
                            dlteIconNode(object.icon, true);
                        }
                    })
                })
            }
            //if longer row
            if (gridHdiff > 0){
                cfg.deskGrid.hLength = gridHFinal;
                for (x = iconGridArray.length; x < gridHFinal; x++){
                    iconGridArray.push(new Array(gridVFinal));
                    for(y = 0; y < iconGridArray[x].length; y++){
                        iconGridArray[x][y] = {
                            posX:(x+1) * ewm + x * w,
                            posY:(y+1) * ehm + y * h,
                            widt: w, heig: h, id: "id" + x + "-" + y,
                            used: false, icon: null
                        }
                        createGridNode(iconGridArray[x][y]);
                    }
                }
            }
        }

        if(autohl == true || hlChanged || a == 1) {
            //if shorter column 
            if (gridVdiff < 0 || autohl == true){
                cfg.deskGrid.vLength = gridVFinal;
                iconGridArray.forEach(column => {
                    let delRows = column.splice(gridVFinal, gridVdiff*-1)
                    delRows.forEach(object =>{
                        let objectNode = document.getElementById(object.id); 
                        objectNode.parentElement.removeChild(objectNode);

                        if(object.icon){
                            dlteIconNode(object.icon, true);
                        }
                    })
                })
            }
            //if longer column
            if (gridVdiff > 0 || autohl == true){
                cfg.deskGrid.vLength = gridVFinal;
                for (x = 0; x < iconGridArray.length; x++){
                    for(y = iconGridArray[x].length; y < gridVFinal; y++){
                        iconGridArray[x].push({
                            posX:(x+1) * ewm + x * w,
                            posY:(y+1) * ehm + y * h,
                            widt: w, heig: h, id: "id" + x + "-" + y,
                            used: false, icon: null
                        })
                        createGridNode(iconGridArray[x][y]);
                    }
                }
            }
        }
    }
    //if updating object is necessary
    if( (wChanged || hChanged || wmChanged || hmChanged || autowm || autohm) || a == 2) {
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

        newGrid.style.borderRadius = cfg.deskGrid.borderRadius + "px";
        if (cfg.deskGrid.visibleNodes === true) newGrid.style.backgroundColor = "rgba(127,127,127,0.5)";
        if (cfg.deskGrid.visibleNodes === false)newGrid.style.backgroundColor = "rgba(127,127,127,0)";

        document.getElementById("gridLayer").appendChild(newGrid);
    }
    function updateGridNode(object) {
        let updGrid = document.getElementById(object.id);
        updGrid.style.left = object.posX + "px";
        updGrid.style.top = object.posY + "px";
        updGrid.style.width = object.widt + "px";
        updGrid.style.height = object.heig + "px";
        if (cfg.deskGrid.visibleNodes === true) updGrid.style.backgroundColor = "rgba(127,127,127,0.5)";
        if (cfg.deskGrid.visibleNodes === false)updGrid.style.backgroundColor = "rgba(127,127,127,0)";
    }
}

function realTimeGridEval(margin = null, length = null){
    if(margin == null) margin = cfg.deskGrid.autoHmargin;
    if(length == null) length = cfg.deskGrid.autoHlength;

    if(margin === true || length === true){
        evaluateIconGrid();
        window.addEventListener("resize",evaluateIconGrid);
        return;
    }
    window.removeEventListener("resize",evaluateIconGrid);
}

function validateIconPosition(icon,mustSet = false,hasPrev = true){
    let w = cfg.deskGrid.width;
    let h = cfg.deskGrid.height;
    let wm = (cfg.deskGrid.modHmargin == 0) ? cfg.deskGrid.hMargin : cfg.deskGrid.modHmargin;
    let hm = (cfg.deskGrid.modVmargin == 0) ? cfg.deskGrid.vMargin : cfg.deskGrid.modVmargin;

    let coords = icon.coor;

    //fit icon into closest grid
    x = Math.round((coords.tx - wm)/(w + wm))*(w + wm) + wm;
    y = Math.round((coords.ty - hm)/(h + hm))*(h + hm) + hm;
    
    //get its spot in grid array
    tx = Math.round((x - wm)/(w + wm));
    ty = Math.round((y - hm)/(h + hm));

    //get initial position in grid array
    px = Math.round((coords.px - wm)/(w + wm));
    py = Math.round((coords.py - hm)/(h + hm));

    if(gridAvailable()) {
        //if object exists and is not used (valid position)
        let oldGrid = iconGridArray[px][py];
        let newGrid = iconGridArray[tx][ty];

        if(mustSet == true) {
            oldGrid.used = false;
            oldGrid.icon = null;
            newGrid.used = true;
            newGrid.icon = icon;

            coords.px = newGrid.posX;
            coords.py = newGrid.posY;
            coords.tx = newGrid.posX;
            coords.ty = newGrid.posY;
            coords.ax = tx;
            coords.ay = ty;

            return coords;
        }
        return true;
    } else {
        //if the position is invalid
        let oldGrid = iconGridArray[px][py];
        if(mustSet == true && hasPrev == true && classActive.length == 1){
            oldGrid.used = true;
            oldGrid.icon = icon;
            coords.tx = coords.px;
            coords.ty = coords.py;
            coords.ax = px;
            coords.ay = py;

            return coords;
        }else if(mustSet == true){
            newGrid = orderIconPosition();
            newGrid[0].used = true;
            newGrid[0].icon = icon;
            coords.px = newGrid[0].posX;
            coords.py = newGrid[0].posY;
            coords.tx = newGrid[0].posX;
            coords.ty = newGrid[0].posY;
            coords.ax = newGrid[1];
            coords.ay = newGrid[2]

            return coords;
        }
        return false;
    }
}

function gridAvailable(){
    if(iconGridArray[tx]){
        if(iconGridArray[tx][ty]){
            if(iconGridArray[tx][ty].used == false) return true;
        }
    }
    return false;
}
function gridExists(){
    if(iconGridArray[tx]){
        if(iconGridArray[tx][ty]) return true;
    }
    return false;
}

function orderIconPosition(){
    for (x = 0; x < iconGridArray.length; x++){
        for(y = 0; y < iconGridArray[x].length; y++){
            if (iconGridArray[x][y].used == false){
                return [iconGridArray[x][y],x,y];
            }
        }
    }
}