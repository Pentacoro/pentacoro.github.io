let arg = []
//[0] name
//[1] addr
let tid = ''
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
    let task = new Task("Iframer", true, end, null, "plx", tid)
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

            data = repDir(data,url)
            data = repTid(data,id)
            data = data.replace(/arg\[0\]/,stringifyArg(arg[0]))
            data = data.replace(/arg\[1\]/,stringifyArg(arg[1]))

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