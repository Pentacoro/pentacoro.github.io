import { getTask, runLauncher } from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"

let task  = getTask(/TASKID/)
let mem   = task.mem

//open desk menu on right click background
mem.backContextMenu = [
    {name: "icon", list: [
        {name:"View",icon:"url('/THEME/icons/interface/contextMenu/grid2.svg')",func: () => mem.refresh()},
        {name:"Refresh",icon:"url('/THEME/icons/interface/contextMenu/refresh.svg')",func: () => mem.refresh()},
    ]},
    {name: "file", list: [
        {name:"New",icon:"url('/THEME/icons/interface/contextMenu/new2.svg')",func: [
            {name: "new", list: [
                {name:"Directory",icon:"url('/THEME/icons/interface/contextMenu/directory.svg')",func:async () => await task.mem.new(null,task,"DirectoryFile","New Folder")},
                {name:"MetaFile",icon:"url('/THEME/icons/interface/contextMenu/metafile.svg')",func:async () => await task.mem.new(null,task,"MetaFile","New MetaFile.meta")},
                {name:"Text Document",icon:"url('/THEME/icons/interface/contextMenu/textfile.svg')",func:async () => await task.mem.new(null,task,"StringFile","New Text Document.txt")},
            ]}
        ]},
        {name:"Paste",icon:"url('/THEME/icons/interface/contextMenu/paste.svg')",func: () => {return} },
    ]},
    {name: "info", list: [
        {name:"About",icon:"url('/THEME/icons/interface/contextMenu/about.svg')",func: () => {return} },
        {name:"Properties",icon:"url('/THEME/icons/interface/contextMenu/properties.svg')",func: () => {return} }
    ]}
]

mem.iconContextMenu = function(e,icon){
    switch (icon.exte) {
        case "dir":
            return [
                {name: "open", list: [
                    {name:"Open",icon:"url('/THEME/icons/interface/contextMenu/open.svg')",func: () => icon.open()},
                    {name:"New window",icon:"url('/THEME/icons/interface/contextMenu/newwindow.svg')",func: () => File.open(icon.file),bool:File.at(icon.file)!=undefined},
                ]},
                {name: "null", list: null},
                {name: "clip", list: [
                    {name:"Cut",icon:"url('/THEME/icons/interface/contextMenu/cut.svg')",func: () => {return} },
                    {name:"Copy",icon:"url('/THEME/icons/interface/contextMenu/copy.svg')",func: () => {return} },
                    {name:"Paste",icon:"url('/THEME/icons/interface/contextMenu/paste.svg')",func: () => {return} },
                ]},
                {name: "prop", list: [
                    {name:"Delete",icon:"url('/THEME/icons/interface/contextMenu/delete.svg')",func: () => mem.deleteSelectedNodes()},
                    {name:"Rename",icon:"url('/THEME/icons/interface/contextMenu/rename.svg')",func: () => icon.editName(e),bool:File.at(icon.file)!=undefined},
                    {name:"Properties",icon:"url('/THEME/icons/interface/contextMenu/properties.svg')",func: () => {runLauncher("/plexos/app/sys/File Properties/prop.ls",File.at(icon.file))} }
                ]},
            ]
        break
        case "web":
            return [
                {name: "open", list: [
                    {name:"Open",icon:"url('/THEME/icons/interface/contextMenu/open.svg')",func: () => icon.open()},
                    {name:"New tab",icon:"url('/THEME/icons/interface/contextMenu/newtab.svg')",func: () => window.open(File.at(icon.file).meta.url, '_blank')},
                ]},
                {name: "null", list: null},
                {name: "clip", list: [
                    {name:"Cut",icon:"url('/THEME/icons/interface/contextMenu/cut.svg')",func: () => {return} },
                    {name:"Copy",icon:"url('/THEME/icons/interface/contextMenu/copy.svg')",func: () => {return} },
                    {name:"Paste",icon:"url('/THEME/icons/interface/contextMenu/paste.svg')",func: () => {return} },
                ]},
                {name: "prop", list: [
                    {name:"Delete",icon:"url('/THEME/icons/interface/contextMenu/delete.svg')",func: () => mem.deleteSelectedNodes()},
                    {name:"Rename",icon:"url('/THEME/icons/interface/contextMenu/rename.svg')",func: () => icon.editName(e),bool:File.at(icon.file)!=undefined},
                    {name:"Properties",icon:"url('/THEME/icons/interface/contextMenu/properties.svg')",func: () => {runLauncher("/plexos/app/sys/File Properties/prop.ls",File.at(icon.file))} }
                ]},
            ]
        break
        default:
            return [
                {name: "open", list: [
                    {name:"Open",icon:"url('/THEME/icons/interface/contextMenu/open.svg')",func: () => File.open(icon.file)},
                ]},
                {name: "null", list: null},
                {name: "clip", list: [
                    {name:"Cut",icon:"url('/THEME/icons/interface/contextMenu/cut.svg')",func: () => {return} },
                    {name:"Copy",icon:"url('/THEME/icons/interface/contextMenu/copy.svg')",func: () => {return} },
                    {name:"Paste",icon:"url('/THEME/icons/interface/contextMenu/paste.svg')",func: () => {return} },
                ]},
                {name: "prop", list: [
                    {name:"Delete",icon:"url('/THEME/icons/interface/contextMenu/delete.svg')",func: () => mem.deleteSelectedNodes()},
                    {name:"Rename",icon:"url('/THEME/icons/interface/contextMenu/rename.svg')",func: () => icon.editName(e),bool:File.at(icon.file)!=undefined},
                    {name:"Properties",icon:"url('/THEME/icons/interface/contextMenu/properties.svg')",func: () => {runLauncher("/plexos/app/sys/File Properties/prop.ls",File.at(icon.file))} }
                ]},
            ]
    }
}