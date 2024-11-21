import Task from "/plexos/lib/classes/system/task.js"

let title       = arg[2]
let description = arg[3]
let taskid      = arg[4]
let image       = arg[5]

let task       = Task.id("TASKID")
let windowNode = task.window.node
let window     = task.window

//set text to launcher arguments
if (title       != "") task.node.getElementsByClassName("message")[0].children[0].innerHTML = title
if (description != "") task.node.getElementsByClassName("message")[0].children[1].innerHTML = description
if (image       != "") task.node.getElementsByClassName("container")[0].children[0].setAttribute("src", image)
if (taskid      != "") {
    task.node.getElementsByClassName("details")[0].innerHTML  = ""
    let newDetails = document.createElement("p")
    let newButton = document.createElement("button")
    newButton.setAttribute("class", "error")
    newButton.innerHTML = "console.error()"

    task.node.getElementsByClassName("details")[0].appendChild(newDetails)
    task.node.getElementsByClassName("details")[0].children[0].innerHTML  = ""
    task.node.getElementsByClassName("details")[0].children[0].innerHTML += "<b>message: </b>" + Task.id(taskid).mem.var.error.message + "<br>"
    task.node.getElementsByClassName("details")[0].children[0].innerHTML += "<b>columnNumber: </b>" + Task.id(taskid).mem.var.error.columnNumber + "<br>"
    task.node.getElementsByClassName("details")[0].children[0].innerHTML += "<b>fileName: </b>" + Task.id(taskid).mem.var.error.fileName + "<br>"
    if (Task.id(taskid).mem.var.error.taskId){
        task.node.getElementsByClassName("details")[0].children[0].innerHTML+="<b>taskId: </b>" + Task.id(taskid).mem.var.error.taskId + "<br>"
    }
    if (Task.id(taskid).mem.var.error.source) {
        task.node.getElementsByClassName("details")[0].children[0].innerHTML+="<b>source: </b>" + Task.id(taskid).mem.var.error.source + "<br>"
    }
    task.node.getElementsByClassName("details")[0].children[0].innerHTML += "<b>lineNumber: </b>" + Task.id(taskid).mem.var.error.lineNumber + "<br><br><hr><br>"
    task.node.getElementsByClassName("details")[0].children[0].innerHTML += "<b>stack: </b><br>" + Task.id(taskid).mem.var.error.stack + "<br>"
    task.node.getElementsByClassName("details")[0].children[0].innerHTML += "<button class='error'>console.error()</button><br>"
    task.node.getElementsByClassName("details")[0].children[0].innerHTML += "<br><hr><br>"
    if (Task.id(taskid).mem.var.error.script){
        task.node.getElementsByClassName("details")[0].children[0].innerHTML+="<b>script: </b>" + Task.id(taskid).mem.var.error.script + "<br><hr><br>"
    }
}

task.node.getElementsByClassName("expand")[0].onclick = e => {
    if (task.node.getElementsByClassName("details")[0].style.display === "none") {
        task.node.getElementsByClassName("details")[0].style.display = "block"
        task.node.getElementsByClassName("appcontent")[0].style.height = "450px"

        window.heig += 300
        window.poseNode()
    } else {
        task.node.getElementsByClassName("details")[0].style.display = "none"
        task.node.getElementsByClassName("appcontent")[0].style.height = "150px"

        window.heig += -300
        window.poseNode()
    }
}
task.node.getElementsByClassName("error")[0].onclick = e => {
    console.error(Task.id(taskid).mem.var.error)
    task.node.getElementsByClassName("error")[0].onclick = null
}