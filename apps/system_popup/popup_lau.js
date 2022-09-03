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
if (canInstance("Pupup")) {
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
            newWindow.createNode()

            task.wndw = newWindow
            task.node = newWindow.cont

            ini()

            data = repDir(data,url)
            data = repTid(data,id)
            data = data.replace(/arg\[0\]/,stringifyArg(arg[0]))
            data = data.replace(/arg\[1\]/,stringifyArg(arg[1]))
            data = data.replace(/arg\[2\]/,stringifyArg(arg[2]))
            data = data.replace(/arg\[3\]/,stringifyArg(arg[3]))
            data = data.replace(/arg\[4\]/,stringifyArg(arg[4]))
            data = data.replace(/arg\[5\]/,stringifyArg(arg[5]))

            loadURL(data, document.getElementById("window_" + sys.wndwArr.indexOf(newWindow)).children[0].children[1])
        } catch (e) {
            evalErrorPopup
            (
                document.getElementById("appLauncher").getElementsByTagName("script")[0].innerText,
                "The application launcher at: <i>'" + lau + "'</i> failed evaluation.",
                e
            )
            task(id).end()
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
        task(id).end()
    })
} else {
    console.log("instanced")
}