let desktop = Task.openInstance("Desktop")
let mem  = Task.id("TASKID").mem

//on app close
Task.id("TASKID").appEnd = function () {
    //clone config to current state
    mem.var.configClone = { ...eval(mem.var.config)}

    //if auto checks are active, correct values to their latest state
    /* 
    if (mem.var.configClone.autoHlength) cfg.desktop.grid.hLength = mem.var.configClone.hLength
    if (mem.var.configClone.autoVlength) cfg.desktop.grid.vLength = mem.var.configClone.vLength
    if (mem.var.configClone.autoHmargin) cfg.desktop.grid.modHmargin = mem.var.configClone.modHmargin
    if (mem.var.configClone.autoVmargin) cfg.desktop.grid.modVmargin = mem.var.configClone.modVmargin
     */

    //always revert node visibility
    cfg.desktop.grid.visibleNodes = false
    Task.openInstance("Desktop").mem.grid.evaluateIconGrid(3)
    File.at(mem.var.configFile).data = JSON.stringify(eval(mem.var.config), null, "\t")
}

//deselection
document.onmousedown = e => {
    if (window.getSelection) {window.getSelection().removeAllRanges()}
    else if (document.selection) {document.selection.empty()}
}

//tabs functionality
for (tab of document.getElementsByClassName("config-tab")) {
    let value = tab.children[0].value
    let input = tab.children[0]
    tab.addEventListener("click", e => {
        if (input.checked) {
            for (content of document.getElementsByClassName("tabContent")) {content.classList.add("hidden")}
            document.getElementById(value).classList.remove("hidden")
            return
        }
    })
}

//footer buttons 
document.getElementsByClassName("footer-accept")[0].onclick = (e)=> {
    File.at(mem.var.configFile).data = JSON.stringify(eval(mem.var.config), null, "\t")
    Task.id("TASKID").end()
}
document.getElementsByClassName("footer-cancel")[0].onclick = (e)=> {
    new Function(mem.var.config +" = Task.id('TASKID').mem.var.configClone")()
    Task.id("TASKID").end()
}
document.getElementsByClassName("footer-apply")[0].onclick = (e)=> {
    File.at(mem.var.configFile).data = JSON.stringify(eval(mem.var.config), null, "\t")
    mem.var.configClone = { ...eval(mem.var.config)}
    document.getElementsByClassName("footer-apply")[0].disabled = true
    document.getElementsByClassName("footer-apply")[0].classList.add("disabled")
}

//integer input 
for (input of document.getElementsByClassName("optionValue")) {
    let inputbox = input
    let variable = inputbox.getAttribute("name")
    inputbox.onchange = (e) => {
        new Function(variable + " = " + Number(inputbox.value))()
        if (inputbox.parentElement.children[3]) {
            new Function(inputbox.parentElement.children[3].name + " = " + false)()
            inputbox.parentElement.children[3].checked = false
            mem.onChange()
            return
        }
        mem.onChange()
    }
    inputbox.addEventListener("focusout", (e) => {
        new Function(variable + " = " + Number(inputbox.value))
    })
}

//auto button
for (button of document.getElementsByClassName("optionButton")) {
    let variable = button.getAttribute("name")
    button.onclick = (e) => {
        if (eval(variable)) return
        new Function(variable + " = " + true)()
        mem.onChange()
        new Function(variable + " = " + false)()
    }
}

//auto checkbox
for (box of document.getElementsByClassName("optionCheck")) {
    let variable = box.getAttribute("name")
    let checkbox = box
    if (eval(variable)) checkbox.checked = true
    checkbox.onclick = (e) => {
        if (!checkbox.checked) {
            new Function(variable + " = " + false)()
            mem.onChange()
            return
        }
        new Function(variable + " = " + true)()
        mem.onChange()
    }
}

//auto margin reset on uncheck and on input change
document.getElementsByName("cfg.desktop.grid.autoHmargin")[1].addEventListener("click", e=>{
    if (e.target.checked) return
    cfg.desktop.grid.modHmargin = 0
    cfg.desktop.grid.hMargin = Number(mem.var.hMarginHTML.value)
    mem.updateGraphAuto()
    desktop.mem.grid.evaluateIconGrid(2)
})
document.getElementsByName("cfg.desktop.grid.autoVmargin")[1].addEventListener("click", e=>{
    if (e.target.checked) return
    cfg.desktop.grid.modVmargin = 0
    cfg.desktop.grid.vMargin = Number(mem.var.vMarginHTML.value)
    mem.updateGraphAuto()
    desktop.mem.grid.evaluateIconGrid(2)
})
document.getElementsByName("cfg.desktop.grid.hMargin")[0].addEventListener("click", e=>{
    cfg.desktop.grid.modHmargin = 0
    cfg.desktop.grid.hMargin = Number(mem.var.hMarginHTML.value)
    mem.updateGraphAuto()
    desktop.mem.grid.evaluateIconGrid(2)
})
document.getElementsByName("cfg.desktop.grid.vMargin")[0].addEventListener("click", e=>{
    cfg.desktop.grid.modVmargin = 0
    cfg.desktop.grid.vMargin = Number(mem.var.vMarginHTML.value)
    mem.updateGraphAuto()
    desktop.mem.grid.evaluateIconGrid(2)
})

//graph1 interactive drag
document.getElementsByClassName("ID_TASKID grid_graph n1")[0].children[7].onmousedown = e => {
    let pX = e.target.offsetLeft
    let mX = Math.round((e.clientX)/33)*33 + 9
    let dot = e.target
    let line = document.getElementsByClassName("ID_TASKID grid_graph n1")[0].children[6]

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

        mem.updateGraph()
    }
    function dragEnd(e){
        document.onmousemove = null
        document.onmouseup = null
        dot.parentElement.style.cursor = ""
    }
}