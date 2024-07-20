let params = {}
let taskid = ''
let lau = "/apps/settings_deskGrid/deskGridOptions_lau.js"
let url = "/apps/settings_deskGrid/deskGridOptions.html"

//on app init
function ini() {
    cfg.desktop.grid.visibleNodes = true
    Task.openInstance("Desktop").mem.grid.evaluateIconGrid(null, 2)
}
//on app end
function end() {
    cfg.desktop.grid.visibleNodes = false
    Task.openInstance("Desktop").mem.grid.evaluateIconGrid(null, 2)
}

//task creation
let task = new Task(
    {
        name : "Settings",
        inst : false,
        appEnd : end,
        node : null,
        from : "plx", 
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
            name : "Desktop Grid Settings",
            task : id, 
            resi : false, 
            uiux : 2, 
            stat : 1, 
            widt : 350, 
            heig : 490, 
        }
    )

    ini()

    dll.displayComponent({
        url:url,
        taskid:id,
        container:task.node,
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