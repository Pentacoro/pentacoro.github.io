let desktop = Task.openInstance("Desktop")
let mem  = Task.id("TASKID").mem

//begin with 1st tab selected
document.getElementById("ID_TASKID.tabResizing").checked = true

//set values to booleans
/*
if (cfg.desktop.grid.sendStash === true) {
    document.getElementById("ID_TASKID.optboolStash").checked = true
} else {
    document.getElementById("ID_TASKID.optboolBin").checked = true
}

if (cfg.desktop.grid.sendBorder === true) {
    document.getElementById("ID_TASKID.optboolBorder").checked = true
} else {
    document.getElementById("ID_TASKID.optboolOrder").checked = true
}

if (cfg.desktop.grid.autoHmargin && cfg.desktop.grid.autoVmargin) {
    document.getElementById("ID_TASKID.marginCheckbox").checked = true
} else {
    document.getElementById("ID_TASKID.marginCheckbox").checked = false
}

if (cfg.desktop.grid.autoHlength && cfg.desktop.grid.autoVlength) {
    document.getElementById("ID_TASKID.lengthCheckbox").checked = true
} else {
    document.getElementById("ID_TASKID.lengthCheckbox").checked = false
}
*/

mem.UpdateGraph()
mem.UpdateGraphAuto()
mem.UpdateGraph2()