let params = /PARAMS/
let taskid = /TASKID/
let addr = /ADDR/
let root = /ROOT/
let html = root + "/desktop.html"

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

    dll.displayComponent({
        url:html,
        taskid:id,
        replacementPairs:replacementPairs,
        container:task.node
    })
} catch (e) {
    dll.evalErrorPopup(
        document.getElementById("appLauncher").getElementsByTagName("script")[0].innerText,
        "The application launcher at: <i>'" + lau + "'</i> failed evaluation.",
        e
    )
    task.end()
}