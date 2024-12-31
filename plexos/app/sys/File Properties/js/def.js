import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem
mem.element = {}

mem.var.config = mem.arg //set object
mem.var.configFile = "" //set config file path
mem.var.configInitial = { ...eval(mem.var.config)}

mem.element.fileName = task.node.getElementById(task.id+"_fileName")
mem.element.fileType = task.node.getElementById(task.id+"_fileType")
mem.element.fileExte = task.node.getElementById(task.id+"_fileExte")
mem.element.fileAddr = task.node.getElementById(task.id+"_fileAddr")
mem.element.fileSize = task.node.getElementById(task.id+"_fileSize")

mem.element.fileDateCreated  = task.node.getElementById(task.id+"_fileDateCreated")
mem.element.fileDateModified = task.node.getElementById(task.id+"_fileDateModified")
mem.element.fileDateAccessed = task.node.getElementById(task.id+"_fileDateAccessed")

mem.element.fileReadOnly = task.node.getElementById(task.id+"_fileReadOnly")
mem.element.fileHidden = task.node.getElementById(task.id+"_fileHidden")