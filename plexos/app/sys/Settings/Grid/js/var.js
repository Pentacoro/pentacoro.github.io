let desktop = Task.openInstance("Desktop")
let mem  = Task.id("TASKID").mem
mem.apps = "exp"
mem.var = {}

//html references
mem.var.widthHTML = document.getElementById("ID_TASKID.grid.width")
mem.var.heightHTML = document.getElementById("ID_TASKID.grid.height")
mem.var.hMarginHTML = document.getElementById("ID_TASKID.grid.hMargin")
mem.var.vMarginHTML = document.getElementById("ID_TASKID.grid.vMargin")
mem.var.hLengthHTML = document.getElementById("ID_TASKID.grid.hLength")
mem.var.vLengthHTML = document.getElementById("ID_TASKID.grid.vLength")

//set values to html
mem.var.widthHTML.value = cfg.desktop.grid.width
mem.var.heightHTML.value = cfg.desktop.grid.height
mem.var.hMarginHTML.value = cfg.desktop.grid.hMargin
mem.var.vMarginHTML.value = cfg.desktop.grid.vMargin
mem.var.hLengthHTML.value = cfg.desktop.grid.hLength
mem.var.vLengthHTML.value = cfg.desktop.grid.vLength

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
    dll.preloadImage(image)
}