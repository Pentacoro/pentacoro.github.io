let arg = []
//[0] window name
//[1] popup type (true = details | false = buttons)
//[2] popup title
//[3] popup description
//[4] popup taskid
//[5] popup icon
let tid = ''
let url = (arg[1]) ? "./apps/system_popup/popup.html" : "./apps/system_popup/popupB.html"
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
            from : "sys",
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
            let newWindow = new Window
            (
                {
                    name : arg[0],
                    task : id, 
                    rezi : false, 
                    uiux : 1, 
                    stat : 1, 
                    widt : 400, 
                    heig : 170, 
                    minW : 400,
                    minH : 170
                }
            )
            sys.wndwArr.push(newWindow)
            task.wndw = newWindow
            newWindow.createNode()
            task.node = newWindow.cont
                

            ini()

            let replacementPairs = [
                {regex:/arg\[0\]/,text:stringifyArg(arg[0])},
                {regex:/arg\[1\]/,text:stringifyArg(arg[1])},
                {regex:/arg\[2\]/,text:stringifyArg(arg[2])},
                {regex:/arg\[3\]/,text:stringifyArg(arg[3])},
                {regex:/arg\[4\]/,text:stringifyArg(arg[4])},
                {regex:/arg\[5\]/,text:stringifyArg(arg[5])},
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