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

async function loadAPP(url){
    let appLauncher = ajaxReturn("get", url);
    appLauncher.then( data => {
        document.getElementById("appLauncher").innerHTML = data
        eval(document.getElementById("appLauncher").getElementsByTagName("script")[0].innerText)
    })
    appLauncher.catch( err => {
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


function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }