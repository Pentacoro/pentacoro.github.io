let params = {} //
let taskid = ''
let url = "/apps/filesystem_desktop/desktop.html"
let lau = "/apps/filesystem_desktop/desktop_lau.html"

//on app init
function ini() {

}
//on app end
function end() {

}

//task creation
let task = new Task(
    {
        name : "Desktop",
        inst : false,
        appEnd : end,
        node : document.getElementById("desktopLayer"),
        from : "Plexus",
        id   : taskid
    }
)
if (!task.id) return

try {
    let id = task.id

    ini()

    let replacementPairs = [{regex:/xcorex/g,text:params.addr}]

    jsc.displayComponent({
        url:url,
        taskid:id,
        replacementPairs:replacementPairs,
        container:task.node
    })
} catch (e) {
    jsc.evalErrorPopup(
        document.getElementById("appLauncher").getElementsByTagName("script")[0].innerText,
        "The application launcher at: <i>'" + lau + "'</i> failed evaluation.",
        e
    )
    task.end()
}