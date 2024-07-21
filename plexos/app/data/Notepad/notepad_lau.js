let params = /PARAMS/
let taskid = /TASKID/
let addr = /ADDR/
let root = /ROOT/
let html = root + "/notepad.html"

//on app init
function ini() {

}
//on app end
function end() {

}

//task creation
let task = new Task(
    {
        name : "Notepad",
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
    new Window(
        {
            name : File.at(params.addr).name+" - Notepad",
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
        {regex:/ARG_TEXTDATA/g,text:File.at(params.addr).data},
        {regex:/ARG_FILEADDR/g,text:params.addr},
    ]

    dll.displayComponent({
        url:html,
        taskid:id,
        replacementPairs:replacementPairs,
        container:task.node
    })
} catch (e) {
    dll.evalErrorPopup(
        document.getElementById("appLauncher").getElementsByTagName("script")[0].innerText,
        "The application launcher at: <i>'" + addr + "'</i> failed evaluation.",
        e
    )
    task.end()
}