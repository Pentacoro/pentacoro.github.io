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

const loadURL = function(data, container){
    container.innerHTML = data;

    if (container.getElementsByTagName("script")){
        eval(container.getElementsByTagName("script")[1].innerText);
    }  
}

async function loadAPP(url){
    windowArray.push(new Window("Desktop Grid Settings", "settingsApp:grid", false, false, 1, 1, 200, 200, 350, 560));
    newWindow = windowArray[windowArray.length - 1]
    newWindow.createNode();

    let appHTML = ajaxReturn("get", url);
    appHTML.then( data => {
        loadURL(repDir(data,url), document.getElementById("windowNumber" + windowArray.indexOf(newWindow)).children[0].children[1]);
    })
    appHTML.catch( err => {
        console.log(err);
    })
}

function repDir(sonDir, parDir){ //replace asset directory for local apps
    let newDir = sonDir.replace(/\.\/assets/g, parDir.substr(0, parDir.lastIndexOf("/")) + "/assets");
    return newDir;
}

function preloadImage(url){
    var img=new Image();
    img.src=url;
}