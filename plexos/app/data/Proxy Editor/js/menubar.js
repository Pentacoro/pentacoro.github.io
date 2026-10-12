import {getTask, displayComponent} from "/plexos/lib/functions/dll.js"
import Window from "/plexos/lib/classes/interface/window.js"

let task = getTask(/TASKID/)
let mem  = task.mem

mem.menubar = {}
mem.menubar.menubarButtons = ["File","Edit","View","Help"]
mem.menubar.contextOptions = function (button) {
    switch (button.innerText) {
        case "File":
            return {
                menu: [
                    {name: "prop", list: [
                        {name:"Save",icon:"url('')",shortcut:"Ctrl+S",func: () => mem.save?.()},
                        {name:"Reload",icon:"url('')",func: () => mem.reload?.()},
                    ]},
                    {name: "exit", list: [
                        {name:"Exit",icon:"url('')",func: () => Window.close(task.window)},
                    ]},
                ]
            }
        case "Edit":
            return {
                menu: [
                    {name: "history", list: [
                        {name:"Undo",icon:"url('')",shortcut:"Ctrl+Z",func: () => mem.undo?.()},
                        {name:"Redo",icon:"url('')",shortcut:"Ctrl+Y",func: () => mem.redo?.()},
                    ]},
                    {name: "edit", list: [
                        {name:"Add Key",icon:"url('')",func: () => mem.addRootKey?.()},
                    ]},
                ]
            }
        case "View":
            return {
                menu: [
                    {name: "mode", list: [
                        {name:"Tree",icon:"url('')",func: () => mem.setMode?.("tree")},
                        {name:"JSON",icon:"url('')",func: () => mem.setMode?.("json")},
                    ]},
                    {name: "fold", list: [
                        {name:"Expand All",icon:"url('')",func: () => mem.setCollapsed?.(false)},
                        {name:"Collapse All",icon:"url('')",func: () => mem.setCollapsed?.(true)},
                    ]},
                ]
            }
        case "Help":
            return {
                menu: [
                    {name: "info", list: [
                        {name:"About Proxy Editor",icon:"url('')",func: () => {return}},
                    ]},
                ]
            }
        default:
            return { menu: null }
    }
}
await displayComponent({
    url:"/plexos/res/components/menubar/menubar.html",
    taskid:task.id,
    container:task.node.getElementsByClassName("component_menubar")[0]
})
await displayComponent({
    url:"/plexos/res/components/menubar/statusbar.html",
    taskid:task.id,
    container:task.node.getElementsByClassName("component_statusbar")[0]
})
