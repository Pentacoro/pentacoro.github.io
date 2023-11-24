let params = {}
//[1] file address
let taskid = ''
let url = "./apps/imported_apps/monaco_editor/monaco.html"
let lau = "./apps/imported_apps/monaco_editor/monaco_lau.js"

//on app init
function ini() {

}
//on app end
function end() {

}

//check if instance allowed
if (canInstance("Monaco")) {
    //task creation
    let task = new Task(
        {
            name : "Monaco",
            inst : true,
            appEnd : end,
            node : null,
            from : "",
            id   : taskid
        }
    )
    sys.taskArr.push(task)
    let id = task.id
    //get the .html
    let appHTML = ajaxReturn("get", url)
    appHTML.then( data => {
        try {
            //window generation
            let newWindow = new Window(
                {
                    name : at(params.addr).name+" - Monaco",
                    task : id, 
                    resi : true, 
                    uiux : 3, 
                    stat : 1, 
                    widt : 700, 
                    heig : 460, 
                    minW : 192,
                    minH : 160
                }
            )
            sys.wndwArr.push(newWindow)
            newWindow.createNode()
            
            task.wndw = newWindow 
            task.node = newWindow.cont

            ini()

            let replacementPairs = [
                {regex:/ARG_TEXTDATA/g,text:JSON.stringify(at(params.addr).data)},
                {regex:/ARG_FILEADDR/g,text:params.addr},
            ]

            loadURL({
                url:url,
                taskid:id,
                data:data,
                replacementPairs:replacementPairs,
                container:document.getElementById("window_" + sys.wndwArr.indexOf(newWindow)).children[0].children[1]
            })
        } catch (e) {
            evalErrorPopup(
                document.getElementById("appLauncher").getElementsByTagName("script")[0].innerText,
                "The application launcher at: <i>'" + lau + "'</i> failed evaluation.",
                e
            )
            task.end()
        }
    })

    appHTML.catch( e => {
        desktop.mem.var.error = e
        desktop.mem.var.errorB = [["Okay"]]
        loadAPP("./apps/system_popup/popup_lau.js",
            {
                name: e.status,
                type: false,
                title: "Application: " + e.statusText, 
                description:"Couldn't load application at: <i>'" + e.statusUrl + "'</i>",
                taskid:desktop.id,
                icon:""
            }
        )
        system.mem.task(id).end()
    })
} else {
    console.log("instanced")
}