    let arg = []
    let tid = ''
    let lau = "./apps/settings_deskGrid/deskGridOptions_lau.html"
    let url = "./apps/settings_deskGrid/deskGridOptions.html"

    //on app init
    function ini() {
        cfg.desk.grid.visibleNodes = true
        evaluateIconGrid(null, 2)
    }
    //on app end
    function end() {
        cfg.desk.grid.visibleNodes = false
        evaluateIconGrid(null, 2)
    }

    //check if instance allowed
    if (canInstance("Settings")) {
        //task creation
        let task = new Task("Settings", false, end, null, "plx", tid)
        sys.taskArr.push(task)
        let id = task.id

        //get the .html
        let appHTML = ajaxReturn("get", url)
        appHTML.then( data => {
            try {
    
                //window generation
                let newWindow = new Window
                (
                    {
                        name : "Desktop Grid Settings",
                        task : id, 
                        resizable : false, 
                        bttns : 1, 
                        state : 1, 
                        w : 350, 
                        h : 560, 
                    }
                )
                sys.wndwArr.push(newWindow)
                newWindow.createNode()
                
                task.wndw = newWindow
                task.node = newWindow.cont
    
                ini()
    
                loadURL(repDir(data,url), document.getElementById("window_" + sys.wndwArr.indexOf(newWindow)).children[0].children[1], task)
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
                    "Couldn't load application at: <i>'" + e.statusUrl + "'</i>",
                    desktop.id,
                    ""
                ]
            )
            task(id).end()
        })
    } else {
        console.log("instanced")
    }