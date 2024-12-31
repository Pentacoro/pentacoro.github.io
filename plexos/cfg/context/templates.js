[
    {class: "Default", menu: [
        {name: "null", list: null},
        {name: "info", list: [
            {name:"Settings",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/settings2.svg')",func: () => {return} },
            {name:"About",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/about.svg')",func: () => {return} }
        ]},
    ]},
    {class: "Task", menu: [
        {name: "null", list: null},
        {name: "info", list: [
            {name:"Settings",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/settings2.svg')",func: () => {return} },
            {name:"About",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/about.svg')",func: () => {return} }
        ]},
    ]},
    {class: "IconDir", menu: [
        {name: "open", list: [
            {name:"Open",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/open.svg')",func: () => ContextMenu.target.open()},
            {name:"New window",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/maximize.svg')",func: () => File.at(ContextMenu.target.file).open(),bool:File.at(ContextMenu.target.file)!=undefined},
        ]},
        {name: "null", list: null},
        {name: "clip", list: [
            {name:"Cut",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/cut.svg')",func: () => {return} },
            {name:"Copy",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/copy.svg')",func: () => {return} },
            {name:"Paste",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/paste.svg')",func: () => {return} },
        ]},
        {name: "prop", list: [
            {name:"Delete",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/delete.svg')",func: () => Task.deleteSelectedNodes(plexos.System.mem.focused.pocket)},
            {name:"Rename",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/rename.svg')",func: () => ContextMenu.target.rename(e),bool:File.at(ContextMenu.target.file)!=undefined},
            {name:"Properties",icon:"url('plexos/res/themes/Plexos Hyper/icons/interface/contextMenu/properties.svg')",func: () => {return} }
        ]},
    ]},
]