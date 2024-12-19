import {plexos} from "/plexos/ini/system.js"
import {getTask, runLauncher} from "/plexos/lib/functions/dll.js"
import ContextMenu from "/plexos/lib/classes/interface/contextmenu.js"

let System = plexos.System
let task = getTask(/TASKID/)
let mem  = task.mem

//history back [<]
task.node.getElementsByClassName("back")[0].onclick = e => {

}
//parent dir
task.node.getElementsByClassName("parent")[0].onclick = e => {
    if (mem.address !== "") {
        try {
            mem.explorerInit(mem.dirObject.cfg.parent, task.id)
        } catch (e1) {
            try {
                let newDir = mem.address.replace(/\/(?:.(?!\/))+$/gim, "")
                mem.explorerInit(newDir, task.id)
            } catch (e) {
                mem.var.error  = e
                mem.var.errorB = [["Okay"]]
                runLauncher("/plexos/app/sys/Popup/popup.lau.js",
                    {
                     name:"Error",
                     type:false,
                     title:"Couldn't load directory",
                     description:"This directory seems to no longer exist. It might have been deleted, moved, or a parent directory been renamed",
                     taskid:task.id,
                     icon:""
                    }
                )

                mem.explorerInit("", task.id)
            }
        }
    } else {
        mem.explorerInit(mem.address, task.id)
    }
}
//refresh
task.node.getElementsByClassName("refresh")[0].onclick = e => {
    mem.refresh()
}

//background click listeners
task.node.getElementsByClassName("list")[0].onmousedown = e => {
    if (e.target.classList.contains("list")) {
        for (let icon of task.pocket) {
            icon.statNode(0)
            task.pocket = task.pocket.remove(icon)
        }
    }
}
task.node.getElementsByClassName("list")[0].oncontextmenu = e => {
    if (e.target.classList.contains("list")) {
        let envfocus = System.mem.var.envfocus

        let menu = [
            {name: "icon", list: [
                {name:"View",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/grid.svg')",func:envfocus.mem.refresh},
                {name:"Refresh",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/refresh.svg')",func:envfocus.mem.refresh},
            ]},
            {name: "file", list: [
                {name:"New",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/new2.svg')",func: [
                    {name: "new", list: [
                        {name:"Directory",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/directory.svg')",func:() => envfocus.mem.new(e,task,"Directory","New Folder")},
                        {name:"Metafile",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/metafile.svg')",func:() => envfocus.mem.new(e,task,"Metafile","New Metafile.msf")},
                        {name:"Text Document",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/textfile.svg')",func:() => envfocus.mem.new(e,task,"JsString","New Text Document.txt")},
                    ]}
                ]},
                {name:"Paste",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/paste.svg')",func: () => {return} },
            ]},
            {name: "info", list: [
                {name:"About",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/about.svg')",func: () => {return} },
                {name:"Properties",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/properties.svg')",func: () => {return} }
            ]}
        ]
        ContextMenu.open(e, task, menu)
    }
}