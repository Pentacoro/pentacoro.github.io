const ajax = function(metodo, url, callback, arg = null){
    let xhr = new XMLHttpRequest;
    xhr.open(metodo,url)
    xhr.addEventListener("load", function(){
        if(xhr.status == 200){
            if (arg === null){
                callback(xhr.response)
            } else {
                callback(xhr.response, arg)
            }
        }
    })
    xhr.send()
}

const loadURL = function(data, container){
    container.innerHTML = data;
    if (container.getElementsByTagName("script")){
        eval(container.getElementsByTagName("script")[1].innerText);
    }  
}

const loadAPP = function(url){
    windowArray.push(new Window("Desktop Grid Settings", "settingsApp:grid", false, false, 1, 1, 200, 200, 350, 530));
    newWindow = windowArray[windowArray.length - 1]
    newWindow.createNode();

    ajax("get",url,loadURL, document.getElementById("windowNumber" + windowArray.indexOf(newWindow)).children[0].children[1]);
}