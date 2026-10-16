import plexos from "/boot/plexos.js"
import {getTask, displayComponent, runLauncher} from "/plexos/lib/functions/dll.js"
import Window from "/plexos/lib/classes/interface/window.js"
import File from "/plexos/lib/classes/filesystem/file.js"

let task = getTask(/TASKID/)
let mem  = task.mem

// Open and Save dialogs have no menubar or status bar
if (mem.ui.menubarMount) {
    const selectedOne = () => task.pocket.length === 1 ? task.pocket[0] : null
    const selectionOrFolder = () => selectedOne()?.file || mem.address

    mem.menubar = {}
    mem.menubar.altHides = true // Alt shows and hides Explorer's menubar (keyboard.js in the menubar component)
    mem.menubar.onToggle = hidden => mem.writeViewParameters({ menubar: !hidden })
    mem.menubar.menubarButtons = ["File", "Edit", "View", "Help"]
    mem.menubar.contextOptions = function (button, name) {
        switch (name) {
            case "File":
                return {
                    menu: [
                        {name: "window", list: [
                            {name:"New Window",icon:"url('/THEME/icons/interface/contextMenu/newwindow.svg')",func: () => runLauncher("/plexos/app/sys/Explorer/explorer.ls", { name: "Explorer", path: mem.address })},
                        ]},
                        {name: "new", list: [
                            {name:"New Folder",icon:"url('/THEME/icons/interface/contextMenu/directory.svg')",func: () => mem.new(null, task, "DirectoryFile", "New Folder")},
                            {name:"New Text Document",icon:"url('/THEME/icons/interface/contextMenu/textfile.svg')",func: () => mem.new(null, task, "StringFile", "New Text Document.txt")},
                        ]},
                        {name: "exit", list: [
                            {name:"Close",icon:"url('')",func: () => Window.close(task.window)},
                        ]},
                    ]
                }
            case "Edit":
                return {
                    menu: [
                        {name: "history", list: [
                            {name:"Undo",icon:"url('')",shortcut:"Ctrl+Z",func: () => plexos.Core.changeLog.undo()},
                            {name:"Redo",icon:"url('')",shortcut:"Ctrl+Y",func: () => plexos.Core.changeLog.redo()},
                        ]},
                        {name: "select", list: [
                            {name:"Select All",icon:"url('')",func: () => mem.selectAll()},
                            {name:"Invert Selection",icon:"url('')",func: () => mem.invertSelection()},
                        ]},
                        {name: "items", list: [
                            {name:"Delete",icon:"url('/THEME/icons/interface/contextMenu/delete.svg')",func: () => mem.deleteSelectedNodes(),bool: task.pocket.length > 0},
                            {name:"Rename",icon:"url('/THEME/icons/interface/contextMenu/rename.svg')",func: () => selectedOne()?.editName({}),bool: !!selectedOne()},
                            {name:"Properties",icon:"url('/THEME/icons/interface/contextMenu/properties.svg')",func: () => runLauncher("/plexos/app/sys/File Properties/prop.ls", File.at(selectionOrFolder()))},
                        ]},
                    ]
                }
            case "View":
                return {
                    menu: [
                        {name: "views", list: [
                            {name:"Icons",icon:"url('')",shortcut:"Ctrl+Shift+2",func: () => mem.setView("icons")},
                            {name:"List",icon:"url('')",shortcut:"Ctrl+Shift+5",func: () => mem.setView("list")},
                            {name:"Details",icon:"url('')",shortcut:"Ctrl+Shift+6",func: () => mem.setView("details")},
                            {name:"Tiles",icon:"url('')",shortcut:"Ctrl+Shift+7",func: () => mem.setView("tiles")},
                        ]},
                        {name: "panes", list: [
                            {name: mem.ui.body.classList.contains("noSidePanel") ? "Show Sidebar" : "Hide Sidebar",icon:"url('')",func: () => mem.toggleSidePanel()},
                        ]},
                        {name: "refresh", list: [
                            {name:"Refresh",icon:"url('/THEME/icons/interface/contextMenu/refresh.svg')",func: () => mem.refresh()},
                        ]},
                    ]
                }
            case "Help":
                return {
                    menu: [
                        {name: "info", list: [
                            {name:"About Explorer",icon:"url('/THEME/icons/interface/contextMenu/about.svg')",func: () => {return}},
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
        container:mem.ui.menubarMount
    })
    await displayComponent({
        url:"/plexos/res/components/menubar/statusbar.html",
        taskid:task.id,
        container:mem.ui.statusbarMount
    })
    if (mem.readViewParameters().menubar === false) mem.ui.menubarMount.classList.add("menubarHidden")
    mem.updateStatus()
}
