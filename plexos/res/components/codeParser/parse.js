import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let comp = task.getComponent(/COMPID/)
let mem  = task.mem
    
//find and color-code the problematic line
let code = comp.args.code
code = code
let script = code.split('\n')
let parsed = "\n"
let digits = String(script.length).length
for (let y = 0; y < script.length; y++) {
    script[y] = script[y].replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    parsed += `<span class='codeLine'><span class='lineNum'> ${y+1}${" ".repeat(digits-String(y+1).length)} </span><span class='ID_${comp.id} javascript lineTxt'>${script[y]}\n</span></span>`
}

task.node.getElementsByClassName("parsed-code")[0].innerHTML = "<code class='codeBox'>" + parsed + "</code>"
new mem.codeParser.RegexHighlighter().loadSyntaxHighlightingByClass(`ID_${comp.id}`, "./languages/")