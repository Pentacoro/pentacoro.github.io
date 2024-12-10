import {getTask} from "/plexos/lib/functions/dll.js"
let task = getTask(/TASKID/)
let mem  = task.mem
let arg  = mem.arg

//set text to launcher arguments
if (arg.title       != "") task.node.getElementsByClassName("message")[0].children[0].innerHTML = arg.title
if (arg.description != "") task.node.getElementsByClassName("message")[0].children[1].innerHTML = arg.description
if (arg.image            ) task.node.getElementsByClassName("container")[0].children[0].setAttribute("src", arg.image)
if (arg.taskid      != "") {
    let buttons = getTask(arg.taskid).mem.var.errorB
    for (let button of buttons) {
        let newButton = document.createElement("button")
        newButton.setAttribute("class", "config-footer-button")
        newButton.innerHTML = button[0]
        task.node.getElementsByClassName("buttons")[0].appendChild(newButton)
        newButton.onclick = e => {
            if (button[1]) button[1]()
            task.end()
        }
    }
}