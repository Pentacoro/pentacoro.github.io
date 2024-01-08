jsc.ajax = function(method, url, callback = null, arg = null){
    let xhr = new XMLHttpRequest;
    xhr.open(method,url)
    xhr.onload = () => {
        if(xhr.status == 200){
            if (arg === null){
                if (callback) callback(xhr.response)
            } else {
                if (callback) callback(xhr.response, arg)
            }
        }
    }
    xhr.send();
}

jsc.ajaxReturn = function(method, url) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest
        xhr.open(method, url)
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response)
            } else {
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText,
                    statusUrl: url
                })
            }
        }
        xhr.onerror = () => {
            reject({
                status: xhr.status,
                statusText: xhr.statusText,
                statusUrl: url
            })
        }
        xhr.send()
    })
}

jsc.genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

jsc.displayComponent = async function({url, taskid, container, replacementPairs, env}){
    let appHTML = jsc.ajaxReturn("get", url)
    await appHTML.then( async data => {
        await jsc.loadFront({
            url:url,
            taskid:taskid,
            data:data,
            container:container,
            replacementPairs:replacementPairs,
            env:env,
        })
    })
    await appHTML.catch( e => {
        system.mem.var.error = e
        system.mem.var.errorB = [["Okay"]]
        jsc.runLauncher("./apps/system_popup/popup_lau.js",
            {
                name:e.status,
                type:false,
                title:"Component: " + e.statusText, 
                description:"Couldn't load component at: <i>'" + e.statusUrl + "'</i>",
                taskid:system.id,
                icon:""
            }
        )
        Task.id(id).end()
    })
}
jsc.loadFront = async function({url, taskid, data, replacementPairs = [], container, env = null}){
    data = jsc.repDir(data,url)
    data = jsc.repTid(data,taskid)
    if (replacementPairs.length > 0) data = jsc.repArr(data,replacementPairs)
    async function stylizeData(data) {
        return new Promise (async (resolve, reject) => {
            let promiseStyleArray = []
            let cont = document.createElement("div")
            cont.innerHTML = data
            let linkArray = cont.getElementsByTagName("link")

            function getStyleContent(link) {
                return new Promise (async (resolve, reject) => {
                    if (link.getAttribute("rel")=="stylesheet") {
                        link.remove()
                        let stylesheet = await jsc.ajaxReturn("get", link.getAttribute("href"))
                        resolve("/*" + link.getAttribute("href") + "*/" + stylesheet)
                    } 
                })
            }

            for(i = 0; i < linkArray.length; i++){
                promiseStyleArray.push(getStyleContent(linkArray[i]))
            }
            
            let styleContents = await Promise.all(promiseStyleArray)
            
            if (cont.getElementsByTagName("style").length == 0) {
                let style = document.createElement("style")
                cont.appendChild(style)
            }
            //let newStyleElement = document.createElement("style")
            //newStyleElement.classList.add("ID_"+taskid)
            //document.head.appendChild(newStyleElement)
            for(let css of styleContents) {
                css = jsc.repTid(css,taskid)
                css = jsc.repDir(css,url)
                if (replacementPairs) css = jsc.repArr(css, replacementPairs)
                cont.getElementsByTagName("style")[0].innerHTML = cont.getElementsByTagName("style")[0].innerText + css
                //newStyleElement.innerHTML = cont.getElementsByTagName("style")[0].innerText
            }
            resolve(cont)
    })}
    async function runScripts(data) {
        return new Promise (async (resolve, reject) => {
            let promiseScriptArray = []
            let scriptArray = data.getElementsByTagName("script")

            function getScriptContent(script) {
                return new Promise (async (resolve, reject) => {
                    let js = null
                    let imported = true
                    if (script.innerText) {
                        js = script.innerText
                        if (!script.classList.contains("imported")) {
                            imported = false
                            js = jsc.repDir(js,url)
                            js = jsc.repTid(js,taskid)
                            js = jsc.repArr(js,replacementPairs)
                        }
                        //await eval("const runScript = async function(){return new Promise (async (resolve, reject)=>{\n"+js+"\nresolve()})}; runScript();console.log('wow')")
                    } else if (script.getAttribute("src")) {
                        js = await jsc.ajaxReturn("get", script.getAttribute("src"))
                        if (!script.classList.contains("imported")) {
                            imported = false
                            js = jsc.repDir(js,url)
                            js = jsc.repTid(js,taskid)
                            js = jsc.repArr(js,replacementPairs)
                        }
                        //await eval("const runScript = async function(){return new Promise (async (resolve, reject)=>{\n"+js+"\nresolve()})}; runScript();console.log('wow')")
                    }
                    resolve({js,imported})
                })
            }

            for(i = 0; i < scriptArray.length; i++){
                promiseScriptArray.push(getScriptContent(scriptArray[i]))
            }

            let scriptContents = await Promise.all(promiseScriptArray)

            for({js,imported} of scriptContents){
                let count = 0
                try {
                    if (!imported) {
                        await eval("const runScript = async function(){return new Promise (async (resolve, reject)=>{"+js+";resolve()})}; runScript();")
                    } else {
                        await eval(js)
                    }
                    if (Task.id(taskid)) system.mem.focus(Task.id(taskid))
                } catch (e) {
                    e.taskId = taskid
                    jsc.evalErrorPopup
                    (
                        js,
                        "The script number <i>"+count+"</i> from the <i>"+Task.id(taskid).name+"</i> application failed evaluation.",
                        e
                    )
                    if (Task.id(taskid)) Task.id(taskid).end()
                } finally {
                    count++
                }
            }
            resolve("Success")
    })}

    if (env) env.loader(true)
    container.style.opacity = 0

    let cont = await stylizeData(data)
    container.innerHTML = cont.innerHTML
    await runScripts(container)

    container.style.opacity = 1
    if (env) env.loader(false)
}
jsc.runLauncher = async function(url, args = {}, env = null, name = ""){
    if (!Task.canInstance(name)) {
        system.mem.focus(Task.openInstance(name))
        return
    }

    //add to env workload
    if (env) env.loader(true)

    //generate task id
    let appID = { id : jsc.genRanHex(16)}
    Task.checkUniqueID(appID)

    //place arguments on system task
    system.mem.lau[appID.id] = args

    //get _lau file
    let appLauncher = jsc.ajaxReturn("get", url)

    appLauncher.then( oData => {
        nData = oData.replace("let params = {}", "let params = system.mem.lau['"+appID.id+"']")
        nData = nData.replace("let taskid = ''", "let taskid = '"+appID.id+"'")

        //put launcher code here to later be referenced
        document.getElementById("appLauncher").innerHTML = "<script>"+nData+"</script>"
        
        try {
            eval("const runScript = async function(){return new Promise (async (resolve, reject)=>{"+nData+";resolve()})}; runScript();")
            if (env) env.loader(false)
        } catch (e) {
            jsc.evalErrorPopup
            (
                nData,
                "The application launcher at: <i>'" + url + "'</i> failed evaluation.",
                e
            )
        }
    })
    appLauncher.catch( e => {
        system.mem.var.error = e
        system.mem.var.errorB = [["Okay"]]
        
        jsc.runLauncher("./apps/system_popup/popup_lau.js",
            {
                name:e.status,
                type:false,
                title:"Launcher: " + e.statusText, 
                description:"Couldn't load launcher at: <i>'" + url + "'</i>.",
                taskid:system.id,
                icon:""
            }
        )
    })
    appLauncher.finally( e => {
        if (env) env.loader(false)
    })
}

jsc.evalErrorPopup = function(code, desc, err) {
    //find and color-code the problematic line
    let coder = ""
    coder = code.replace(/[<]/g, "&lt;")
    coder = coder.replace(/[>]/g, "&gt;")
    let script = coder.lines()
    let colour = "\n"
    for (y = 0; y < script.length; y++) {
        colour += (y === (err.lineNumber - 1)) ?    "<span style='display:flex'><span style='color:red;display:inline;font-size:10px'>"+
                                                    script[y]+
                                                    "</span><span style='color:green;display:inline;font-size:10px'> // <b style='font-size:10px'>← ERROR !</b></span></span>" 
                                                    : script[y]+"\n"
    }

    //add it to typeError stack
    err.script = colour
    system.mem.var.error = err
    jsc.runLauncher("./apps/system_popup/popup_lau.js",
        {
            name:"Error",
            type:true,
            title:"Evaluation Failed", 
            description:desc,
            taskid:system.id,
            icon:""
        }
    )
}

String.prototype.splice = function (index, count) {
    let splicedStr = this.slice(0, index) + this.slice(index + count, this.length)
    let extractStr = ""
    for(i = index; i < index+count; i++) {
        extractStr += this[i.toString()]
    }
    return [splicedStr, extractStr]
}

String.prototype.lines = function () {
    return this.split('\n')
}

Array.prototype.remove = function(value) {
    let newArr = this.filter(function(item) {
        return item !== value
    })

    return newArr
}

jsc.renameKey = function (obj, oldName, newName) {
    if(!obj.hasOwnProperty(oldName)) {
        return false;
    }

    obj[newName] = obj[oldName];
    delete obj[oldName];
    return true;
}

jsc.repDir = function (data, parDir){ //replace asset directory for local apps
    let newData = data.replace(/\.\//g, parDir.substr(0, parDir.lastIndexOf("/")) + "/")
    return newData
}
jsc.repTid = function (data, taskId){ //place the task id on element classList for apps that allow multiple windows
    let newData = data.replace(/TASKID/g, taskId)
    return newData
}
jsc.repArr = function (data, replacementPairs) { //replace all required instances listed as regex and text pairs
    let newData = data
    for (pair of replacementPairs) {
        newData = newData.replace(pair.regex,pair.text)
    }
    return newData
}

jsc.preloadImage = function(url){
    let img=new Image()
    img.src=url
}

jsc.getValue = function(key) {
    let value = null 
    let pairs = []
    let items = location.search.substr(1).split("&")
    for (let i = 0; i < items.length; i++) {
        pairs = items[i].split("=")
        if (pairs[0] === key) value = decodeURIComponent(pairs[1])
    }
    return value
}

jsc.wait = function (ms){
    let start = new Date().getTime()
    let end = start
    while(end < start + ms) {
      end = new Date().getTime()
    }
}

jsc.iframeAntiHover = function (bool) {
    let tagIframe = document.getElementsByTagName("iframe")

    for (i = 0; i < tagIframe.length; i++) {
        if (bool == true) {
            tagIframe[i].className += "antiHover"
        }
        if (bool == false) {
            tagIframe[i].classList.remove("antiHover")
        }
    }
}

jsc.selectRange = function (range) {
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
}
jsc.selectText = function (node,from=null,to=null) {
    if (window.getSelection) {
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(node)
        if (from!=null && to!=null) {
            range.setStart(node.firstChild,from)
            range.setEnd  (node.firstChild,to)
        }
        selection.removeAllRanges()
        selection.addRange(range)
    } else if (document.body.createTextRange) {
        const range = document.body.createTextRange()
        range.moveToElementText(node)
        range.select()
    } else {
        console.warn("Could not select text in node: Unsupported browser.")
    }
}

jsc.clearSelection = function () {
    if (window.getSelection) {window.getSelection().removeAllRanges()}
    else if (document.selection) {document.selection.empty()}
}

jsc.getFavicon = function (dom) {
    let favicon = null
    let nodeList = dom.getElementsByTagName("link")
    for (let i = 0; i < nodeList.length; i++)
    {
        if((nodeList[i].getAttribute("rel") == "icon")||(nodeList[i].getAttribute("rel") == "shortcut icon"))
        {
            favicon = nodeList[i].getAttribute("href")
        }
    }
    return favicon
}

jsc.areRectanglesOverlap = function (div1, div2) {
	let x1 = div1.offsetLeft;
	let y1 = div1.offsetTop;
	let h1 = y1 + div1.offsetHeight;
	let w1 = x1 + div1.offsetWidth;

	let x2 = div2.offsetLeft;
	let y2 = div2.offsetTop;
	let h2 = y2 + div2.offsetHeight;
	let w2 = x2 + div2.offsetWidth;

	if (h1 < y2 || y1 > h2 || w1 < x2 || x1 > w2) return false;
	return true;
}


//document.onselectionchange = () => {console.log("New selection made");selection = document.getSelection();console.log(selection);};