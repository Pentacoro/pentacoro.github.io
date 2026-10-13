import {getTask} from "/plexos/lib/functions/dll.js"
import {control, bindField} from "/plexos/lib/functions/controls.js"
import Icon from "/plexos/lib/classes/interface/icon.js"

let task = getTask(/TASKID/)
let mem  = task.mem
mem.tab  = {}
mem.rows = {}

mem.var.configObject = JSON.parse(JSON.stringify(mem.arg))
mem.var.configObject.cfg.icon = new Icon (mem.arg.cfg.icon)
mem.var.configInitialState = mem.arg

const sheet = control("propertySheet", {
    idPrefix: task.id,
    tabs: [
        { id: "general",  label: "General" },
        { id: "metadata", label: "Metadata", hidden: true },
        { id: "details",  label: "Details",  hidden: true },
        { id: "icon",     label: "Icon" },
    ],
    buttons: [
        { id: "accept", label: "Accept" },
        { id: "cancel", label: "Cancel" },
        { id: "apply",  label: "Apply", disabled: true },
    ],
})
task.node.getElementById(task.id + "_root").appendChild(sheet.node)
mem.ui = { sheet }

const configTarget = () => mem.var.configObject
const onChange = () => mem.onChange()

function addField(tabId, key, options) {
    const field = control("field", { id: task.id + "_" + key, ...options })
    sheet.keyNodes.tabs[tabId].body.appendChild(field.node)
    mem.tab[tabId][key] = field.keyNodes.input
    mem.rows[key] = field.keyNodes.row
    if (options.bind) bindField(field.keyNodes.input, { target: configTarget, onChange, ...options.bind })
    return field
}
function addSeparator(tabId) {
    sheet.keyNodes.tabs[tabId].body.appendChild(control("separator").node)
}

//GENERAL
mem.tab.general = {}

const generalHeader = addField("general", "fileHeader", { type: "header" })
mem.ui.fileIcon = generalHeader.keyNodes.image
delete mem.tab.general.fileHeader
const fileName = control("input", { type: "text", id: task.id + "_fileName" })
generalHeader.keyNodes.input.appendChild(fileName.node)
mem.tab.general.fileName = fileName.keyNodes.input
addSeparator("general")

addField("general", "fileClass", { label: "Class:" })
addField("general", "fileExte",  { label: "Extension:" })
addSeparator("general")

addField("general", "fileAddr", { label: "Path:" })
addField("general", "fileSize", { label: "Size:" })
addSeparator("general")

addField("general", "fileDateCreated",  { label: "Created:" })
addField("general", "fileDateModified", { label: "Modified:" })
addField("general", "fileDateAccessed", { label: "Accessed:" })
addSeparator("general")

addField("general", "fileReadOnly", { type: "checkbox", label: "Read Only:", bind: { path: "cfg.edit", inverted: true } })
addField("general", "fileHidden",   { type: "checkbox", label: "Hidden:",    bind: { path: "cfg.hidden" } })

//METADATA
if (mem.arg.cfg.class==="MetaFile") {
    mem.tab.metadata = {}

    const metaHeader = addField("metadata", "metaHeader", { type: "header" })
    mem.ui.metaImage = metaHeader.keyNodes.image
    delete mem.tab.metadata.metaHeader
    const metaName = control("text", { id: task.id + "_metaName" })
    const metaUrl  = control("input", { type: "url", id: task.id + "_metaUrl" })
    metaHeader.keyNodes.input.append(metaName.node, metaUrl.node)
    mem.tab.metadata.metaName = metaName.keyNodes.text
    mem.tab.metadata.metaUrl  = metaUrl.keyNodes.input
    bindField(metaUrl.keyNodes.input, { target: configTarget, onChange, path: "meta.url" })
    addSeparator("metadata")

    addField("metadata", "metaTitle",       { type: "text", label: "Title:", bind: { path: "meta.title" } })
    addField("metadata", "metaDescription", { type: "textarea", label: "Description:", wide: "x2", bind: { path: "meta.description" } })
    addSeparator("metadata")

    addField("metadata", "metaIcon",  { type: "url", label: "Icon:",  bind: { path: "meta.icon" } })
    addField("metadata", "metaImage", { type: "url", label: "Image:", bind: { path: "meta.image" } })
    addSeparator("metadata")

    addField("metadata", "metaEmbed",    { type: "text", label: "Embed:",    bind: { path: "meta.embed" } })
    addField("metadata", "metaDownload", { type: "url",  label: "Download:", bind: { path: "meta.download" } })
    addSeparator("metadata")

    addField("metadata", "metaNewtab", { type: "checkbox", label: "New Tab:", hint: "Open link in new browser tab", bind: { path: "meta.newtab" } })
} else {
    sheet.removeTab("metadata")
}
