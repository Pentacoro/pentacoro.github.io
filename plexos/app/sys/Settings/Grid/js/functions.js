let desktop = Task.openInstance("Desktop")
let mem  = Task.id("TASKID").mem

mem.editContent = function(option){
    let value = option.children[1]
    value.setAttribute("contenteditable", "true")
    value.setAttribute("spellcheck", "false")

    dll.selectText(value)

    value.onkeydown = e => {
        if(e.key == "Enter"){
            buttonAccept()
            return false
        }
        if(e.key == "Escape"){
            buttonCancel()
            return false
        }
    }
    
    function buttonAccept(){
        if (/^\d+$/.test(value.innerText)){
            let inner = parseInt(value.innerText)
            value.style.backgroundColor = ""

            new Function("cfg.desktop." + value.id.replace("ID_TASKID.","") + " = " + inner)()
            if(value.id == "ID_TASKID.grid.width" || value.id == "ID_TASKID.grid.height"){
                desktop.mem.grid.evaluateIconGrid(null,2)
            }
            if(value.id == "ID_TASKID.grid.hMargin"){
                document.getElementById("ID_TASKID.marginCheckbox").checked = false
                cfg.desktop.grid.autoHmargin = false
                cfg.desktop.grid.modHmargin = 0
                desktop.mem.grid.evaluateIconGrid(null,2)

                mem.UpdateGraphAuto(null,0)
            }
            if (value.id == "ID_TASKID.grid.vMargin"){
                document.getElementById("ID_TASKID.marginCheckbox").checked = false
                cfg.desktop.grid.autoVmargin = false
                cfg.desktop.grid.modVmargin = 0
                desktop.mem.grid.evaluateIconGrid(null,2)

                mem.UpdateGraphAuto(null,1)
            }
            if(value.id == "ID_TASKID.grid.hLength"){
                document.getElementById("ID_TASKID.lengthCheckbox").checked = false
                cfg.desktop.grid.autoHlength = false
                desktop.mem.grid.evaluateIconGrid(null,1)
            }
            if(value.id == "ID_TASKID.grid.vLength"){
                document.getElementById("ID_TASKID.lengthCheckbox").checked = false
                cfg.desktop.grid.autoVlength = false
                desktop.mem.grid.evaluateIconGrid(null,1)
            }
            mem.UpdateGraph()

            value.setAttribute("contenteditable", "false")
        } else {
            value.focus()
            let range = document.createRange()
            range.setStart(value, 0)
            range.setEnd(value, value.childNodes.length)
            window.getSelection().addRange(range)

            value.style.backgroundColor = "#f788ab"
        }
    }
    function buttonCancel(){
        value.style.backgroundColor = ""
        value.setAttribute("contenteditable", "false")
        button.children[0].classList.remove("hidden")
        button.children[1].classList.add("hidden")
        button.children[2].classList.add("hidden")

        new Function("document.getElementById('" + value.id + "').innerText = cfg.desktop." + value.id.replace("ID_TASKID.",""))()
    }
}
mem.editBoolean = function(option){
    let bool = option.parentElement.children[0]
    if(bool.name != undefined) {
        switch (bool.parentElement.classList.contains("1")){
            case true:
                new Function("cfg.desktop.grid." + bool.name + " = true")()
                mem.UpdateGraph2()
                break
            case false:
                new Function("cfg.desktop.grid." + bool.name + " = false")()
                mem.UpdateGraph2()
                break
        }
        mem.UpdateGraph()
    }
}

//set values to graph html
mem.UpdateGraph = function(){
    document.getElementsByClassName("ID_TASKID grid_graph")[0].children[0].children[0].innerText = cfg.desktop.grid.width
    document.getElementsByClassName("ID_TASKID grid_graph")[0].children[1].innerText = cfg.desktop.grid.height
    document.getElementsByClassName("ID_TASKID grid_graph")[0].children[2].innerText = cfg.desktop.grid.hMargin
    document.getElementsByClassName("ID_TASKID grid_graph")[0].children[3].innerText = cfg.desktop.grid.vMargin
    mem.var.widthHTML.innerText = cfg.desktop.grid.width
    mem.var.heightHTML.innerText = cfg.desktop.grid.height
    mem.var.hMarginHTML.innerText = cfg.desktop.grid.hMargin
    mem.var.vMarginHTML.innerText = cfg.desktop.grid.vMargin
}
mem.UpdateGraphAuto = function(arg = null, which = 2){
    if (which == 0 || which == 2)document.getElementsByClassName("ID_TASKID grid_graph")[0].children[4].innerText = (cfg.desktop.grid.modHmargin != 0 || arg) ? parseFloat(cfg.desktop.grid.modHmargin).toFixed(2) : ""
    if (which == 1 || which == 2)document.getElementsByClassName("ID_TASKID grid_graph")[0].children[5].innerText = (cfg.desktop.grid.modVmargin != 0 || arg) ? parseFloat(cfg.desktop.grid.modVmargin).toFixed(2) : ""
}
mem.UpdateGraph2 = function(num = false){
    document.getElementsByClassName("ID_TASKID grid_graph")[1].children[0].children[0].innerText = cfg.desktop.grid.hLength
    document.getElementsByClassName("ID_TASKID grid_graph")[1].children[1].innerText = cfg.desktop.grid.vLength
    document.getElementsByClassName("ID_TASKID grid_graph")[1].children[5].style.backgroundImage = (cfg.desktop.grid.sendStash) ? "url('./assets/deskIconGrid_stash.svg')" : "url('./assets/deskIconGrid_bin.svg')"

    let dot = document.getElementsByClassName("ID_TASKID grid_graph")[1].children[7]
    let dir = document.getElementsByClassName("ID_TASKID grid_graph")[1].children[4]
    let img = document.getElementsByClassName("ID_TASKID grid_graph")[1]

    mem.var.hLengthHTML.innerText = cfg.desktop.grid.hLength
    mem.var.vLengthHTML.innerText = cfg.desktop.grid.vLength

    if (dot.offsetLeft > 174) {
        img.style.backgroundImage = "url('./assets/deskIconGridGraph2/deskIconGridGraph2_00.svg')"
        dir.innerText = "+0"
    }
    if (dot.offsetLeft <= 174 && dot.offsetLeft > 141) {
        img.style.backgroundImage = (cfg.desktop.grid.sendBorder) ? "url('./assets/deskIconGridGraph2/deskIconGridGraph2_02-1.svg')" : "url('./assets/deskIconGridGraph2/deskIconGridGraph2_02-2.svg')"
        dir.innerText = "+0"
    }
    if (dot.offsetLeft <= 141 && dot.offsetLeft > 108) {
        img.style.backgroundImage = (cfg.desktop.grid.sendBorder) ? "url('./assets/deskIconGridGraph2/deskIconGridGraph2_03-1.svg')" : "url('./assets/deskIconGridGraph2/deskIconGridGraph2_03-2.svg')"
        dir.innerText = "+1"
    }
    if (dot.offsetLeft === 108) {
        img.style.backgroundImage = "url('./assets/deskIconGridGraph2/deskIconGridGraph2_01.svg')"
        dir.innerText = "+4"
    }
}