import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let comp = task.getComponent(/COMPID/)
let mem  = task.mem

const language = comp.args?.language || "javascript"
const host = (comp.container || task.node).getElementsByClassName("parsed-code")[0]
let syntaxCache = null

function escapeLine(line) {
    return String(line).replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

function buildHTML(code) {
    const script = String(code ?? "").split("\n")
    const digits = String(script.length).length
    let parsed = "\n"
    for (let y = 0; y < script.length; y++) {
        parsed += `<span class='codeLine'><span class='lineNum'> ${y+1}${" ".repeat(digits-String(y+1).length)} </span><span class='ID_${comp.id} ${language} lineTxt'>${escapeLine(script[y])}\n</span></span>`
    }
    return "<code class='codeBox'>" + parsed + "</code>"
}

function applySyntax(syntax) {
    const highlighter = new mem.codeParser.RegexHighlighter()
    const els = host.getElementsByClassName(`ID_${comp.id}`)
    for (let i = 0; i < els.length; i++) {
        const result = highlighter.insertSyntaxHighlighting(syntax, els[i].innerHTML)
        if (result) els[i].innerHTML = result
    }
}

comp.mem.setCode = function(code) {
    if (!host) return
    host.innerHTML = buildHTML(code)
    if (syntaxCache) {
        applySyntax(syntaxCache)
        return
    }
    const highlighter = new mem.codeParser.RegexHighlighter()
    highlighter.ajaxGET("./languages/" + language + ".json", function (response) {
        syntaxCache = JSON.parse(response)
        applySyntax(syntaxCache)
    }.bind(highlighter))
}

comp.mem.setCode(comp.args?.code ?? "")
