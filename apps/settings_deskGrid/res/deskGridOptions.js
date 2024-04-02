//deselection
document.onmousedown = e => {
    if (window.getSelection) {window.getSelection().removeAllRanges();}
    else if (document.selection) {document.selection.empty();}
}

//begin with 1st tab selected
document.getElementById("ID_TASKID.tabResizing").checked = true;

//tabs functionality
document.getElementById("ID_TASKID.tabPositioning").addEventListener("click", e => {
    if (e.target.checked) {
        document.getElementById("ID_TASKID.tabContent1").classList.remove("hidden");
        document.getElementById("ID_TASKID.tabContent2").classList.add("hidden");
        return;
    }
})
document.getElementById("ID_TASKID.tabResizing").addEventListener("click", e => {
    if (e.target.checked) {
        document.getElementById("ID_TASKID.tabContent2").classList.remove("hidden");
        document.getElementById("ID_TASKID.tabContent1").classList.add("hidden");
        return;
    }
})

//edit buttons functionality
for (option of document.getElementsByClassName("optionValue")){
    option.onclick = (e) => mem.editContent(e.target.parentElement);
    option.parentElement.children[2].children[0].onclick = (e) => mem.editContent(e.target.parentElement.parentElement);
}

let mem  = Task.id("TASKID").mem
mem.apps = "exp"
mem.var = {}
let desktop = Task.openInstance("Desktop")

mem.editContent = function(option){
    let value = option.children[1];
    let button = option.children[2];
    value.setAttribute("contenteditable", "true");
    value.setAttribute("spellcheck", "false");

    jsc.selectText(value)

    button.children[0].classList.add("hidden");
    button.children[1].classList.remove("hidden");
    button.children[2].classList.remove("hidden");

    value.onkeydown = e => {
        if(e.key == "Enter"){
            buttonAccept();
            return false;
        }
        if(e.key == "Escape"){
            buttonCancel();
            return false;
        }
    };

    button.children[1].onclick = e => {
        buttonAccept();
    }
    button.children[2].onclick = e => {
        buttonCancel();
    }
    
    function buttonAccept(){
        if (/^\d+$/.test(value.innerText)){
            let inner = parseInt(value.innerText);
            value.style.backgroundColor = "";

            new Function("cfg.desktop." + value.id.replace("ID_TASKID.","") + " = " + inner)()
            if(value.id == "ID_TASKID.grid.width" || value.id == "ID_TASKID.grid.height"){
                desktop.mem.grid.evaluateIconGrid(null,2);
            }
            if(value.id == "ID_TASKID.grid.hMargin"){
                document.getElementById("ID_TASKID.marginCheckbox").checked = false;
                cfg.desktop.grid.autoHmargin = false;
                cfg.desktop.grid.modHmargin = 0;
                desktop.mem.grid.evaluateIconGrid(null,2);

                mem.UpdateGraphAuto(null,0);
            }
            if (value.id == "ID_TASKID.grid.vMargin"){
                document.getElementById("ID_TASKID.marginCheckbox").checked = false;
                cfg.desktop.grid.autoVmargin = false;
                cfg.desktop.grid.modVmargin = 0;
                desktop.mem.grid.evaluateIconGrid(null,2);

                mem.UpdateGraphAuto(null,1);
            }
            if(value.id == "ID_TASKID.grid.hLength"){
                document.getElementById("ID_TASKID.lengthCheckbox").checked = false;
                cfg.desktop.grid.autoHlength = false;
                desktop.mem.grid.evaluateIconGrid(null,1);
            }
            if(value.id == "ID_TASKID.grid.vLength"){
                document.getElementById("ID_TASKID.lengthCheckbox").checked = false;
                cfg.desktop.grid.autoVlength = false;
                desktop.mem.grid.evaluateIconGrid(null,1);
            }
            mem.UpdateGraph();

            value.setAttribute("contenteditable", "false");
            button.children[0].classList.remove("hidden");
            button.children[1].classList.add("hidden");
            button.children[2].classList.add("hidden");
        } else {
            value.focus();
            let range = document.createRange();
            range.setStart(value, 0);
            range.setEnd(value, value.childNodes.length);
            window.getSelection().addRange(range);

            value.style.backgroundColor = "#f788ab";
        }
    }
    function buttonCancel(){
        value.style.backgroundColor = "";
        value.setAttribute("contenteditable", "false");
        button.children[0].classList.remove("hidden");
        button.children[1].classList.add("hidden");
        button.children[2].classList.add("hidden");

        new Function("document.getElementById('" + value.id + "').innerText = cfg.desktop." + value.id.replace("ID_TASKID.",""))()
    }
}

//booleans functionality
for (option of document.getElementsByClassName("ID_TASKID editBoolean")){
    option.onclick = (e) => mem.editBoolean(e.target);
}
mem.editBoolean = function(option){
    let bool = option.parentElement.children[0];
    if(bool.name != undefined) {
        switch (bool.parentElement.classList.contains("1")){
            case true:
                new Function("cfg.desktop.grid." + bool.name + " = true")();
                mem.UpdateGraph2();
                break;
            case false:
                new Function("cfg.desktop.grid." + bool.name + " = false")();
                mem.UpdateGraph2();
                break;
        }
        mem.UpdateGraph();
    }
}
for(i = 0; i < document.getElementsByClassName("ID_TASKID optbool_box").length; i++){
    document.getElementsByClassName("ID_TASKID optbool_box")[i].addEventListener("mouseup", (e) => {
        if(e.target.classList.contains("ID_TASKID optbool_box")) {
            e.target.parentElement.children[0].checked = true
        } else {
            e.target.parentElement.parentElement.children[0].checked = true
        }
    })
}

//footer buttons funcitonality
document.getElementById("ID_TASKID.marginButton").onclick = e => {
    cfg.desktop.grid.autoHmargin = true;
    cfg.desktop.grid.autoVmargin = true;
    mem.UpdateGraphAuto();
    desktop.mem.grid.evaluateIconGrid(null,1)
    cfg.desktop.grid.autoHmargin = false;
    cfg.desktop.grid.autoVmargin = false;
}
document.getElementById("ID_TASKID.marginCheckbox").onclick = e => {
    if(e.target.checked == true){
        cfg.desktop.grid.autoHmargin = true;
        cfg.desktop.grid.autoVmargin = true;
        mem.UpdateGraphAuto();
        desktop.mem.grid.realTimeGridEval();

        desktop.mem.grid.evaluateIconGrid(null,1);
    } else {
        cfg.desktop.grid.autoHmargin = false;
        cfg.desktop.grid.autoVmargin = false;
        cfg.desktop.grid.modHmargin = 0;
        cfg.desktop.grid.modVmargin = 0;
        mem.UpdateGraphAuto();
        desktop.mem.grid.realTimeGridEval();

        desktop.mem.grid.evaluateIconGrid(null,2);
    }
}
document.getElementById("ID_TASKID.lengthButton").onclick = e => {
    cfg.desktop.grid.autoHlength = true;
    cfg.desktop.grid.autoVlength = true;
    desktop.mem.grid.evaluateIconGrid(null,1);
    mem.UpdateGraph2();
    cfg.desktop.grid.autoHlength = false;
    cfg.desktop.grid.autoVlength = false;
}
document.getElementById("ID_TASKID.lengthCheckbox").onclick = e => {
    if(e.target.checked == true){
        cfg.desktop.grid.autoHlength = true;
        cfg.desktop.grid.autoVlength = true;
        desktop.mem.grid.realTimeGridEval();
        
        desktop.mem.grid.evaluateIconGrid(null,1);
        mem.UpdateGraph2();
    } else {
        cfg.desktop.grid.autoHlength = false;
        cfg.desktop.grid.autoVlength = false;
        desktop.mem.grid.realTimeGridEval();
    }
}

//html references
mem.var.widthHTML = document.getElementById("ID_TASKID.grid.width")
mem.var.heightHTML = document.getElementById("ID_TASKID.grid.height")
mem.var.hMarginHTML = document.getElementById("ID_TASKID.grid.hMargin")
mem.var.vMarginHTML = document.getElementById("ID_TASKID.grid.vMargin")
mem.var.hLengthHTML = document.getElementById("ID_TASKID.grid.hLength")
mem.var.vLengthHTML = document.getElementById("ID_TASKID.grid.vLength")

//set values to html
mem.var.widthHTML.innerText = cfg.desktop.grid.width
mem.var.heightHTML.innerText = cfg.desktop.grid.height
mem.var.hMarginHTML.innerText = cfg.desktop.grid.hMargin
mem.var.vMarginHTML.innerText = cfg.desktop.grid.vMargin
mem.var.hLengthHTML.innerText = cfg.desktop.grid.hLength
mem.var.vLengthHTML.innerText = cfg.desktop.grid.vLength

//preload graph2 images
mem.var.graph2images = 
[
    "./assets/deskIconGrid_stash.svg",
    "./assets/deskIconGrid_bin.svg",
    "./assets/deskIconGridGraph2/deskIconGridGraph2_00.svg",
    "./assets/deskIconGridGraph2/deskIconGridGraph2_01.svg",
    "./assets/deskIconGridGraph2/deskIconGridGraph2_02-1.svg",
    "./assets/deskIconGridGraph2/deskIconGridGraph2_02-2.svg",
    "./assets/deskIconGridGraph2/deskIconGridGraph2_02-3.svg",
    "./assets/deskIconGridGraph2/deskIconGridGraph2_03-1.svg",
    "./assets/deskIconGridGraph2/deskIconGridGraph2_03-2.svg",
    "./assets/deskIconGridGraph2/deskIconGridGraph2_03-3.svg",
]
for (image of mem.var.graph2images){
    jsc.preloadImage(image);
}

//set values to graph html
mem.UpdateGraph = function(){
    document.getElementsByClassName("ID_TASKID grid_graph")[0].children[0].children[0].innerText = cfg.desktop.grid.width;
    document.getElementsByClassName("ID_TASKID grid_graph")[0].children[1].innerText = cfg.desktop.grid.height;
    document.getElementsByClassName("ID_TASKID grid_graph")[0].children[2].innerText = cfg.desktop.grid.hMargin;
    document.getElementsByClassName("ID_TASKID grid_graph")[0].children[3].innerText = cfg.desktop.grid.vMargin;
    mem.var.widthHTML.innerText = cfg.desktop.grid.width
    mem.var.heightHTML.innerText = cfg.desktop.grid.height
    mem.var.hMarginHTML.innerText = cfg.desktop.grid.hMargin
    mem.var.vMarginHTML.innerText = cfg.desktop.grid.vMargin
}
mem.UpdateGraphAuto = function(arg = null, which = 2){
    if (which == 0 || which == 2)document.getElementsByClassName("ID_TASKID grid_graph")[0].children[4].innerText = (cfg.desktop.grid.modHmargin != 0 || arg) ? parseFloat(cfg.desktop.grid.modHmargin).toFixed(2) : "";
    if (which == 1 || which == 2)document.getElementsByClassName("ID_TASKID grid_graph")[0].children[5].innerText = (cfg.desktop.grid.modVmargin != 0 || arg) ? parseFloat(cfg.desktop.grid.modVmargin).toFixed(2) : "";
}
mem.UpdateGraph2 = function(num = false){
    document.getElementsByClassName("ID_TASKID grid_graph")[1].children[0].children[0].innerText = cfg.desktop.grid.hLength;
    document.getElementsByClassName("ID_TASKID grid_graph")[1].children[1].innerText = cfg.desktop.grid.vLength;
    document.getElementsByClassName("ID_TASKID grid_graph")[1].children[5].style.backgroundImage = (cfg.desktop.grid.sendStash) ? "url('./assets/deskIconGrid_stash.svg')" : "url('./assets/deskIconGrid_bin.svg')";

    let chk = document.getElementsByClassName("ID_TASKID grid_graph")[1].children[9].firstChild;
    let dot = document.getElementsByClassName("ID_TASKID grid_graph")[1].children[7];
    let dir = document.getElementsByClassName("ID_TASKID grid_graph")[1].children[4];
    let img = document.getElementsByClassName("ID_TASKID grid_graph")[1];

    mem.var.hLengthHTML.innerText = cfg.desktop.grid.hLength
    mem.var.vLengthHTML.innerText = cfg.desktop.grid.vLength

    if (chk.checked === false) {
        if (dot.offsetLeft > 174) {
            img.style.backgroundImage = "url('./assets/deskIconGridGraph2/deskIconGridGraph2_00.svg')";
            dir.innerText = "+0";
        }
        if (dot.offsetLeft <= 174 && dot.offsetLeft > 141) {
            img.style.backgroundImage = (cfg.desktop.grid.sendBorder) ? "url('./assets/deskIconGridGraph2/deskIconGridGraph2_02-1.svg')" : "url('./assets/deskIconGridGraph2/deskIconGridGraph2_02-2.svg')";
            dir.innerText = "+0"
        }
        if (dot.offsetLeft <= 141 && dot.offsetLeft > 107) {
            img.style.backgroundImage = (cfg.desktop.grid.sendBorder) ? "url('./assets/deskIconGridGraph2/deskIconGridGraph2_03-1.svg')" : "url('./assets/deskIconGridGraph2/deskIconGridGraph2_03-2.svg')";
            dir.innerText = "+1"
        }
        if (dot.offsetLeft === 107) {
            img.style.backgroundImage = "url('./assets/deskIconGridGraph2/deskIconGridGraph2_01.svg')";
            dir.innerText = "+4"
        }
    } else {
        if (dot.offsetLeft > 174) {
            img.style.backgroundImage = "url('./assets/deskIconGridGraph2/deskIconGridGraph2_00.svg')";
            dir.innerText = "+0";
        }
        if (dot.offsetLeft <= 174 && dot.offsetLeft > 141) {
            img.style.backgroundImage = "url('./assets/deskIconGridGraph2/deskIconGridGraph2_02-3.svg')";
            dir.innerText = "+3"
        }
        if (dot.offsetLeft <= 141 && dot.offsetLeft > 107) {
            img.style.backgroundImage = "url('./assets/deskIconGridGraph2/deskIconGridGraph2_03-3.svg')";
            dir.innerText = "+3"
        }
        if (dot.offsetLeft === 107) {
            img.style.backgroundImage = "url('./assets/deskIconGridGraph2/deskIconGridGraph2_01.svg')";
            dir.innerText = "+4"
        }
    }
}
mem.UpdateGraph();
mem.UpdateGraphAuto();
mem.UpdateGraph2();

//graph incteractives updating
document.getElementsByClassName("ID_TASKID grid_graph")[1].children[9].firstChild.onclick = e => {
    mem.UpdateGraph2();
}
document.getElementsByClassName("ID_TASKID grid_graph")[1].children[7].onmousedown = e => {
    let pX = e.target.offsetLeft
    let mX = Math.round((e.clientX)/33)*33 + 8
    let dot = e.target;
    let line = document.getElementsByClassName("ID_TASKID grid_graph")[1].children[6];

    document.onmousemove = dragDot;
    document.onmouseup = dragEnd;

    function dragDot(e){
        e = e || window.event;
        e.preventDefault();

        dot.parentElement.style.cursor = "w-resize";

        let nX = pX + e.clientX - mX;
        
        if(nX >= 107 && nX <= 206) dot.style.left = nX + "px";
        if(nX <= 107) dot.style.left = 107 + "px";
        if(nX >= 206) dot.style.left = 206 + "px";
        
        dot.style.left = (Math.round((dot.offsetLeft)/33)*33 + 8) + "px";

        line.style.width = 206 - dot.offsetLeft + "px";
        line.style.left = dot.offsetLeft + 5 + "px";

        mem.UpdateGraph2();
    }
    function dragEnd(e){
        document.onmousemove = null;
        document.onmouseup = null;
        dot.parentElement.style.cursor = "";
    }
}

//set values to booleans
if (cfg.desktop.grid.sendStash === true) {
    document.getElementById("ID_TASKID.optboolStash").checked = true;
} else {
    document.getElementById("ID_TASKID.optboolBin").checked = true;
}

if (cfg.desktop.grid.sendBorder === true) {
    document.getElementById("ID_TASKID.optboolBorder").checked = true;
} else {
    document.getElementById("ID_TASKID.optboolOrder").checked = true;
}

if (cfg.desktop.grid.autoHmargin && cfg.desktop.grid.autoVmargin) {
    document.getElementById("ID_TASKID.marginCheckbox").checked = true;
} else {
    document.getElementById("ID_TASKID.marginCheckbox").checked = false;
}

if (cfg.desktop.grid.autoHlength && cfg.desktop.grid.autoVlength) {
    document.getElementById("ID_TASKID.lengthCheckbox").checked = true;
} else {
    document.getElementById("ID_TASKID.lengthCheckbox").checked = false;
}