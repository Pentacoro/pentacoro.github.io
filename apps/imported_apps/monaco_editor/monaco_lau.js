let params = {}
//[1] file address
let taskid = ''
let url = "/apps/imported_apps/monaco_editor/monaco.html"
let lau = "/apps/imported_apps/monaco_editor/monaco_lau.js"

//on app init
function ini() {

}
//on app end
function end() {

}

//task creation
let task = new Task(
    {
        name : "Monaco",
        inst : true,
        appEnd : end,
        node : null,
        from : "",
        id   : taskid
    }
)
if (!task.id) return

try {
    let id = task.id

    //window generation
    new Window(
        {
            name : File.at(params.addr).name+" - Monaco",
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

    ini()

    let replacementPairs = [
        {regex:/ARG_TEXTDATA/g,text:JSON.stringify(File.at(params.addr).data)},
        {regex:/ARG_FILEADDR/g,text:params.addr},
    ]

    dll.displayComponent({
        url:url,
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