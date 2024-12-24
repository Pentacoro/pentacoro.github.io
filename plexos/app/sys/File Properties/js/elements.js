import {getTask, displayComponent} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/files/file.js"

let task = getTask(/TASKID/)
let mem  = task.mem
mem.element = {}

mem.element.fileName = task.node.getElementById(task.id+"_fileName")
mem.element.fileType = task.node.getElementById(task.id+"_fileType")
mem.element.fileExte = task.node.getElementById(task.id+"_fileExte")
mem.element.fileAddr = task.node.getElementById(task.id+"_fileAddr")
mem.element.fileSize = task.node.getElementById(task.id+"_fileSize")

mem.element.fileDateCreated  = task.node.getElementById(task.id+"_fileDateCreated")
mem.element.fileDateModified = task.node.getElementById(task.id+"_fileDateModified")
mem.element.fileDateAccessed = task.node.getElementById(task.id+"_fileDateAccessed")

mem.element.fileWriteOnly = task.node.getElementById(task.id+"_fileWriteOnly")
mem.element.fileHidden = task.node.getElementById(task.id+"_fileHidden")