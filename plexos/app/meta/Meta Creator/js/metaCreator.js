import {getTask, displayComponent} from "/plexos/lib/functions/dll.js"
import Directory from "/plexos/lib/classes/files/directory.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let arg  = mem.arg

let nodeUrl  = task.node.getElementsByName("URL")[0]
let nodeType = task.node.getElementsByName("Type")[0]

task.node.getElementById(task.id+"_Accept").onclick = async ()=>{
    let url  = nodeUrl.value
    let type = nodeType.value
    let typeValue = nodeType.options[nodeType.selectedIndex].text

    const slashForwardRegex = /(?<=.*\/.*\/.*)\/(.+)?/
    const domainRegex = /(?:^https?:\/\/([^\/]+)(?:[\/,]|$)|^(.*)$)/
    const urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi

    if(!url.match(urlRegex)) {
        nodeUrl.parentElement.children[2].style.backgroundImage = 'url("/plexos/res/themes/Plexos Hyper/icons/interface/forms/error.png")'
        nodeUrl.parentElement.children[2].style.display = 'block'
        nodeUrl.parentElement.children[2].setAttribute("title", "Invalid URL")
        return
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
            console.log(res)
            throw new Error('Unable to retrieve metadata');
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
    for(let option of nodeType.options) {
        optionsType += "|"+option.text.match(optionTypeRegex)
        optionsExte += "|"+option.text.match(optionExteRegex)
    }
    optionsType += ")"
    optionsExte += ")"

    let genericNameRegex = new RegExp(`New ${optionsType}( [0-9]+)?\.${optionsExte}`)

    //replace extension with selected type
    let newName = arg.file.name.replace(exteRegex, type)

    //if file has generic name and fetch came in successful
    if (arg.file.name.match(genericNameRegex)) {
        if (metaData && metaData.title!="") {
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

        let iconImage = fetch(arg.file.cfg.icon.imag)
        iconImage.catch(()=>{
            arg.file.cfg.icon.setImage(`https://s2.googleusercontent.com/s2/favicons?domain_url=${arg.file.meta.url}`)
        })
    }
    if (type === "img") {
        arg.file.cfg.icon.setImage(arg.file.meta.url)
    }

    if(Directory.isOpen(arg.file.cfg.parent)) Directory.isOpen(arg.file.cfg.parent).mem.refresh()
    task.end()
}
task.node.getElementById(task.id+"_Cancel").onclick = ()=>{
    task.end()
}