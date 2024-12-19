import {plexos} from "../../ini/system.js"
import Task from "../classes/system/task.js"

let cfg = plexos.cfg

export function ajax(method, url, callback = null, arg = null){
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
    xhr.send()
}

export function ajaxReturn(method, url) {
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

export async function remoteEval(array) {
    for (let url of array) {
        let script = ajaxReturn("get", url)
        await script.then(data=>{
            try {
                eval(data)
            } catch (e) {
                console.error(e)
            }
        })
    }
}
export function genRanHex(size) {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    return alphabet[Math.floor(Math.random() * alphabet.length)]+[...Array(size-1)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
}
export function getTask(id=""){
    return Task.id(id)
}
export function nodeGetters(node, nodeSelector, id){
    node['getElementById'] = function (nodeId) {
        return document.querySelector(`.${id} .${nodeSelector} #${nodeId}`)
    }
    node['getElementsByClassName'] = function (cls) {
        return document.querySelectorAll(`.${id} .${nodeSelector} .${cls}`)
    }
    node['getElementsByName'] = function (name) {
        return document.querySelectorAll(`.${id} .${nodeSelector} [name="${name}"]`)
    }
    node['querySelector'] = function (qry) {
        return document.querySelector(`.${id} .${nodeSelector} ${qry}`)
    }
    node['querySelectorAll'] = function (qry) {
        return document.querySelectorAll(`.${id} .${nodeSelector} ${qry}`)
    }
}
export async function displayComponent({url, taskid, container, env, compid=null}){
    let appHTML = ajaxReturn("get", url)
    await appHTML.then( async data => {
        await loadFront({
            url:url,
            taskid:taskid,
            data:data,
            container:container,
            env:env,
            compid:compid,
        })
    })
    await appHTML.catch( e => {
        console.err(e)
    })
}
export async function loadFront({url, taskid, data, container, env = null, compid = null}){
    data = repDir(data,url)
    data = repTid(data,taskid)
    if (compid) data = repCid(data,compid)
    async function stylizeData(data) {
        return new Promise (async (resolve, reject) => {
            let promiseStyleArray = []
            let cont = document.createElement("div")
            cont.innerHTML = data
            let linkArray = cont.querySelectorAll("link")

            function getStyleContent(link) {
                return new Promise (async (resolve, reject) => {
                    if (link.getAttribute("rel")=="stylesheet") {
                        link.remove()
                        let stylesheet = await ajaxReturn("get", link.getAttribute("href"))
                        resolve(stylesheet)
                    } 
                })
            }

            for(let i = 0; i < linkArray.length; i++){
                promiseStyleArray.push(getStyleContent(linkArray[i]))
            }
            
            let styleContents = await Promise.all(promiseStyleArray)
            
            if (cont.getElementsByTagName("style").length == 0) {
                let style = document.createElement("style")
                cont.appendChild(style)
            }

            for(let css of styleContents) {
                css = repDir(css,url)

                if (Task.id(taskid).window){
                    let regex = /([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g
                    let selectors = [...css.matchAll(regex)].map(match => match[0])
                    let classList = ".window."+taskid+""
                    for (let selector of selectors) {
                        css = css.replace(selector, `${classList} ${selector}`)
                    }
                }
    
                cont.getElementsByTagName("style")[0].innerHTML = cont.getElementsByTagName("style")[0].innerText + css
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
                    let src = null
                    let module = script.getAttribute("type") === "module"
                    let imported = script.hasAttribute("imported")
                    if (script.innerText) { //script written on html
                        js = script.innerText
                    } else if (script.getAttribute("src")) { //script
                        js = await ajaxReturn("get", script.getAttribute("src"))
                        src = script.getAttribute("src")
                    }
                    if (!imported) {
                        js = repDir(js,url)
                        js = repTid(js,taskid)
                        if (compid) js = repCid(js,compid)
                    }
                    resolve({js,src,module,imported})
                })
            }
            for(let i = 0; i < scriptArray.length; i++){
                promiseScriptArray.push(getScriptContent(scriptArray[i]))
            }

            let count = 1
            let scriptContents = await Promise.all(promiseScriptArray)
            for(let {js,src,module,imported} of scriptContents){
                
                try {
                    if (imported) {
                        await window.eval(js)
                    } else if (module) {
                        let proxy = await blobModule(js)
                        Task.id(taskid).blobList.push({proxy:proxy,source:src})
                        await import(proxy)
                    } else {
                        await window.eval(`(async () => { ${js} \n})()`)
                    }
                    if (Task.id(taskid)) Task.get("System").mem.focus(Task.id(taskid))
                } catch (e) {
                    e.taskId = taskid
                    e.source = src
                    evalErrorPopup(
                        js,
                        "The script <i>["+count+"] "+src.match(/[^\/]+$/)+"</i> from the <i>"+Task.id(taskid).name+"</i> application failed evaluation.",
                        e
                    )
                    if (Task.id(taskid)) Task.id(taskid).end()
                    return
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
    if (compid) Task.id(taskid).getComponent(compid).node = cont.children[0]
    await runScripts(container)

    container.style.opacity = 1
    if (env) env.loader(false)
}
export async function blobModule(data) {
    data = data.replace(/import\s+([^'"]+)\s+from\s+['"]([^'"]+)['"]/g, (match, what, path) => {
        const absolutePath = new URL(path, cfg.system.basePath).href
        return `import ${what} from '${absolutePath}'`
    })
    return URL.createObjectURL(new Blob([`${data}`], { type: 'text/javascript' }))
}
export async function runLauncher(url, args = {}, env = null, name = ""){
    if (!Task.canInstance(name)) {
        Task.get("System").mem.focus(Task.get(name))
        return
    }

    //add to env workload
    if (env) env.loader(true)

    //generate task id
    let appID = { id : genRanHex(16)}
    Task.checkUniqueID(appID)

    //place arguments on Task.get("System") task
    Task.get("System").mem.lau[appID.id] = args

    //get .lau file
    let appLauncher = ajaxReturn("get", url)

    appLauncher.then( async data => {
        try {
        let proxy  = await blobModule(data)
        let module = await import(proxy)
            module.initialize(
                {
                    taskid: appID.id,
                    args: Task.get("System").mem.lau[appID.id],
                    addr: url,
                    root: url.replace(url.match(/\/(?:.(?<!\/))+$/s),"")
                }
            )
            if (env) env.loader(false)
        } catch (e) {
            evalErrorPopup
            (
                data,
                "The application launcher at: <i>'" + url + "'</i> failed evaluation.",
                e
            ) 
            console.error(e)
            //URL.revokeObjectURL(proxy)
        }
    })
    appLauncher.catch( e => {
        console.error(e)
        //Task.get("System").mem.var.error = e
        //Task.get("System").mem.var.errorB = [["Okay"]]
        
        evalErrorPopup
        (
            data,
            "The application launcher at: <i>'" + url + "'</i> failed evaluation.",
            e
        ) 
    })
    appLauncher.finally( e => {
        if (env) env.loader(false)
    })
}
export function evalErrorPopup(code, desc, error) {
    //add it to typeError stack
    error.script = code
    Task.get("System").mem.var.error = error
    runLauncher("./plexos/app/sys/Popup/popup.lau.js",
        {
            name:"Error",
            type:true,
            title:"Evaluation Failed", 
            description:desc,
            taskid:Task.get("System").id,
            icon:""
        }
    )
}
export function renameKey(obj, oldName, newName) {
    if(!obj.hasOwnProperty(oldName)) {
        return false;
    }

    obj[newName] = obj[oldName];
    delete obj[oldName];
    return true;
}

function repDir(data, parDir){ //replace root directory for local apps
    let newData = data.replace(/\.\//g, parDir.substr(0, parDir.lastIndexOf("/")) + "/")
    return newData
}
function repTid(data, taskId){ //pass the task id to app
    let newData = data.replaceAll("/TASKID/", JSON.stringify(taskId))
    return newData
}
function repCid(data, compId){
    let newData = data.replaceAll("/COMPID/", JSON.stringify(compId))
    return newData
}

export function preloadImage(url){
    let img=new Image()
    img.src=url
    return img
}

export function getValue(key) {
    let value = null 
    let pairs = []
    let items = location.search.substr(1).split("&")
    for (let i = 0; i < items.length; i++) {
        pairs = items[i].split("=")
        if (pairs[0] === key) value = decodeURIComponent(pairs[1])
    }
    return value
}

export function storageAvailable(type) {
    let storage
    try {
        storage = window[type]
        let x = '__storage_test__'
        storage.setItem(x, x)
        storage.removeItem(x)
        return true
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0)
    }
}

export function wait(ms){
    let start = new Date().getTime()
    let end = start
    while(end < start + ms) {
      end = new Date().getTime()
    }
}

export function iframeAntiHover(bool) {
    let tagIframe = document.getElementsByTagName("iframe")

    for (let i = 0; i < tagIframe.length; i++) {
        if (bool == true) {
            tagIframe[i].className += "antiHover"
        }
        if (bool == false) {
            tagIframe[i].classList.remove("antiHover")
        }
    }
}

export function selectRange(range) {
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
}
export function selectText(node,from=null,to=null) {
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

export function clearSelection() {
    if (window.getSelection) {window.getSelection().removeAllRanges()}
    else if (document.selection) {document.selection.empty()}
}

export function getFavicon(dom) {
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

export function areRectanglesOverlap(div1, div2) {
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

export function nullifyOnEvents(node) {
    document.body.oncontextmenu = null
    document.body.onmousedown = null
    document.body.onclick = null
    node.onkeydown = null
    window.onkeydown = null
    window.onkeyup = null
}