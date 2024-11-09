let desktop = Task.openInstance("Desktop")
let mem  = Task.id("TASKID").mem

//deselection
document.onmousedown = e => {
    if (window.getSelection) {window.getSelection().removeAllRanges()}
    else if (document.selection) {document.selection.empty()}
}

//tabs functionality
document.getElementById("ID_TASKID.tabPositioning").addEventListener("click", e => {
    if (e.target.checked) {
        document.getElementById("ID_TASKID.tabContent1").classList.remove("hidden")
        document.getElementById("ID_TASKID.tabContent2").classList.add("hidden")
        return
    }
})
document.getElementById("ID_TASKID.tabResizing").addEventListener("click", e => {
    if (e.target.checked) {
        document.getElementById("ID_TASKID.tabContent2").classList.remove("hidden")
        document.getElementById("ID_TASKID.tabContent1").classList.add("hidden")
        return
    }
})

//edit buttons functionality
for (option of document.getElementsByClassName("optionValue")){
    option.onclick = (e) => mem.editContent(e.target.parentElement)
    //option.parentElement.children[2].children[0].onclick = (e) => mem.editContent(e.target.parentElement.parentElement)
}

//booleans functionality
for (option of document.getElementsByClassName("ID_TASKID editBoolean")){
    option.onclick = (e) => mem.editBoolean(e.target)
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
/*
document.getElementById("ID_TASKID.marginButton").onclick = e => {
    cfg.desktop.grid.autoHmargin = true
    cfg.desktop.grid.autoVmargin = true
    mem.UpdateGraphAuto()
    desktop.mem.grid.evaluateIconGrid(null,1)
    cfg.desktop.grid.autoHmargin = false
    cfg.desktop.grid.autoVmargin = false
}
document.getElementById("ID_TASKID.marginCheckbox").onclick = e => {
    if(e.target.checked == true){
        cfg.desktop.grid.autoHmargin = true
        cfg.desktop.grid.autoVmargin = true
        mem.UpdateGraphAuto()
        desktop.mem.grid.realTimeGridEval()

        desktop.mem.grid.evaluateIconGrid(null,1)
    } else {
        cfg.desktop.grid.autoHmargin = false
        cfg.desktop.grid.autoVmargin = false
        cfg.desktop.grid.modHmargin = 0
        cfg.desktop.grid.modVmargin = 0
        mem.UpdateGraphAuto()
        desktop.mem.grid.realTimeGridEval()

        desktop.mem.grid.evaluateIconGrid(null,2)
    }
}
document.getElementById("ID_TASKID.lengthButton").onclick = e => {
    cfg.desktop.grid.autoHlength = true
    cfg.desktop.grid.autoVlength = true
    desktop.mem.grid.evaluateIconGrid(null,1)
    mem.UpdateGraph2()
    cfg.desktop.grid.autoHlength = false
    cfg.desktop.grid.autoVlength = false
}
document.getElementById("ID_TASKID.lengthCheckbox").onclick = e => {
    if(e.target.checked == true){
        cfg.desktop.grid.autoHlength = true
        cfg.desktop.grid.autoVlength = true
        desktop.mem.grid.realTimeGridEval()
        
        desktop.mem.grid.evaluateIconGrid(null,1)
        mem.UpdateGraph2()
    } else {
        cfg.desktop.grid.autoHlength = false
        cfg.desktop.grid.autoVlength = false
        desktop.mem.grid.realTimeGridEval()
    }
}
*/

//graph incteractives updating
document.getElementsByClassName("ID_TASKID grid_graph")[1].children[7].onmousedown = e => {
    let pX = e.target.offsetLeft
    let mX = Math.round((e.clientX)/33)*33 + 9
    let dot = e.target
    let line = document.getElementsByClassName("ID_TASKID grid_graph")[1].children[6]

    document.onmousemove = dragDot
    document.onmouseup = dragEnd

    function dragDot(e){
        e = e || window.event
        e.preventDefault()

        dot.parentElement.style.cursor = "w-resize"

        let nX = pX + e.clientX - mX
        
        if(nX >= 105 && nX <= 207) dot.style.left = nX + "px"
        if(nX <= 108) dot.style.left = 108 + "px"
        if(nX >= 207) dot.style.left = 207 + "px"
        
        dot.style.left = (Math.round((dot.offsetLeft)/33)*33 + 9) + "px"

        line.style.width = 207 - dot.offsetLeft + "px"
        line.style.left = dot.offsetLeft + 5 + "px"

        mem.UpdateGraph2()
    }
    function dragEnd(e){
        document.onmousemove = null
        document.onmouseup = null
        dot.parentElement.style.cursor = ""
    }
}