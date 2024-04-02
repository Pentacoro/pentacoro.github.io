let params = {}
//[0] window name
//[1] type (true = details | false = buttons)
//[2] title
//[3] description
//[4] taskid
//[5] icon
let taskid = ''
let url = (params.type) ? "/apps/system_popup/popup.html" : "/apps/system_popup/popupB.html"
let lau = "/apps/system_popup/popup_lau.html"

//on app init
function ini() {

}
//on app end
function end() {

}

//task creation
let task = new Task(
    {
        name : "Popup",
        inst : true,
        appEnd : end,
        node : null,
        from : "System",
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
            rezi : false, 
            uiux : 1, 
            stat : 1, 
            widt : 400, 
            heig : 150, 
            minW : 400,
            minH : 150
        }
    )
        
    ini()

    let replacementPairs = [
        {regex:/arg\[0\]/,text:JSON.stringify(params.name)},
        {regex:/arg\[1\]/,text:JSON.stringify(params.type)},
        {regex:/arg\[2\]/,text:JSON.stringify(params.title)},
        {regex:/arg\[3\]/,text:JSON.stringify(params.description)},
        {regex:/arg\[4\]/,text:JSON.stringify(params.taskid)},
        {regex:/arg\[5\]/,text:JSON.stringify(params.icon)},
    ]

    jsc.displayComponent({
        url:url,
        taskid:id,
        replacementPairs:replacementPairs,
        container:task.node
    })
} catch (e) {
    console.error(e)
    console.error(system.mem.var.error)
}