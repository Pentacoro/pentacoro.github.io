let desktop = Task.openInstance("Desktop")
let mem  = Task.id("TASKID").mem

//run on value changes
mem.onChange = function() {
    if (document.getElementsByClassName("footer-apply")[0].disabled) {
        document.getElementsByClassName("footer-apply")[0].disabled = false
        document.getElementsByClassName("footer-apply")[0].classList.remove("disabled")
    }

    desktop.mem.grid.evaluateIconGrid(3)
    if (cfg.desktop.grid.autoHmargin || cfg.desktop.grid.autoVmargin || cfg.desktop.grid.autoHlength || cfg.desktop.grid.autoVlength) desktop.mem.grid.realTimeGridEval()
    mem.updateGridGraph()
    mem.updateTileGraph()
    mem.updateTileGraphAuto()
}