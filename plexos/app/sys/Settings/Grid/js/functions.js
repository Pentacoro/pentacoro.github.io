let mem  = task.mem
mem.onChange = function() {
    task.emit("desktop-grid-settings-change")
    if (document.getElementsByClassName("footer-apply")[0].disabled) {
        document.getElementsByClassName("footer-apply")[0].disabled = false
        document.getElementsByClassName("footer-apply")[0].classList.remove("disabled")
    }
    mem.updateGridGraph()
    mem.updateTileGraph()
    mem.updateTileGraphAuto()
}