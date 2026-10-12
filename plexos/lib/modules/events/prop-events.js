import plexos from "/plexos/ini/system.js"
import {getTask, imposeValues} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"
let cfg = plexos.Settings

let task = getTask(/TASKID/)
let mem  = task.mem

//configuration
/* 
mem.var.configEditable = "" //set editable object's reference
mem.var.configFilePath = "" //set config file path if existent
mem.var.configInitialState = { ...eval(mem.var.config)} //clone editable for initial state
*/

//on app close
task.onEnd = function () {
    eval(mem.var.configEditable +" = task.mem.var.configInitialState")
    task.emit(task.id+"-closed")
    if (mem.var.configFilePath) File.at(mem.var.configFilePath).data = JSON.stringify(eval(mem.var.configEditable), null, "\t")
}

//on editable change
mem.onChange = function() {
    task.emit(task.id+"-change")
    if (task.node.getElementsByClassName("footer-apply")[0].disabled) {
        task.node.getElementsByClassName("footer-apply")[0].disabled = false
        task.node.getElementsByClassName("footer-apply")[0].classList.remove("disabled")
    }
}

//deselection
document.onmousedown = e => {
    if (window.getSelection) {window.getSelection().removeAllRanges()}
    else if (document.selection) {document.selection.empty()}
}

//tabs functionality
for (let tab of task.node.getElementsByClassName("config-tab")) {
    let value = tab.children[0].value
    let input = tab.children[0]
    tab.addEventListener("click", e => {
        if (input.checked) {
            for (let content of task.node.getElementsByClassName("tabContent")) {content.classList.add("hidden")}
            task.node.getElementById(value).classList.remove("hidden")
            return
        }
    })
}

async function persistAppliedFile() {
    const file = mem.var.configInitialState
    const sKey = file?.cfg?.class ? File.classDefaults(file.cfg.class).skeyName : null
    if (!file?.cfg?.path || !sKey || sKey === "dir") return
    await task.cmd("file.modify", { path: file.cfg.path, data: file[sKey] })
}

async function applyConfig() {
    task.emit(task.id+"-applyBefore")
    if (typeof mem.applyFileChanges === "function") {
        await mem.applyFileChanges()
    } else {
        if (mem.var.configFilePath) File.at(mem.var.configFilePath).data = JSON.stringify(eval(mem.var.configEditable), null, "\t")
        imposeValues(mem.var.configInitialState, eval(mem.var.configEditable))
        await persistAppliedFile()
    }
    task.emit(task.id+"-apply")
}

//footer buttons 
task.node.getElementsByClassName("footer-accept")[0].onclick = async (e)=> {
    await applyConfig()
    task.end()
}
task.node.getElementsByClassName("footer-cancel")[0].onclick = (e)=> {
    task.end()
}
task.node.getElementsByClassName("footer-apply")[0].onclick = async (e)=> {
    await applyConfig()
    task.node.getElementsByClassName("footer-apply")[0].disabled = true
    task.node.getElementsByClassName("footer-apply")[0].classList.add("disabled")
}