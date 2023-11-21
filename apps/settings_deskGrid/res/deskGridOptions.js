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

let mem  = system.mem.task("TASKID").mem
mem.apps = "exp"
mem.var = {}

mem.editContent = function(option){
    let value = option.children[1];
    let button = option.children[2];
    value.setAttribute("contenteditable", "true");
    value.setAttribute("spellcheck", "false");

    selectText(value)

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

            new Function("cfg.desk." + value.id.replace("ID_TASKID.","") + " = " + inner)()
            if(value.id == "ID_TASKID.grid.width" || value.id == "ID_TASKID.grid.height"){
                desktop.mem.grid.evaluateIconGrid(null,2);
            }
            if(value.id == "ID_TASKID.grid.hMargin"){
                document.getElementById("ID_TASKID.marginCheckbox").checked = false;
                cfg.desk.grid.autoHmargin = false;
                cfg.desk.grid.modHmargin = 0;
                desktop.mem.grid.evaluateIconGrid(null,2);

                mem.UpdateGraphAuto(null,0);
            }
            if (value.id == "ID_TASKID.grid.vMargin"){
                document.getElementById("ID_TASKID.marginCheckbox").checked = false;
                cfg.desk.grid.autoVmargin = false;
                cfg.desk.grid.modVmargin = 0;
                desktop.mem.grid.evaluateIconGrid(null,2);

                mem.UpdateGraphAuto(null,1);
            }
            if(value.id == "ID_TASKID.grid.hLength"){
                document.getElementById("ID_TASKID.lengthCheckbox").checked = false;
                cfg.desk.grid.autoHlength = false;
                desktop.mem.grid.evaluateIconGrid(null,1);
            }
            if(value.id == "ID_TASKID.grid.vLength"){
                document.getElementById("ID_TASKID.lengthCheckbox").checked = false;
                cfg.desk.grid.autoVlength = false;
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

        new Function("document.getElementById('" + value.id + "').innerText = cfg.desk." + value.id.replace("ID_TASKID.",""))()
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
                new Function("cfg.desk.grid." + bool.name + " = true")();
                mem.UpdateGraph2();
                break;
            case false:
                new Function("cfg.desk.grid." + bool.name + " = false")();
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
    cfg.desk.grid.autoHmargin = true;
    cfg.desk.grid.autoVmargin = true;
    mem.UpdateGraphAuto();
    desktop.mem.grid.evaluateIconGrid(null,1)
    cfg.desk.grid.autoHmargin = false;
    cfg.desk.grid.autoVmargin = false;
}
document.getElementById("ID_TASKID.marginCheckbox").onclick = e => {
    if(e.target.checked == true){
        cfg.desk.grid.autoHmargin = true;
        cfg.desk.grid.autoVmargin = true;
        mem.UpdateGraphAuto();
        desktop.mem.grid.realTimeGridEval();

        desktop.mem.grid.evaluateIconGrid(null,1);
    } else {
        cfg.desk.grid.autoHmargin = false;
        cfg.desk.grid.autoVmargin = false;
        cfg.desk.grid.modHmargin = 0;
        cfg.desk.grid.modVmargin = 0;
        mem.UpdateGraphAuto();
        desktop.mem.grid.realTimeGridEval();

        desktop.mem.grid.evaluateIconGrid(null,2);
    }
}
document.getElementById("ID_TASKID.lengthButton").onclick = e => {
    cfg.desk.grid.autoHlength = true;
    cfg.desk.grid.autoVlength = true;
    desktop.mem.grid.evaluateIconGrid(null,1);
    mem.UpdateGraph2();
    cfg.desk.grid.autoHlength = false;
    cfg.desk.grid.autoVlength = false;
}
document.getElementById("ID_TASKID.lengthCheckbox").onclick = e => {
    if(e.target.checked == true){
        cfg.desk.grid.autoHlength = true;
        cfg.desk.grid.autoVlength = true;
        desktop.mem.grid.realTimeGridEval();
        
        desktop.mem.grid.evaluateIconGrid(null,1);
        mem.UpdateGraph2();
    } else {
        cfg.desk.grid.autoHlength = false;
        cfg.desk.grid.autoVlength = false;
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
mem.var.widthHTML.innerText = cfg.desk.grid.width
mem.var.heightHTML.innerText = cfg.desk.grid.height
mem.var.hMarginHTML.innerText = cfg.desk.grid.hMargin
mem.var.vMarginHTML.innerText = cfg.desk.grid.vMargin
mem.var.hLengthHTML.innerText = cfg.desk.grid.hLength
mem.var.vLengthHTML.innerText = cfg.desk.grid.vLength

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
    preloadImage(image);
}

//set values to graph html
mem.UpdateGraph = function(){
    document.getElementsByClassName("ID_TASKID grid_graph")[0].children[0].children[0].innerText = cfg.desk.grid.width;
    document.getElementsByClassName("ID_TASKID grid_graph")[0].children[1].innerText = cfg.desk.grid.height;
    document.getElementsByClassName("ID_TASKID grid_graph")[0].children[2].innerText = cfg.desk.grid.hMargin;
    document.getElementsByClassName("ID_TASKID grid_graph")[0].children[3].innerText = cfg.desk.grid.vMargin;
    mem.var.widthHTML.innerText = cfg.desk.grid.width
    mem.var.heightHTML.innerText = cfg.desk.grid.height
    mem.var.hMarginHTML.innerText = cfg.desk.grid.hMargin
    mem.var.vMarginHTML.innerText = cfg.desk.grid.vMargin
}
mem.UpdateGraphAuto = function(arg = null, which = 2){
    if (which == 0 || which == 2)document.getElementsByClassName("ID_TASKID grid_graph")[0].children[4].innerText = (cfg.desk.grid.modHmargin != 0 || arg) ? parseFloat(cfg.desk.grid.modHmargin).toFixed(2) : "";
    if (which == 1 || which == 2)document.getElementsByClassName("ID_TASKID grid_graph")[0].children[5].innerText = (cfg.desk.grid.modVmargin != 0 || arg) ? parseFloat(cfg.desk.grid.modVmargin).toFixed(2) : "";
}
mem.UpdateGraph2 = function(num = false){
    document.getElementsByClassName("ID_TASKID grid_graph")[1].children[0].children[0].innerText = cfg.desk.grid.hLength;
    document.getElementsByClassName("ID_TASKID grid_graph")[1].children[1].innerText = cfg.desk.grid.vLength;
    document.getElementsByClassName("ID_TASKID grid_graph")[1].children[5].style.backgroundImage = (cfg.desk.grid.sendStash) ? "url('./assets/deskIconGrid_stash.svg')" : "url('./assets/deskIconGrid_bin.svg')";

    let chk = document.getElementsByClassName("ID_TASKID grid_graph")[1].children[9].firstChild;
    let dot = document.getElementsByClassName("ID_TASKID grid_graph")[1].children[7];
    let dir = document.getElementsByClassName("ID_TASKID grid_graph")[1].children[4];
    let img = document.getElementsByClassName("ID_TASKID grid_graph")[1];

    mem.var.hLengthHTML.innerText = cfg.desk.grid.hLength
    mem.var.vLengthHTML.innerText = cfg.desk.grid.vLength

    if (chk.checked === false) {
        if (dot.offsetLeft > 170) {
            img.style.backgroundImage = "url('./assets/deskIconGridGraph2/deskIconGridGraph2_00.svg')";
            dir.innerText = "+0";
        }
        if (dot.offsetLeft <= 170 && dot.offsetLeft > 137) {
            img.style.backgroundImage = (cfg.desk.grid.sendBorder) ? "url('./assets/deskIconGridGraph2/deskIconGridGraph2_02-1.svg')" : "url('./assets/deskIconGridGraph2/deskIconGridGraph2_02-2.svg')";
            dir.innerText = "+0"
        }
        if (dot.offsetLeft <= 137 && dot.offsetLeft > 103) {
            img.style.backgroundImage = (cfg.desk.grid.sendBorder) ? "url('./assets/deskIconGridGraph2/deskIconGridGraph2_03-1.svg')" : "url('./assets/deskIconGridGraph2/deskIconGridGraph2_03-2.svg')";
            dir.innerText = "+1"
        }
        if (dot.offsetLeft === 103) {
            img.style.backgroundImage = "url('./assets/deskIconGridGraph2/deskIconGridGraph2_01.svg')";
            dir.innerText = "+4"
        }
    } else {
        if (dot.offsetLeft > 170) {
            img.style.backgroundImage = "url('./assets/deskIconGridGraph2/deskIconGridGraph2_00.svg')";
            dir.innerText = "+0";
        }
        if (dot.offsetLeft <= 170 && dot.offsetLeft > 137) {
            img.style.backgroundImage = "url('./assets/deskIconGridGraph2/deskIconGridGraph2_02-3.svg')";
            dir.innerText = "+3"
        }
        if (dot.offsetLeft <= 137 && dot.offsetLeft > 103) {
            img.style.backgroundImage = "url('./assets/deskIconGridGraph2/deskIconGridGraph2_03-3.svg')";
            dir.innerText = "+3"
        }
        if (dot.offsetLeft === 103) {
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
    let mX = e.clientX;
    let dot = e.target;
    let line = document.getElementsByClassName("ID_TASKID grid_graph")[1].children[6];

    document.onmousemove = dragDot;
    document.onmouseup = dragEnd;

    function dragDot(e){
        e = e || window.event;
        e.preventDefault();

        dot.parentElement.style.cursor = "w-resize";

        let nX = pX + e.clientX - mX;
        
        if(nX >= 103 && nX <= 202) dot.style.left = nX + "px";
        if(nX <= 103) dot.style.left = 103 + "px";
        if(nX >= 202) dot.style.left = 202 + "px";
        
        dot.style.left = (Math.round((dot.offsetLeft)/33)*33 + 4) + "px";

        line.style.width = 202 - dot.offsetLeft + "px";
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
if (cfg.desk.grid.sendStash === true) {
    document.getElementById("ID_TASKID.optboolStash").checked = true;
} else {
    document.getElementById("ID_TASKID.optboolBin").checked = true;
}

if (cfg.desk.grid.sendBorder === true) {
    document.getElementById("ID_TASKID.optboolBorder").checked = true;
} else {
    document.getElementById("ID_TASKID.optboolOrder").checked = true;
}

if (cfg.desk.grid.autoHmargin && cfg.desk.grid.autoVmargin) {
    document.getElementById("ID_TASKID.marginCheckbox").checked = true;
} else {
    document.getElementById("ID_TASKID.marginCheckbox").checked = false;
}

if (cfg.desk.grid.autoHlength && cfg.desk.grid.autoVlength) {
    document.getElementById("ID_TASKID.lengthCheckbox").checked = true;
} else {
    document.getElementById("ID_TASKID.lengthCheckbox").checked = false;
}