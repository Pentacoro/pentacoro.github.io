let desktop = Task.openInstance("Desktop")
let mem  = Task.id("TASKID").mem

//set values to graph html
mem.updateGraph = function(num = false){
    document.getElementsByClassName("ID_TASKID grid_graph n1")[0].children[0].children[0].innerText = cfg.desktop.grid.hLength
    document.getElementsByClassName("ID_TASKID grid_graph n1")[0].children[1].innerText = cfg.desktop.grid.vLength
    document.getElementsByClassName("ID_TASKID grid_graph n1")[0].children[5].style.backgroundImage = (cfg.desktop.grid.hideOnShrink) ? "url('./assets/deskIconGrid_stash.svg')" : "url('./assets/deskIconGrid_bin.svg')"

    let dot = document.getElementsByClassName("ID_TASKID grid_graph n1")[0].children[7]
    let dir = document.getElementsByClassName("ID_TASKID grid_graph n1")[0].children[4]
    let img = document.getElementsByClassName("ID_TASKID grid_graph n1")[0]

    mem.var.hLengthHTML.innerText = cfg.desktop.grid.hLength
    mem.var.vLengthHTML.innerText = cfg.desktop.grid.vLength

    if (dot.offsetLeft > 174) {
        img.style.backgroundImage = "url('./assets/deskIconGridGraph2/deskIconGridGraph2_00.svg')"
        dir.innerText = "+0"
    }
    if (dot.offsetLeft <= 174 && dot.offsetLeft > 141) {
        img.style.backgroundImage = (cfg.desktop.grid.stickToBorder) ? "url('./assets/deskIconGridGraph2/deskIconGridGraph2_02-1.svg')" : "url('./assets/deskIconGridGraph2/deskIconGridGraph2_02-2.svg')"
        dir.innerText = "+0"
    }
    if (dot.offsetLeft <= 141 && dot.offsetLeft > 108) {
        img.style.backgroundImage = (cfg.desktop.grid.stickToBorder) ? "url('./assets/deskIconGridGraph2/deskIconGridGraph2_03-1.svg')" : "url('./assets/deskIconGridGraph2/deskIconGridGraph2_03-2.svg')"
        dir.innerText = "+1"
    }
    if (dot.offsetLeft === 108) {
        img.style.backgroundImage = "url('./assets/deskIconGridGraph2/deskIconGridGraph2_01.svg')"
        dir.innerText = "+4"
    }
}
mem.updateGraph2 = function(){
    document.getElementsByClassName("ID_TASKID grid_graph n2")[0].children[0].children[0].innerText = cfg.desktop.grid.width
    document.getElementsByClassName("ID_TASKID grid_graph n2")[0].children[1].innerText = cfg.desktop.grid.height
    document.getElementsByClassName("ID_TASKID grid_graph n2")[0].children[2].innerText = cfg.desktop.grid.hMargin
    document.getElementsByClassName("ID_TASKID grid_graph n2")[0].children[3].innerText = cfg.desktop.grid.vMargin
    mem.var.widthHTML.innerText = cfg.desktop.grid.width
    mem.var.heightHTML.innerText = cfg.desktop.grid.height
    mem.var.hMarginHTML.innerText = cfg.desktop.grid.hMargin
    mem.var.vMarginHTML.innerText = cfg.desktop.grid.vMargin
}
mem.updateGraphAuto = function(arg = null){
    document.getElementsByClassName("ID_TASKID grid_graph n2")[0].children[4].innerText = (cfg.desktop.grid.modHmargin != 0 || arg) ? parseFloat(cfg.desktop.grid.modHmargin).toFixed(2) : ""
    document.getElementsByClassName("ID_TASKID grid_graph n2")[0].children[5].innerText = (cfg.desktop.grid.modVmargin != 0 || arg) ? parseFloat(cfg.desktop.grid.modVmargin).toFixed(2) : ""
}

//run on value changes
mem.onChange = function() {
    if (document.getElementsByClassName("footer-apply")[0].disabled) {
        document.getElementsByClassName("footer-apply")[0].disabled = false
        document.getElementsByClassName("footer-apply")[0].classList.remove("disabled")
    }

    desktop.mem.grid.evaluateIconGrid(3)
    if (cfg.desktop.grid.autoHmargin || cfg.desktop.grid.autoVmargin || cfg.desktop.grid.autoHlength || cfg.desktop.grid.autoVlength) desktop.mem.grid.realTimeGridEval()
    mem.updateGraph()
    mem.updateGraph2()
    mem.updateGraphAuto()
}