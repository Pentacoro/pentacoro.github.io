import {getTask, imposeValues} from "/plexos/lib/functions/dll.js"
import {wireSheet} from "/plexos/lib/functions/controls.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import Task from "/plexos/lib/classes/system/task.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let fields = mem.ui.fields
mem.cfg = Task.get("Desktop").mem.cfg

function saveConfig() {
    File.at(mem.var.configFilePath).data = JSON.stringify(mem.cfg.grid, null, "\t")
}

//on app close
task.onEnd = function () {
    mem.cfg.grid = mem.var.configInitialState
    task.cmd("event.emit", {eventName: "desktop-grid-settings-closed"})
    saveConfig()
}

//footer buttons; on editable change
mem.onChange = wireSheet(mem.ui.sheet, task, {
    change: () => {
        task.cmd("event.emit", {eventName: "desktop-grid-settings-change"})
        mem.updateGridGraph()
        mem.updateTileGraph()
        mem.updateTileGraphAuto()
    },
    apply: () => {
        task.emit(task.id+"-applyBefore")
        saveConfig()
        imposeValues(mem.var.configInitialState, mem.cfg.grid)
        task.emit(task.id+"-apply")
    },
})

//deselection
document.onmousedown = e => {
    if (window.getSelection) {window.getSelection().removeAllRanges()}
    else if (document.selection) {document.selection.empty()}
}

//auto margin reset on uncheck and on input change
fields.hMargin.autoCheck.addEventListener("click", e=>{
    if (e.target.checked) return
    mem.cfg.grid.modHmargin = 0
    mem.cfg.grid.hMargin = Number(fields.hMargin.input.value)
    mem.updateTileGraphAuto()
    task.cmd("event.emit", {eventName: "desktop-grid-settings-change"})
})
fields.vMargin.autoCheck.addEventListener("click", e=>{
    if (e.target.checked) return
    mem.cfg.grid.modVmargin = 0
    mem.cfg.grid.vMargin = Number(fields.vMargin.input.value)
    mem.updateTileGraphAuto()
    task.cmd("event.emit", {eventName: "desktop-grid-settings-change"})
})
fields.hMargin.input.addEventListener("click", e=>{
    mem.cfg.grid.modHmargin = 0
    mem.cfg.grid.hMargin = Number(fields.hMargin.input.value)
    mem.updateTileGraphAuto()
    task.cmd("event.emit", {eventName: "desktop-grid-settings-change"})
})
fields.vMargin.input.addEventListener("click", e=>{
    mem.cfg.grid.modVmargin = 0
    mem.cfg.grid.vMargin = Number(fields.vMargin.input.value)
    mem.updateTileGraphAuto()
    task.cmd("event.emit", {eventName: "desktop-grid-settings-change"})
})
fields.stickToBorder.input.addEventListener("click", e=>{
    mem.updateGridGraphDrag()
})
fields.hideOnShrink.input.addEventListener("click", e=>{
    mem.updateGridGraphDrag()
})
