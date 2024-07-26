let params = /PARAMS/
let taskid = /TASKID/
let addr = /ADDR/
let root = /ROOT/
let html = root + "/deskGridOptions.html"

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
            uiux : [], 
            icon : "/plexos/res/images/svg/desktopIcons/settingsPlaceholder.svg",
            stat : 1, 
            widt : 350, 
            heig : 490, 
        }
    )

    ini()

    dll.displayComponent({
        url:html,
        taskid:id,
        container:task.node,
    })
} catch (e) {
    dll.evalErrorPopup
    (
        document.getElementById("appLauncher").getElementsByTagName("script")[0].innerText,
        "The application launcher at: <i>'" + addr + "'</i> failed evaluation.",
        e
    )
    task.end()
}