let desktop = Task.openInstance("Desktop")
let mem  = Task.id("TASKID").mem

//begin with 1st tab selected
document.getElementsByClassName("config-tab")[0].children[0].checked = true

//set values to booleans
mem.updateGraph()
mem.updateGraph2()
mem.updateGraphAuto()