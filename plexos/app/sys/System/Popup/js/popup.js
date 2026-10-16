import {getTask, displayComponent, ajaxReturn} from "/plexos/lib/functions/dll.js"
import {control} from "/plexos/lib/functions/controls.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let arg  = mem.arg

const popup   = control("panel", { className: "popup" })
const message = control("messageBox", {
    image: arg.image,
    title: arg.title,
    description: arg.description,
    inset: true,
})
const details = control("disclosure", { label: "More details" })
popup.node.append(message.node, details.node)
task.node.getElementById(task.id + "_root").appendChild(popup.node)

mem.ui = { message, details }
mem.var.details = details.keyNodes.panel
// The caller sizes the expanded details to what it shows. Without it the theme's height applies.
if (arg.detailsHeight) mem.var.details.style.height = arg.detailsHeight
mem.error   = getTask(arg.taskid).mem.var.error

mem.drawCode = async function () {
    let codeParser = mem.var.details.getElementsByClassName("codeParser")[0]
    let code = mem.error.script
    if (mem.error.fileName) {
        try {
            let sourcedScript = await ajaxReturn("GET", mem.error.fileName)
            if (sourcedScript !== mem.error.script) code = sourcedScript
        } catch (e) {}
    }
    await task.newComponent({
        url:"/plexos/res/components/codeParser/code.html",
        task:this,
        container:codeParser,
        args:{code},
    })
    let scrollBar = document.createElement("div")
    scrollBar.setAttribute("id", "scrollBar-codeParser")
    scrollBar.setAttribute("class", "scrollBar-container")
    codeParser.appendChild(scrollBar)
    await task.newComponent({
        url:"/plexos/res/components/interactives/scrollBar/scrollBar.html",
        task:this,
        container:scrollBar,
        args:{subject:codeParser.children[0],position:"bottom",sticky:mem.var.details}
    })
    if (mem.error.lineNumber) task.node.getElementsByClassName("codeBox")[0].children[mem.error.lineNumber-1].classList.add("error")
    details.keyNodes.button.addEventListener("click", task.components[1].mem.updateScrollBar)
    details.keyNodes.button.addEventListener("click", task.components[1].mem.updateStickyBar)
}
if (!arg.image) {
    message.keyNodes.image.style.display = "none"
    message.keyNodes.message.style.margin = "0px"
}
// [label, value] pairs from the caller, shown instead of an evaluation error.
if (arg.details) {
    const p = document.createElement("p")
    p.classList.add("errorDetails")
    for (const [label, value] of arg.details) {
        const b = document.createElement("b")
        b.textContent = label + ": "
        p.append(b, String(value), document.createElement("br"))
    }
    p.lastChild?.remove()
    mem.var.details.replaceChildren(p)
} else if (arg.taskid) {
    let i = 0
    mem.var.details.innerHTML  = ""

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
if (!arg.details && mem.error?.stack) mem.var.details.getElementsByClassName("error")[0].onclick = e => {
    console.error(mem.error)
    mem.var.details.getElementsByClassName("error")[0].onclick = null
}
