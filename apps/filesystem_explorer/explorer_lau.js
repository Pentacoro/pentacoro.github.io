    let arg = []
    //[0] directory name
    let tid = ''
    let url = "./apps/filesystem_explorer/explorer.html"
    let lau = "./apps/filesystem_explorer/explorer_lau.html"

    //on app init
    function ini() {

    }
    //on app end
    function end() {

    }

    //check if instance allowed
    if (canInstance("Explorer")) {
        //task creation
        let task = new Task("Explorer", true, end, null, "plx", tid)
        sys.taskArr.push(task)
        let id = task.id

        //get the .html
        let appHTML = ajaxReturn("get", url)
        appHTML.then( data => {
            try {
                //window generation
                sys.wndwArr.push(new Window(arg[0], id, true, 3, 1, 700, 460, 192, 160))
                newWindow = sys.wndwArr[sys.wndwArr.length - 1]
                newWindow.createNode()
                
                task.wndw = newWindow 
                task.node = newWindow.cont
    
                ini()
    
                data = repDir(data,url)
                data = repTid(data,id)
                data = data.replace(/xcorex/g,arg[1])
    
                loadURL(data, document.getElementById("window_" + sys.wndwArr.indexOf(newWindow)).children[0].children[1])
            } catch (e) {
                evalErrorPopup(
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