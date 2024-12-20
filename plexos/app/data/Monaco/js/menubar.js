import {plexos} from "/plexos/ini/system.js"
import {getTask, displayComponent} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem

mem.menubar = {}
mem.menubar.menubarButtons = ["File","Edit","Format","View","Help"]
mem.menubar.contextOptions = function (button) {
    let envfocus = plexos.System.mem.focused
    switch (button.innerText) {
        case "File":
            return {
                menu: [
                    {name: "prop", list: [
                        {name:"New",icon:"url('')",func: () => {return}},
                        {name:"New Window",icon:"url('')",func: () => {return}},
                        {name:"Open...",icon:"url('')",func: () => {return} },
                        {name:"Save",icon:"url('')",func: () => mem.arg.file.data = mem.editor.getValue() },
                        {name:"Save As...",icon:"url('')",func: () => {return} },
                    ]},
                    {name: "exit", list: [
                        {name:"Exit",icon:"url('')",func: () => {return}},
                    ]},
                ]
            }
            break
        case "Edit":
            return {
                menu: [
                    {name: "undo", list: [
                        {name:"Undo",icon:"url('')",func: () => {return}},
                    ]},
                    {name: "clip", list: [
                        {name:"Cut",icon:"url('')",func: () => {mem.var.textarea.focus();document.execCommand("cut")}},
                        {name:"Copy",icon:"url('')",func: () => {mem.var.textarea.focus();document.execCommand("copy")} },
                        {name:"Paste",icon:"url('')",func: () => {mem.var.textarea.focus();document.execCommand("paste")} },
                    ]},
                    {name: "find", list: [
                        {name:"Find...",icon:"url('')",func: () => {return} },
                        {name:"Find Next",icon:"url('')",func: () => {return} },
                        {name:"Find Previous",icon:"url('')",func: () => {return} },
                        {name:"Replace...",icon:"url('')",func: () => {return} },
                        {name:"Go To...",icon:"url('')",func: () => {return} },
                    ]},
                    {name: "misc", list: [
                        {name:"Select All",icon:"url('')",func: () => {return} },
                        {name:"Time/Date",icon:"url('')",func: () => {return} },
                    ]},
                ]
            }
            break
        case "Format":
            return {
                menu: [
                    {name: "form", list: [
                        {name:"Word Wrap",icon:"url('')",func: () => {return}},
                        {name:"Font...",icon:"url('')",func: () => {return}},
                    ]},
                ]
            }
            break
        case "View":
            return {
                menu: [
                    {name: "view", list: [
                        {name:"Zoom",icon:"url('')",func:[
                            {name: "zoom", list: [
                                {name:"Zoom In",icon:"url('')",func: () => {return}},
                                {name:"Zoom Out",icon:"url('')",func: () => {return}},
                                {name:"Restore Default Zoom",icon:"url('')",func: () => {return}},         
                            ]},
                        ]},
                        {name:"Status Bar",icon:"url('')",func: () => {return}},
                    ]},
                ]
            }
            break
        case "Help":
            return {
                menu: [
                    {name: "help", list: [
                        {name:"View Help",icon:"url('')",func: () => {return}},
                        {name:"Send Feedback",icon:"url('')",func: () => {return}},
                    ]},
                    {name: "info", list: [
                        {name:"About Notepad",icon:"url('')",func: () => {return}},
                    ]},
                ]
            }
            break
        default: 
            return {
                menu:null
            }
    }
}
await displayComponent({
    url:"/plexos/res/components/menubar/menubar.html",
    taskid:task.id,
    container:task.node.getElementsByClassName("component_menubar")[0]
})