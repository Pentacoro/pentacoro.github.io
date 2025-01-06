import { getTask, runLauncher } from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"

let task  = getTask(/TASKID/)
let mem   = task.mem

//open desk menu on right click background
mem.deskContextMenu = [
    {name: "view", list: [
        {name:"Grid",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/grid2.svg')",func:[
            {name:"grid", list: [
                {name:"Auto Length",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/autogrid.svg')",func:() => task.mem.grid.autoLength()},
                {name:"Auto Margin",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/automargin.svg')",func:() => task.mem.grid.autoMargin()},
                {name:"Grid Settings...",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/gridsettings.svg')",func:() => runLauncher("/plexos/app/sys/Settings/Grid/deskGridOptions.lau.js",[],task)},
                ]
            }
        ]},
        {name:"Refresh",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/refresh.svg')",func: () => task.mem.refresh()},
    ]},
    {name: "file", list: [
        {name:"New",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/new2.svg')",func:[
            {name:"new", list: [
                {name:"Directory",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/directory.svg')",func:() => task.mem.new("Directory","New Folder")},
                {name:"Metafile",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/metafile.svg')",func:() => task.mem.new("Metafile", "New Metafile.meta")},
                {name:"Text Document",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/textfile.svg')",func:() => task.mem.new("String", "New Text Document.txt")},
                ]
            }
        ]},
    {name:"Paste",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/paste.svg')",func: (e) => task.onpaste(e) },
    ]},
    {name: "info", list: [
        {name:"Settings",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/settings2.svg')",func: () => {return} },
        {name:"About",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/about.svg')",func: () => {return} }
    ]}
]

mem.iconContextMenu = function(e,icon){
    switch (icon.exte) {
        case "web":
            return [
                {name: "open", list: [
                    {name:"Open",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/open.svg')",func: () => File.at(icon.file).open()},
                    {name:"New tab",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/newtab.svg')",func: () => window.open(File.at(icon.file).meta.url, '_blank')},
                ]},
                {name: "null", list: null},
                {name: "clip", list: [
                    {name:"Cut",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/cut.svg')",func: () => {return} },
                    {name:"Copy",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/copy.svg')",func: () => {return} },
                    {name:"Paste",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/paste.svg')",func: () => {return} },
                ]},
                {name: "prop", list: [
                    {name:"Delete",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/delete.svg')",func: () => mem.deleteSelectedNodes()},
                    {name:"Rename",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/rename.svg')",func: () => icon.rename(e),bool:File.at(icon.file)!=undefined},
                    {name:"Properties...",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/properties.svg')",func: () => {runLauncher("/plexos/app/sys/File Properties/prop.lau.js",File.at(icon.file))} }
                ]},
            ]
        break
        default:
            return [
                {name: "open", list: [
                    {name:"Open",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/open.svg')",func: () => File.at(icon.file).open()},
                ]},
                {name: "null", list: null},
                {name: "clip", list: [
                    {name:"Cut",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/cut.svg')",func: () => {return} },
                    {name:"Copy",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/copy.svg')",func: () => {return} },
                    {name:"Paste",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/paste.svg')",func: () => {return} },
                ]},
                {name: "prop", list: [
                    {name:"Delete",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/delete.svg')",func: () => mem.deleteSelectedNodes()},
                    {name:"Rename",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/rename.svg')",func: () => icon.rename(e),bool:File.at(icon.file)!=undefined},
                    {name:"Properties...",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/properties.svg')",func: () => {runLauncher("/plexos/app/sys/File Properties/prop.lau.js",File.at(icon.file))} }
                ]},
            ]
    }
}