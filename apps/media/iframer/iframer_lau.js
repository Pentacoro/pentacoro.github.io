let params = {}
//[0] name
//[1] addr
let taskid = ''
let url = "/apps/media/iframer/iframer.html"
let lau = "/apps/media/iframer/iframer_lau.js"

//on app init
function ini() {

}
//on app end
function end() {

}

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
if (!task.id) return

try {
    let id = task.id

    //window generation
    new Window
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

    ini()

    let replacementPairs = [
        {regex:/arg\[0\]/,text:JSON.stringify(params.name)},
        {regex:/arg\[1\]/,text:JSON.stringify(params.addr)},
    ]

    dll.displayComponent({
        url:url,
        taskid:id,
        replacementPairs:replacementPairs,
        container:task.node
    })
} catch (e) {
    dll.evalErrorPopup
    (
        document.getElementById("appLauncher").getElementsByTagName("script")[0].innerText,
        "The application launcher at: <i>'" + lau + "'</i> failed evaluation.",
        e
    )
    task.end()
}
