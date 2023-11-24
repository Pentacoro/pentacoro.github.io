let task = system.mem.task("TASKID")
let mem  = task.mem
task.apps = "plx"
mem.fileAddress = "ARG_FILEADDR"
mem.var = {}
mem.var.continuousContext = false
mem.var.contextOptions = function (button) {
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
                    {section:"file", name:"Save",icon:"url('')",func: () => at(mem.fileAddress).data = document.getElementById("ID_TASKID.textarea").value },
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
                    {section:"clip", name:"Cut",icon:"url('')",func: () => {return}},
                    {section:"clip", name:"Copy",icon:"url('')",func: () => {return} },
                    {section:"clip", name:"Paste",icon:"url('')",func: () => {return} },
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

for (const button of task.node.getElementsByClassName("toolbar")[0].children) {
    function buttonMenu() {
        let bound = button.getBoundingClientRect()
        let param = {
            clientY:bound.bottom,
            clientX:bound.left,
            contextVar:mem.var
        }
        let menuSections = mem.var.contextOptions(button).menuSections
        let menuOptions  = mem.var.contextOptions(button).menuOptions
        openMenu(param,button,menuSections,menuOptions)
    }
    button.onclick = e => {
        buttonMenu()
    }
    button.onmouseover = e => {
        if (mem.var.continuousContext) buttonMenu()
    }
}