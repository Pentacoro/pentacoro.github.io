let task = Task.id("TASKID")
let mem  = task.mem

mem.menubar = {}
mem.menubar.continuousContext = false
mem.menubar.menubarButtons = ["File","Edit","Format","View","Help"]
mem.menubar.contextOptions = function (button) {
    let envfocus = system.mem.var.envfocus
    switch (button.innerText) {
        case "File":
            return {
                menuSections:[
                    {name:"file"},
                    {name:"exit"},
                ],
                menuOptions :[
                    {section:"file", name:"New",icon:"url('')",func: () => {return}},
                    {section:"file", name:"New Window",icon:"url('')",func: () => {return}},
                    {section:"file", name:"Open...",icon:"url('')",func: () => {return} },
                    {section:"file", name:"Save",icon:"url('')",func: () => File.at(mem.fileAddress).data = document.getElementById("ID_TASKID.textarea").value },
                    {section:"file", name:"Save As...",icon:"url('')",func: () => {return} },
                    {section:"exit", name:"Exit",icon:"url('')",func: () => {return} },
                ]
            }
            break
        case "Edit":
            return {
                menuSections:[
                    {name:"undo"},
                    {name:"clip"},
                    {name:"find"},
                    {name:"misc"},
                ],
                menuOptions :[
                    {section:"undo", name:"Undo",icon:"url('')",func: () => {return}},
                    {section:"clip", name:"Cut",icon:"url('')",func: () => {mem.var.textarea.focus();document.execCommand("cut")}},
                    {section:"clip", name:"Copy",icon:"url('')",func: () => {mem.var.textarea.focus();document.execCommand("copy")} },
                    {section:"clip", name:"Paste",icon:"url('')",func: () => {mem.var.textarea.focus();document.execCommand("paste")} },
                    {section:"clip", name:"Delete",icon:"url('')",func: () => {return} },
                    {section:"find", name:"Find...",icon:"url('')",func: () => {return} },
                    {section:"find", name:"Find Next",icon:"url('')",func: () => {return} },
                    {section:"find", name:"Find Previous",icon:"url('')",func: () => {return} },
                    {section:"find", name:"Replace...",icon:"url('')",func: () => {return} },
                    {section:"find", name:"Go To...",icon:"url('')",func: () => {return} },
                    {section:"misc", name:"Select All",icon:"url('')",func: () => {return} },
                    {section:"misc", name:"Time/Date",icon:"url('')",func: () => {return} },
                ]
            }
            break
        case "Format":
            return {
                menuSections:[
                    {name:"form"},
                ],
                menuOptions :[
                    {section:"form", name:"Word Wrap",icon:"url('')",func: () => {return}},
                    {section:"form", name:"Font...",icon:"url('')",func: () => {return}},
                ]
            }
            break
        case "View":
            return {
                menuSections:[
                    {name:"view"},
                ],
                menuOptions :[
                    {section:"view", name:"Zoom",icon:"url('')",func:[
                        {name:"Zoom In",icon:"url('')",func: () => {return}},
                        {name:"Zoom Out",icon:"url('')",func: () => {return}},
                        {name:"Restore Default Zoom",icon:"url('')",func: () => {return}},
                    ]},
                    {section:"view", name:"Status Bar",icon:"url('')",func: () => {return}},
                ]
            }
            break
        case "Help":
            return {
                menuSections:[
                    {name:"help"},
                    {name:"info"},
                ],
                menuOptions :[
                    {section:"help", name:"View Help",icon:"url('')",func: () => {return}},
                    {section:"help", name:"Send Feedback",icon:"url('')",func: () => {return}},
                    {section:"info", name:"About Notepad",icon:"url('')",func: () => {return}},
                ]
            }
            break
        default: 
            return {
                menuSections:[],
                menuOptions: [],
            }
    }
}
await jsc.displayComponent({
    url:"/apps/system/components/menubar/menubar.html",
    taskid:task.id,
    container:document.getElementsByClassName("component_menubar ID_TASKID")[0]
})