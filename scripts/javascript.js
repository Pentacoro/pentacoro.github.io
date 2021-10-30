const ajax = function(method, url, callback, arg = null){
    let xhr = new XMLHttpRequest;
    xhr.open(method,url)
    xhr.onload = () => {
        if(xhr.status == 200){
            if (arg === null){
                callback(xhr.response)
            } else {
                callback(xhr.response, arg)
            }
        }
    }
    xhr.send();
}

const ajaxReturn = function(method, url) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest;
        xhr.open(method, url);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = () => {
            reject({
                status: xhr.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}
const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

const loadURL = function(data, container){
    container.innerHTML = data;
    
    if (container.getElementsByTagName("script")){
        for(i = 0; i < container.getElementsByTagName("script").length; i++){
            eval(container.getElementsByTagName("script")[i].innerText)
        }
    }  
}

async function loadAPP(url, arg = []){
    let appLauncher = ajaxReturn("get", url);
    appLauncher.then( data => {
        newData = data.replace("let arg = []", "let arg = "+stringifyArg(arg))
        document.getElementById("appLauncher").innerHTML = newData
        eval(document.getElementById("appLauncher").getElementsByTagName("script")[0].innerText)
    })
    appLauncher.catch( err => {
        console.log(err);
    })
}

String.prototype.splice = function (index, count) {
    let splicedStr = this.slice(0, index) + this.slice(index + count, this.length)
    let extractStr = ""
    for(i = index; i < index+count; i++) {
        extractStr += this[i.toString()]
    }
    return [splicedStr, extractStr]
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

function repDir(sonDir, parDir){ //replace asset directory for local apps
    let newData = sonDir.replace(/\.\/assets/g, parDir.substr(0, parDir.lastIndexOf("/")) + "/assets");
    return newData;
}
function repTid(data, taskId){ //place the task id on element classList for apps that allow multiple windows
    let newData = data.replace(/TASKID/g, taskId);
    return newData;
}

function preloadImage(url){
    var img=new Image();
    img.src=url;
}


function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }