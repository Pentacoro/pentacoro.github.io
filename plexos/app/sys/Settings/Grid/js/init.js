let desktop = Task.openInstance("Desktop")
let mem  = Task.id("TASKID").mem

//begin with 1st tab selected
document.getElementsByClassName("config-tab")[0].children[0].checked = true

await dll.displayComponent({
    url:"/plexos/res/components/graphs/desktop/grid_graph/grid_graph.html",
    taskid:"TASKID",
    container:document.getElementsByClassName("ID_TASKID grid_graph_container")[0]
})
await dll.displayComponent({
    url:"/plexos/res/components/graphs/desktop/tile_graph/tile_graph.html",
    taskid:"TASKID",
    container:document.getElementsByClassName("ID_TASKID tile_graph_container")[0]
})

//set values to booleans
mem.updateGridGraph()
mem.updateTileGraph()
mem.updateTileGraphAuto()