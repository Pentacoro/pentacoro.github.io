import {plexos} from "/plexos/ini/system.js"
import {getTask} from "/plexos/lib/functions/dll.js"
let cfg = plexos.cfg

let task = getTask(/TASKID/)
let mem  = task.mem

//integer input 
for (let input of task.node.querySelectorAll(".config-option>[type='number']")) {
    let inputbox = input
    let variable = inputbox.getAttribute("name")
    if (variable) {
        inputbox.onchange = (e) => {
            eval(variable + " = " + Number(inputbox.value))
            if (inputbox.parentElement.children[3]) {
                eval(inputbox.parentElement.children[3].name + " = " + false)
                inputbox.parentElement.children[3].checked = false
                mem.onChange()
                return
            }
            mem.onChange()
        }
        inputbox.addEventListener("focusout", (e) => {
            eval(variable + " = " + Number(inputbox.value))
        })
    }   
}

//text input
for (let input of task.node.querySelectorAll(".config-option>[type='text']")) {
    let inputbox = input
    let variable = inputbox.getAttribute("name")
    if (variable) {
        inputbox.onchange = (e) => {
            eval(variable + " = " +JSON.stringify(inputbox.value))
            mem.onChange()
        }
        inputbox.addEventListener("focusout", (e) => {
            eval(variable + " = " + JSON.stringify(inputbox.value))
        })
    }
}

//auto button
for (let button of task.node.querySelectorAll(".config-option>[type='button'].auto")) {
    let variable = button.getAttribute("name")
    if (variable) {
        button.onclick = (e) => {
            if (eval(variable)) return
            eval(variable + " = " + true)
            mem.onChange()
            eval(variable + " = " + false)
        }
    }
}

//auto checkbox
for (let box of task.node.querySelectorAll(".config-option>[type='checkbox'].auto")) {
    let variable = box.getAttribute("name")
    let checkbox = box
    if (variable) {
        if (eval(variable)) checkbox.checked = true
        checkbox.onclick = (e) => {
            if (!checkbox.checked) {
                eval(variable + " = " + false)
                mem.onChange()
                return
            }
            eval(variable + " = " + true)
            mem.onChange()
        }
    }
}