import {getTask, displayComponent, ajaxReturn} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let arg  = mem.arg

mem.var.details = task.node.getElementsByClassName("details")[0]
mem.error   = getTask(arg.taskid).mem.var.error

mem.drawCode = async function () {
    let codeParser = task.node.getElementsByClassName("codeParser")[0]
    let sourcedScript = await ajaxReturn("GET",mem.error.fileName)
    await task.newComponent({
        url:"/plexos/res/components/codeParser/code.html",
        task:this,
        container:codeParser,
        args:{code:((sourcedScript===mem.error.script) ? mem.error.script : sourcedScript)},
    })
    let scrollBar = document.createElement("div")
    scrollBar.setAttribute("id", "scrollBar-codeParser")
    scrollBar.setAttribute("class", "scrollBar-container")
    codeParser.appendChild(scrollBar)
    await task.newComponent({
        url:"/plexos/res/components/interactives/scrollBar/scrollBar.html",
        task:this,
        container:scrollBar,
        args:{subject:task.node.getElementsByClassName("codeParser")[0].children[0],position:"bottom",sticky:mem.var.details}
    })
    if (mem.error.lineNumber) task.node.getElementsByClassName("codeBox")[0].children[mem.error.lineNumber-1].classList.add("error")
    task.node.getElementsByClassName("expand")[0].addEventListener("click", task.components[1].mem.updateScrollBar)
    task.node.getElementsByClassName("expand")[0].addEventListener("click", task.components[1].mem.updateStickyBar)
}
if (arg.title)      task.node.getElementsByClassName("message")[0].children[0].innerHTML = arg.title
if (arg.description)task.node.getElementsByClassName("message")[0].children[1].innerHTML = arg.description
if (arg.image) {
    task.node.getElementsByClassName("container")[0].children[0].setAttribute("src", arg.image)
} else {
    task.node.getElementsByClassName("container")[0].children[0].style.display = "none"
    task.node.getElementsByClassName("message")[0].style.margin = "0px" 
}
if (arg.taskid) {
    let i = 0
    mem.var.details.innerHTML  = ""
    let newButton = document.createElement("button")
    newButton.setAttribute("class", "error")
    newButton.innerHTML = "console.error()"

    mem.var.details.appendChild(document.createElement("p"))
    mem.var.details.children[i].classList.add("errorDetails")
    mem.var.details.children[i].innerHTML += "<b>message: </b>" + mem.error.message + "<br>"
    if (mem.error.taskId){
        mem.var.details.children[i].innerHTML+="<b>taskId: </b>" + mem.error.taskId + "<br>"
    }
    mem.var.details.children[i].innerHTML += "<b>fileName: </b>" + mem.error.fileName + "<br>"
    if (mem.error.source) {
        mem.var.details.children[i].innerHTML+="<b>source: </b>" + mem.error.source + "<br>"
    }
    mem.var.details.children[i].innerHTML += "<b>columnNumber: </b>" + mem.error.columnNumber + "<br>"
    mem.var.details.children[i].innerHTML += "<b>lineNumber: </b>" + mem.error.lineNumber
    if (mem.error.stack) {
        i++
        mem.var.details.appendChild(document.createElement("p"))
        mem.var.details.children[i].classList.add("errorStack")
        mem.var.details.children[i].innerHTML += "<b>stack: </b><br>" + mem.error.stack + "<br>"
        mem.var.details.children[i].innerHTML += "<button class='error'>console.error()</button>"
    }
    if (mem.error.script){
        i++
        mem.var.details.appendChild(document.createElement("p"))
        mem.var.details.children[i].classList.add("errorCode")
        mem.var.details.children[i].innerHTML+="<b>script: </b>"
        mem.var.details.innerHTML+="<div class='codeParser'></div>"
        mem.drawCode()
    }
}
task.node.getElementsByClassName("expand")[0].onclick = e => {
    if (mem.var.details.style.display === "none") {
        mem.var.details.style.display = "block"
        task.node.getElementsByClassName("popup")[0].style.height = "fit-content"
        task.node.getElementsByClassName("expand")[0].classList.remove("closed")
        task.node.getElementsByClassName("expand")[0].classList.add("open")

    } else {
        mem.var.details.style.display = "none"
        task.node.getElementsByClassName("popup")[0].style.height = "fit-content"
        task.node.getElementsByClassName("expand")[0].classList.remove("open")
        task.node.getElementsByClassName("expand")[0].classList.add("closed")

    }
}
if (mem.error.stack) task.node.getElementsByClassName("error")[0].onclick = e => {
    console.error(mem.error)
    task.node.getElementsByClassName("error")[0].onclick = null
}