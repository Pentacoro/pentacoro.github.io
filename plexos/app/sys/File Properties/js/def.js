import {getTask} from "/plexos/lib/functions/dll.js"
import Icon from "/plexos/lib/classes/interface/icon.js"

let task = getTask(/TASKID/)
let mem  = task.mem
mem.tab = {}

mem.var.configObject = JSON.parse(JSON.stringify(mem.arg))
mem.var.configObject.cfg.icon = new Icon (mem.arg.cfg.icon)
mem.var.configEditable = "mem.var.configObject"
mem.var.configInitialState = mem.arg

//GENERAL
mem.tab.general = {}

mem.tab.general.fileName = task.node.getElementById(task.id+"_fileName")
mem.tab.general.fileClass = task.node.getElementById(task.id+"_fileClass")
mem.tab.general.fileExte = task.node.getElementById(task.id+"_fileExte")
mem.tab.general.fileAddr = task.node.getElementById(task.id+"_fileAddr")
mem.tab.general.fileSize = task.node.getElementById(task.id+"_fileSize")

mem.tab.general.fileDateCreated  = task.node.getElementById(task.id+"_fileDateCreated")
mem.tab.general.fileDateModified = task.node.getElementById(task.id+"_fileDateModified")
mem.tab.general.fileDateAccessed = task.node.getElementById(task.id+"_fileDateAccessed")

mem.tab.general.fileReadOnly = task.node.getElementById(task.id+"_fileReadOnly")
mem.tab.general.fileHidden = task.node.getElementById(task.id+"_fileHidden")

//METADATA
if (mem.arg.cfg.class==="Metafile") {
    mem.tab.metadata = {}
    
    mem.tab.metadata.metaName = task.node.getElementById(task.id+"_metaName")
    mem.tab.metadata.metaUrl  = task.node.getElementById(task.id+"_metaUrl")
    
    mem.tab.metadata.metaTitle       = task.node.getElementById(task.id+"_metaTitle")
    mem.tab.metadata.metaDescription = task.node.getElementById(task.id+"_metaDescription")
    
    mem.tab.metadata.metaEmbed    = task.node.getElementById(task.id+"_metaEmbed")
    mem.tab.metadata.metaDownload = task.node.getElementById(task.id+"_metaDownload")
    
    mem.tab.metadata.metaNewtab = task.node.getElementById(task.id+"_metaNewtab")
} else {
    task.node.getElementById(task.id+"_metadata").remove()
}