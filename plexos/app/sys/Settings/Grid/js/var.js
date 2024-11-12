let desktop = Task.openInstance("Desktop")
let mem  = Task.id("TASKID").mem
mem.apps = "exp"
mem.var = {}

//configuration
mem.var.config = "cfg.desktop.grid"
mem.var.configFile = "config/desktop/grid.json"
mem.var.configClone= JSON.parse(File.at(mem.var.configFile).data)

//html references
mem.var.widthHTML = document.getElementsByName("cfg.desktop.grid.width")[0]
mem.var.heightHTML = document.getElementsByName("cfg.desktop.grid.height")[0]
mem.var.hMarginHTML = document.getElementsByName("cfg.desktop.grid.hMargin")[0]
mem.var.vMarginHTML = document.getElementsByName("cfg.desktop.grid.vMargin")[0]
mem.var.hLengthHTML = document.getElementsByName("cfg.desktop.grid.hLength")[0]
mem.var.vLengthHTML = document.getElementsByName("cfg.desktop.grid.vLength")[0]

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