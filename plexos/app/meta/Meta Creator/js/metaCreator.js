import {getTask, displayComponent, ajaxReturn} from "/plexos/lib/functions/dll.js"
import Directory from "/plexos/lib/classes/filesystem/directory.js"
import File from "/plexos/lib/classes/filesystem/file.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let arg  = mem.arg

mem.createMeta = async function () {
    let url, type, typeValue, nodeUrl, nodeType
    if (task.node) {
        nodeUrl  = task.node.getElementsByName("URL")[0]
        nodeType = task.node.getElementsByName("Type")[0]
        url  = nodeUrl.value
        type = nodeType.value
        typeValue = nodeType.options[nodeType.selectedIndex].text
    } else {
        url  = arg.url
        type = arg.class
    }

    const slashForwardRegex = /(?<=.*\/.*\/.*)\/(.+)?/
    const domainRegex = /(?:^https?:\/\/([^\/]+)(?:[\/,]|$)|^(.*)$)/
    const urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi

    if(!url.match(urlRegex)) {
        if (task.node) {
            nodeUrl.parentElement.children[2].style.backgroundImage = 'url("/plexos/res/themes/Plexos Hyper/icons/interface/forms/error.png")'
            nodeUrl.parentElement.children[2].style.display = 'block'
            nodeUrl.parentElement.children[2].setAttribute("title", "Invalid URL")
            return
        } else {
            task.end()
        }
    }
    
    arg.file.meta.url = url

    let metaData = await fetch('https://api.linkpreview.net', {
        method: 'POST',
        headers: {
            'X-Linkpreview-Api-Key': "b710d04d852a16b7043411efed956feb",
            'icon': 'b710d04d852a16b7043411efed956feb',
            'title': 'b710d04d852a16b7043411efed956feb',
        },
        mode: 'cors',
        body: JSON.stringify({q:url}),
    }).then(res => {
        if (res.status != 200) {
            //console.log(res)
            //throw new Error('Unable to retrieve metadata');
        }
        return res.json()
    }).then(response => {
        return response
    }).catch(error => {
        console.log(error)
    })

    const exteRegex = /(?:.(?<!\.))+$/s
    const nameRegex = /.+(?=\..+)/s

    const optionTypeRegex = /.+(?= \(\..+\))/
    const optionExteRegex = /(?<=.+ \(\.).+(?=\))/

    let optionsType = "(Metafile"
    let optionsExte = "(meta"
    if (task.node) {
        for(let option of nodeType.options) {
            optionsType += "|"+option.text.match(optionTypeRegex)
            optionsExte += "|"+option.text.match(optionExteRegex)
        }
    }
    optionsType += ")"
    optionsExte += ")"

    let genericNameRegex = new RegExp(`New ${optionsType}( [0-9]+)?\.${optionsExte}`)

    //replace extension with selected type
    let newName = arg.file.name.replace(exteRegex, type)

    //if file has generic name and fetch came in successful
    if (arg.file.name.match(genericNameRegex)) {
        if (metaData && File.validName(metaData.title)) {
            newName = newName.replace(nameRegex, metaData.title) 
        } else {
            newName = newName.replace(nameRegex, url.match(domainRegex)[1])
        } 
    }

    arg.file.rename(newName)

    if(metaData){
        arg.file.meta.title = metaData.title
        arg.file.meta.image = metaData.image
        arg.file.meta.description = metaData.description
    }

    if (type === "web") {
        if (arg.file.meta.url.match(slashForwardRegex)) arg.file.cfg.icon.setImage(arg.file.meta.url.replace(slashForwardRegex, "/favicon.ico"))
        else arg.file.cfg.icon.setImage(arg.file.meta.url + "/favicon.ico")

        const img = new Image()
        img.onload =  () => {}
        img.onerror = () => arg.file.cfg.icon.setImage(`https://s2.googleusercontent.com/s2/favicons?domain_url=${arg.file.meta.url}`)
        img.src = arg.file.cfg.icon.image
    }
    if (type === "img") {
        arg.file.cfg.icon.setImage(arg.file.meta.url)
    }

    if(Directory.isOpen(arg.file.parent().cfg.path)) Directory.isOpen(arg.file.parent().cfg.path).mem.refresh()
    task.end()
}

if (task.node) {
    task.node.getElementById(task.id+"_Accept").onclick = ()=> mem.createMeta()
    task.node.getElementById(task.id+"_Cancel").onclick = ()=> task.end()
} else {
    mem.createMeta()
}