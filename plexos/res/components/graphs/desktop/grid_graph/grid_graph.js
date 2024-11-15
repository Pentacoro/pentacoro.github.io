let mem  = Task.id("TASKID").mem

mem.updateGridGraph = function(num = false){
    document.getElementsByClassName("ID_TASKID grid_graph")[0].children[0].children[0].innerText = cfg.desktop.grid.hLength
    document.getElementsByClassName("ID_TASKID grid_graph")[0].children[1].innerText = cfg.desktop.grid.vLength
    document.getElementsByClassName("ID_TASKID grid_graph")[0].children[5].style.backgroundImage = "url('./graph_hidden.svg')"

    mem.var.hLengthHTML.innerText = cfg.desktop.grid.hLength
    mem.var.vLengthHTML.innerText = cfg.desktop.grid.vLength
}
//interactive drag
document.getElementsByClassName("ID_TASKID graph_sizeDot")[0].onmousedown = e => {
    let pX = e.target.offsetLeft
    let mX = Math.round((e.clientX)/33)*33 + 9
    let dot = e.target
    let line = document.getElementsByClassName("ID_TASKID grid_graph")[0].children[6]

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

        let dir = document.getElementsByClassName("ID_TASKID grid_graph")[0].children[4]
        let img = document.getElementsByClassName("ID_TASKID grid_graph")[0]

        if (dot.offsetLeft > 174) {
            img.style.backgroundImage = "url('./grid_graph_00.svg')"
            dir.innerText = "0"
        }
        if (dot.offsetLeft <= 174 && dot.offsetLeft > 141) {
            img.style.backgroundImage = (cfg.desktop.grid.stickToBorder) ? "url('./grid_graph_02-1.svg')" : "url('./grid_graph_02-2.svg')"
            dir.innerText = "0"
        }
        if (dot.offsetLeft <= 141 && dot.offsetLeft > 108) {
            img.style.backgroundImage = (cfg.desktop.grid.stickToBorder) ? "url('./grid_graph_03-1.svg')" : "url('./grid_graph_03-2.svg')"
            dir.innerText = "1"
        }
        if (dot.offsetLeft === 108) {
            img.style.backgroundImage = "url('./grid_graph_01.svg')"
            dir.innerText = "4"
        }
    }
    function dragEnd(e){
        document.onmousemove = null
        document.onmouseup = null
        dot.parentElement.style.cursor = ""
    }
}

//preload graph2 images
mem.var.graph2images = 
[
    "./grid_graph_00.svg",
    "./grid_graph_01.svg",
    "./grid_graph_02-1.svg",
    "./grid_graph_02-2.svg",
    "./grid_graph_02-3.svg",
    "./grid_graph_03-1.svg",
    "./grid_graph_03-2.svg",
    "./grid_graph_03-3.svg",
]
for (image of mem.var.graph2images){
    dll.preloadImage(image)
}