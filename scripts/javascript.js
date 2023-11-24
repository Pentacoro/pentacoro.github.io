const ajax = function(method, url, callback = null, arg = null){
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

const ajaxReturn = function(method, url) {
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

const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

const loadURL = async function({url, taskid, data, replacementPairs = [], container, env = null}){
    data = repDir(data,url)
    data = repTid(data,taskid)
    if (replacementPairs.length > 0) data = repArr(data,replacementPairs)
    async function stylizeData() {
        return new Promise (async (resolve, reject) => {
            let promiseStyleArray = []
            let cont = document.createElement("div")
            cont.innerHTML = data

            function getStyleContent (link) {
                return new Promise ((resolve, reject) => {
                    if (link.getAttribute("rel")=="stylesheet") {
                        let stylesheet = ajaxReturn("get", link.getAttribute("href"))
                        stylesheet.then( css => resolve("/*" + link.getAttribute("href") + "*/" + css))
                        link.remove()
                    } 
                })
            }

            if (cont.getElementsByTagName("link").length > 0){
                for(i = 0; i < cont.getElementsByTagName("link").length; i++){
                    try {
                        promiseStyleArray.push(getStyleContent(cont.getElementsByTagName("link")[i]))
                    } catch (e) {
                        loadAPP("./apps/system_popup/popup_lau.js",
                            [
                                "Error",
                                false,
                                "Launcher: " + e.statusText, 
                                "The style number <i>"+i+"</i> from the application <i>"+taskid+"</i> failed to load.",
                                system.id,
                                ""
                            ]
                        )
                    }
                }
            }
            
            let styleContents = await Promise.all(promiseStyleArray)
            
            if (cont.getElementsByTagName("style").length == 0) {
                let style = document.createElement("style")
                cont.appendChild(style)
            }
            for(css of styleContents) {
                css = repTid(css,taskid)
                css = repDir(css,url)
                if (replacementPairs) css = repArr(css, replacementPairs)
                cont.getElementsByTagName("style")[0].innerHTML = cont.getElementsByTagName("style")[0].innerText + css
            }
            resolve(cont)
        })
    }
    if (env) env.loader(true)

    let promise = stylizeData()

    promise.then(async cont => {
        container.innerHTML = cont.innerHTML
        
        if (container.getElementsByTagName("script")){
            for(i = 0; i < container.getElementsByTagName("script").length; i++){
                try {
                    if (container.getElementsByTagName("script")[i].innerText) {
                        let js = container.getElementsByTagName("script")[i].innerText
                        js = repDir(js,url)
                        js = repTid(js,taskid)
                        js = repArr(js,replacementPairs)
                        eval(js)
                    } else if (container.getElementsByTagName("script")[i].getAttribute("src")) {
                        let index = i
                        let js = await ajaxReturn("get", container.getElementsByTagName("script")[index].getAttribute("src"))
                        try {
                            js = repDir(js,url)
                            js = repTid(js,taskid)
                            js = repArr(js,replacementPairs)
                            eval(js)
                        } catch (e) {
                            evalErrorPopup
                            (
                                js,
                                "The script number <i>"+index+"</i> from the application <i>"+taskid+"</i> failed evaluation.",
                                e
                            )
                        }
                    }
    
                    system.mem.focus(system.mem.task(taskid))
                } catch (e) {
                    evalErrorPopup
                    (
                        container.getElementsByTagName("script")[i].innerText,
                        "The script number <i>"+i+"</i> from the application <i>"+taskid+"</i> failed evaluation.",
                        e
                    )
                    system.mem.task(taskid).end()
                }
            }
        }  
        if (env) env.loader(false)
    })
}

async function loadAPP(url, args = {}, env = null){
    //add to env workload
    if (env) env.loader(true)

    //generate task id
    let appID = { id : genRanHex(16)}
    checkUniqueID(appID)

    //place arguments on system task
    system.mem.lau[appID.id] = args

    //get _lau file
    let appLauncher = ajaxReturn("get", url)

    appLauncher.then( oData => {
        nData = oData.replace("let params = {}", "let params = system.mem.lau['"+appID.id+"']")
        nData = nData.replace("let taskid = ''", "let taskid = '"+appID.id+"'")

        //put launcher code here to later be referenced
        document.getElementById("appLauncher").innerHTML = "<script>"+nData+"</script>"
        
        try {
            eval(nData)
            if (env) env.loader(false)
        } catch (e) {
            evalErrorPopup
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
        
        loadAPP("./apps/system_popup/popup_lau.js",
            [
                e.status,
                false,
                "Launcher: " + e.statusText, 
                "Couldn't load launcher at: <i>'" + url + "'</i>.",
                system.id,
                ""
            ]
        )
    })
    appLauncher.finally( e => {
        if (env) env.loader(false)
    })
}

function evalErrorPopup(code, desc, err) {
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
    err.stack = err.stack + "<br><br><hr><br> <b>script:</b>" + colour
    system.mem.var.error = err
    loadAPP("./apps/system_popup/popup_lau.js",
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

function renameKey(obj, oldName, newName) {
    if(!obj.hasOwnProperty(oldName)) {
        return false;
    }

    obj[newName] = obj[oldName];
    delete obj[oldName];
    return true;
}

function stringifyArrayArg(arr) {
    let loop   = 0
    let string = "["
    for (item of arr) {
        if (loop > 0) string += ","
        string += stringifyArg(item)
        loop++
    }
    string += "]"
    return string
}
function stringifyObjectArg(obj) {
    let loop   = 0
    let string = "{"
    for([key, value] of Object.entries(obj)) {
        if (loop > 0) string += ","
        string += "" + key + ":" + stringifyArg(value)
        loop++
    }
    string += "}"
    return string
}
function stringifyArg(arg) {
    string = ""
    switch (typeof(arg)) {
        case "number":
        case "boolean":
        case "undefined":
            string = arg
            break

        case "string":
            string = "\""+arg+"\""
            break
 
        case "function":
            string = arg.name
            break

        case "object":
            if (Array.isArray(arg)) {
                string = stringifyArrayArg(arg)

            } else if (arg === null) {
                string = "null"
            } else {
                string = stringifyObjectArg(arg)
            }
            break

        default: 
            string = "undefined"
    }
    return string
}

function repDir(data, parDir){ //replace asset directory for local apps
    let newData = data.replace(/\.\/assets/g, parDir.substr(0, parDir.lastIndexOf("/")) + "/assets");
    newData     = newData.replace(/\.\/res/g, parDir.substr(0, parDir.lastIndexOf("/")) + "/res");
    return newData;
}
function repTid(data, taskId){ //place the task id on element classList for apps that allow multiple windows
    let newData = data.replace(/TASKID/g, taskId);
    return newData;
}
function repArr(data, replacementPairs) { //replace all required instances listed as regex and text pairs
    let newData = data
    for (pair of replacementPairs) {
        newData = newData.replace(pair.regex,pair.text)
    }
    return newData;
}

function preloadImage(url){
    let img=new Image()
    img.src=url
}

function getValue(key) {
    let value = null 
    let pairs = []
    let items = location.search.substr(1).split("&")
    for (let i = 0; i < items.length; i++) {
        pairs = items[i].split("=")
        if (pairs[0] === key) value = decodeURIComponent(pairs[1])
    }
    return value
}

function wait(ms){
    let start = new Date().getTime()
    let end = start
    while(end < start + ms) {
      end = new Date().getTime()
    }
}

function iframeAntiHover (coin) {
    let tagIframe = document.getElementsByTagName("iframe")

    for (i = 0; i < tagIframe.length; i++) {
        if (coin == true) {
            tagIframe[i].className += "antiHover"
        }
        if (coin == false) {
            tagIframe[i].classList.remove("antiHover")
        }
    }
}

function selectText(node) {
    if (document.body.createTextRange) {
        const range = document.body.createTextRange()
        range.moveToElementText(node)
        range.select()
    } else if (window.getSelection) {
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(node)
        selection.removeAllRanges()
        selection.addRange(range)
    } else {
        console.warn("Could not select text in node: Unsupported browser.")
    }
}

function clearSelection(){
    if (window.getSelection) {window.getSelection().removeAllRanges()}
    else if (document.selection) {document.selection.empty()}
}

function getFavicon(dom){
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

//-----------------------------------------------------------------|
function areRectanglesOverlap(div1, div2) {
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
//-----------------------------------------------------------------|