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
    sys.taskArr.push(new Task("Iframer", true, end, null, "plx", tid))
    let task = sys.taskArr[sys.taskArr.length - 1]
    let id = task.id

    //get the .html
    let appHTML = ajaxReturn("get", url)
    appHTML.then( data => {
        try {
            //window generation
            sys.wndwArr.push(new Window(arg[0], id, true, 1, 1, 850, 650, 192, 160))
            newWindow = sys.wndwArr[sys.wndwArr.length - 1]
            newWindow.createNode()

            task.wndw = newWindow
            task.node = newWindow.cont

            //X button
            document.getElementsByClassName("ID_"+id)[0].children[0].children[0].getElementsByClassName("X")[0].addEventListener("mouseup", task.end)

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