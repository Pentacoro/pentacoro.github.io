import Task from "/plexos/lib/classes/system/task.js"

let task = Task.id("TASKID")
let mem  = task.mem

//begin with 1st tab selected
task.node.getElementsByClassName("config-tab")[0].children[0].checked = true

await dll.displayComponent({
    url:"/plexos/res/components/graphs/desktop/grid_graph/grid_graph.html",
    taskid:"TASKID",
    container:task.node.getElementsByClassName("grid_graph_container")[0]
})
await dll.displayComponent({
    url:"/plexos/res/components/graphs/desktop/tile_graph/tile_graph.html",
    taskid:"TASKID",
    container:task.node.getElementsByClassName("tile_graph_container")[0]
})

//set values to booleans
mem.updateGridGraph()
mem.updateTileGraph()
mem.updateTileGraphAuto()