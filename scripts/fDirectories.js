//javascript.js
//f.js
//fIcon.js
//fIconDir.js
//fDesktop.js

class Directory {
    constructor(name, conf = {}, cont = {}) {
        this.name = name
        this.conf = conf
        this.cont = cont
    }

    new(Type, childName, childConf = null, childCont = null) {
        let parent = this

        let iconImag = null
        let confType = null
        let skeyName = null

        switch (Type) {
            case Directory:
                iconImag = "background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');"
                confType = "dir"
                skeyName = "cont"
                break
            case Executable:
                iconImag = "background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');"
                confType = "lau"
                skeyName = "lurl"
                break 
            case Metafile: 
                iconImag = "background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');"
                confType = "msf"
                skeyName = "meta"
                break
            case JSobject:
                iconImag = "background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');"
                confType = "obj"
                skeyName = "data"
                break 
        }

        if (childConf) { 
            //if conf argument passed use it
            this.cont[childName] = new Type(childName,childConf)
        } else { 
            //if no conf argument passed, create default filetype
            this.cont[childName] = new Type
            (
                childName, 
                {
                    from : "" + parent.conf["from"] + "/" + parent.name,
                    type : confType,
                    move : true,
                    icon : new Icon (
                                        iconImag, 
                                        childName, 
                                        confType, 
                                        0  
                                    ),
                }
            )
        }
        this.cont[childName].conf.addr = this.cont[childName].conf["from"] + "/" + childName
        this.cont[childName].conf["icon"].file = this.cont[childName].conf["from"] + "/" + childName

        if (childCont) {
            this.cont[childName][skeyName] = childCont
        }
    }

    delete() {
        let parent = addrObj(this.conf.from)
        let child = this

        delete parent.cont[child.name]
    }
    moveMe(dest) {
        
    }
    rename(rename) {
        let parent  = addrObj(this.conf.from)
        let newAddress = "" + parent.conf.icon.file + "/" + rename
        let oldAddress = this.conf.icon.file

        this.conf.addr = newAddress
        this.conf.icon.file = newAddress

        rerouteChildren(this)

        function rerouteChildren(parent) {
            for ([name, file] of Object.entries(parent.cont)) {
                file.conf.addr = file.conf.addr.replace(oldAddress, newAddress)
                file.conf.from = file.conf.from.replace(oldAddress, newAddress)
                file.conf.icon.file = file.conf.icon.file.replace(oldAddress, newAddress)
                rerouteChildren(file)
            }
        }

        renameKey(parent.cont, this.name, rename)
        parent.cont[rename].name = rename
        //
    }

    render() {
        if (addrObj(this.conf.from) === sys.vertex) { //if is on current vertex / render on desktop
            repositionIcons([this.conf.icon],true,false)
            desktop.mem.iconArr.push(this.conf.icon)
            this.conf.icon.createNode()
        } else if (isDirOpen(this.conf.from)) { //if is on any other directory / render on explorer
            for (task of sys.taskArr) {
                if (task.apps === "exp" && task.mem.directory === this.conf.from) task.mem.createExplorerIcons([this])
            }
        }
    }

    open() {
        loadAPP(cfg.exec[this.conf.type], [this.name, this.conf.addr], system.mem.var.envfocus)
    }
}

function isDirOpen(addr) {
    for (task of sys.taskArr) {
        if (task.apps === "exp" && task.mem.directory === addr) return true
    }
    return false
}

//--------------------------------------------------------------------------|
function addrObj(addr = "") {
    //string: where we'll devour addr one dir at a time as we build expression
    let string = addr
    //steps: where we'll store each of the dirs extracted from string (useless for now)
    let steps = []
    //expression: where we'll build the object reference from the core to later be eval()
    let expression = "core"
    
    //find first "/"
    let to = string.indexOf("/")

    iterate(to)

    function iterate(to){
        if (to > 0) { //if "/" is not the first char
            nextDir = string.splice(0, to)[1] //get clean dir name

            string = string.splice(0, to - 1)[0] //repeat splice for return
            string = string.splice(0,1)[0] //razor out "/"

            steps.push(nextDir)

            expression += ".cont[\""+nextDir+"\"]"

            if (string.length > 0) {
                to = string.indexOf("/")
                iterate(to)
            } else { 
                return expression 
            }

        } else if (to == 0) { //if "/" is the first char
            string = string.splice(0,1)[0] //razor out "/"
            if (string.length > 0) {
                to = string.indexOf("/")
                iterate(to)
            } else { 
                return expression 
            }

        } else if (to < 0){ //if there's no "/" char
            if (string.length > 0) {
                expression += ".cont[\""+string+"\"]"
                steps.push(string)
                return expression
            } else if (string === ""){ 
                return expression 
            }

        }
    }

    return eval(expression)
}

function validIconName(string) {
    if (
        string != "¡Name me!" &&
        string != "" &&
        string.match(/[\/"]/g) === null
    ) {return true}
    return false
}

function iconNameExists(text, _this, from){
    for ([name, file] of Object.entries(from.cont)){
        if (file.name == text && file.conf.icon != _this) {
            return true
        }
    }
    return false
}
// core/vertex/Folder 3/


//future init function
/*
for ([key,value] of Object.entries(core.cont["vertex"].cont)) {
    iconArray.push(value.conf.icon)
    value.conf.icon.createNode()
}
*/
