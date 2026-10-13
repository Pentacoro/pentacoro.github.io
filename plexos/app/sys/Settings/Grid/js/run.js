import {getTask, displayComponent} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem

//begin with 1st tab selected
mem.ui.sheet.select("grid")

await displayComponent({
    url:"/plexos/res/components/graphs/desktop/grid_graph/grid_graph.html",
    taskid:task.id,
    container:mem.ui.graphs.grid
})
await displayComponent({
    url:"/plexos/res/components/graphs/desktop/tile_graph/tile_graph.html",
    taskid:task.id,
    container:mem.ui.graphs.tile
})

//set values to booleans
mem.updateGridGraph()
mem.updateTileGraph()
mem.updateTileGraphAuto()
