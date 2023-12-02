let params = {}
//[0] window name
//[1] type (true = details | false = buttons)
//[2] title
//[3] description
//[4] taskid
//[5] icon
let taskid = ''
let url = (params.type) ? "./apps/system_popup/popup.html" : "./apps/system_popup/popupB.html"
let lau = "./apps/system_popup/popup_lau.html"

//on app init
function ini() {

}
//on app end
function end() {

}
//check if instance allowed
if (canInstance("Popup")) {
    //task creation
    let task = new Task(
        {
            name : "Popup",
            inst : true,
            appEnd : end,
            node : null,
            from : "System",
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
                    rezi : false, 
                    uiux : 1, 
                    stat : 1, 
                    widt : 400, 
                    heig : 150, 
                    minW : 400,
                    minH : 150
                }
            )
            sys.wndwArr.push(newWindow)
            newWindow.createNode()
            task.wndw = newWindow
            task.node = newWindow.cont
                
            ini()

            let replacementPairs = [
                {regex:/arg\[0\]/,text:JSON.stringify(params.name)},
                {regex:/arg\[1\]/,text:JSON.stringify(params.type)},
                {regex:/arg\[2\]/,text:JSON.stringify(params.title)},
                {regex:/arg\[3\]/,text:JSON.stringify(params.description)},
                {regex:/arg\[4\]/,text:JSON.stringify(params.taskid)},
                {regex:/arg\[5\]/,text:JSON.stringify(params.icon)},
            ]

            loadURL({
                url:url,
                taskid:id,
                data:data,
                replacementPairs:replacementPairs,
                container:document.getElementById("window_" + sys.wndwArr.indexOf(newWindow)).children[0].children[1]
            })
        } catch (e) {
            console.error(e)
            /*
            evalErrorPopup
            (
                document.getElementById("appLauncher").getElementsByTagName("script")[0].innerText,
                "The application launcher at: <i>'" + lau + "'</i> failed evaluation.",
                e
            )
            task.end()
            */
        }

    })
    appHTML.catch( e => {
        console.error(e)
        /*
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
        */
    })
} else {
    console.log("instanced")
}