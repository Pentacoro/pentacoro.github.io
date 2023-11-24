let params = {}
//[0] name
//[1] addr
let taskid = ''
let url = "./apps/media/iframer/iframer.html"
let lau = "./apps/media/iframer/iframer_lau.js"

//on app init
function ini() {

}
//on app end
function end() {

}
//check if instance allowed
if (canInstance("Iframer")) {
    //task creation
    let task = new Task(
        {
            name : "Iframer",
            inst : true,
            appEnd : end,
            node : null,
            from : "Plexus",
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
            let newWindow = new Window
            (
                {
                    name : params.name,
                    task : id, 
                    resi : true, 
                    uiux : 1, 
                    stat : 1, 
                    widt : 850, 
                    heig : 650, 
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
                {regex:/arg\[0\]/,text:JSON.stringify(params.name)},
                {regex:/arg\[1\]/,text:JSON.stringify(params.addr)},
            ]

            loadURL({
                url:url,
                taskid:id,
                data:data,
                replacementPairs:replacementPairs,
                container:document.getElementById("window_" + sys.wndwArr.indexOf(newWindow)).children[0].children[1]
            })
        } catch (e) {
            evalErrorPopup
            (
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
                "Couldn't load application at: <i>'" + url + "'</i>",
                desktop.id,
                ""
            ]
        )
        system.mem.task(id).end()
    })
} else {
    console.log("instanced")
}