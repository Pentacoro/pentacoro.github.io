import {getTask} from "/plexos/lib/functions/dll.js"
import {control, bindField, bindAuto} from "/plexos/lib/functions/controls.js"
import Task from "/plexos/lib/classes/system/task.js"

let task = getTask(/TASKID/)
let mem  = task.mem
mem.cfg  = Task.get("Desktop").mem.cfg
mem.var  = {}

//configuration
mem.var.configFilePath = mem.cfg.path+"/grid.json"
mem.var.configInitialState = { ...mem.cfg.grid }

const sheet = control("propertySheet", {
    idPrefix: task.id,
    tabs: [
        { id: "grid", label: "Grid" },
        { id: "tile", label: "Tile" },
    ],
    buttons: [
        { id: "accept", label: "Accept" },
        { id: "cancel", label: "Cancel" },
        { id: "apply",  label: "Apply", disabled: true },
    ],
})
task.node.getElementById(task.id + "_root").appendChild(sheet.node)
mem.ui = { sheet, fields: {}, graphs: {} }

const gridTarget = () => mem.cfg.grid
const onChange = () => mem.onChange()

function addGraph(tabId, className) {
    const tab = sheet.keyNodes.tabs[tabId]
    const node = document.createElement("div")
    node.className = `${className} graph_container`
    tab.panel.insertBefore(node, tab.body)
    mem.ui.graphs[tabId] = node
}
function addHeading(tabId, text) {
    sheet.keyNodes.tabs[tabId].body.appendChild(control("heading", { text }).node)
}
function addField(tabId, key, options, autoPath) {
    const field = control("field", { id: task.id + "_" + key, auto: !!autoPath, ...options })
    sheet.keyNodes.tabs[tabId].body.appendChild(field.node)
    mem.ui.fields[key] = field.keyNodes
    if (autoPath) bindAuto(field.keyNodes, { target: gridTarget, path: key, autoPath, onChange })
    else bindField(field.keyNodes.input, { target: gridTarget, path: key, onChange })
}

//GRID
addGraph("grid", "grid_graph_container")
addHeading("grid", "LENGTH")
addField("grid", "hLength", { type: "number", label: "X-Axis:", min: 0 }, "autoHlength")
addField("grid", "vLength", { type: "number", label: "Y-Axis:", min: 0 }, "autoVlength")
addHeading("grid", "ICONS")
addField("grid", "stickToBorder", { type: "checkbox", label: "Sticky:", hint: "Stick icons to end borders for resizes" })
addField("grid", "hideOnShrink",  { type: "checkbox", label: "Hide:",   hint: "Hide icons left off the grid (desk only)" })

//TILE
addGraph("tile", "tile_graph_container")
addHeading("tile", "SIZE")
addField("tile", "width",  { type: "number", label: "Width:",  min: 10 })
addField("tile", "height", { type: "number", label: "Height:", min: 10 })
addHeading("tile", "MARGIN")
addField("tile", "hMargin", { type: "number", label: "Horizontal:", min: 0 }, "autoHmargin")
addField("tile", "vMargin", { type: "number", label: "Vertical:",   min: 0 }, "autoVmargin")

//html references used by the graph components
mem.var.widthHTML   = mem.ui.fields.width.input
mem.var.heightHTML  = mem.ui.fields.height.input
mem.var.hMarginHTML = mem.ui.fields.hMargin.input
mem.var.vMarginHTML = mem.ui.fields.vMargin.input
mem.var.hLengthHTML = mem.ui.fields.hLength.input
mem.var.vLengthHTML = mem.ui.fields.vLength.input
