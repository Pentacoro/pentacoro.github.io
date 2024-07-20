let params = {} //name, addr, type, file
let taskid = ''
let url = (params.type) ? "/apps/filesystem_explorer/explorer"+params.type+".html" : "/apps/filesystem_explorer/explorer.html"
let lau = "/apps/filesystem_explorer/explorer_lau.html"

//on app init
function ini() {

}
//on app end
function end() {

}

//task creation
let task = new Task(
    {
        name : "Explorer",
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
            name : params.name,
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

    let replacementPairs = [{regex:/xcorex/g,text:params.addr}]

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