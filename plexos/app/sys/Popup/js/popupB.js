import Task from "/plexos/lib/classes/system/task.js"

let title       = arg[2]
let description = arg[3]
let taskid      = arg[4]
let image       = arg[5]

let task       = Task.id("TASKID").window.node
let windowNode = task.window.node
let window     = task.window

//set text to launcher arguments
if (title       != "") task.node.getElementsByClassName("message")[0].children[0].innerHTML = title
if (description != "") task.node.getElementsByClassName("message")[0].children[1].innerHTML = description
if (image       != "") task.node.getElementsByClassName("container")[0].children[0].setAttribute("src", image)
if (taskid      != "") {
    buttons = Task.id(taskid).mem.var.errorB
    for (button of buttons) {
        newButton = document.createElement("button")
        newButton.setAttribute("class", "option")
        newButton.innerHTML = button[0]
        task.node.getElementsByClassName("buttons")[0].appendChild(newButton)
        newButton.onclick = e => {
            if (button[1]) button[1]()
            Task.endTask("TASKID")
        }
    }
}