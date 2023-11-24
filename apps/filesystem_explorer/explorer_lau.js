let arg = []
//[0] directory name
//[1] address
//[2] explorer instance type
//[3] manipulated file
let tid = ''
let url = (arg[2]) ? "./apps/filesystem_explorer/explorer"+arg[2]+".html" : "./apps/filesystem_explorer/explorer.html"
let lau = "./apps/filesystem_explorer/explorer_lau.html"

//on app init
function ini() {

}
//on app end
function end() {

}

//check if instance allowed
if (canInstance("Explorer")) {
    //task creation
    let task = new Task(
        {
            name : "Explorer",
            inst : true,
            appEnd : end,
            node : null,
            from : "plx",
            id   : tid
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
                    name : arg[0],
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

            let replacementPairs = [{regex:/xcorex/g,text:arg[1]}]

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
            [
                e.status,
                false,
                "Application: " + e.statusText, 
                "Couldn't load application at: <i>'" + e.statusUrl + "'</i>",
                desktop.id,
                ""
            ]
        )
        system.mem.task(id).end()
    })
} else {
    console.log("instanced")
}