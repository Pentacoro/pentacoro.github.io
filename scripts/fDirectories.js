//javascript.js
//f.js
//fIcon.js
//fIconDir.js
//fDesktop.js
class Configuration {
    constructor(p){
        this.type = p.type
        this.addr = p.addr || ""
        this.from = p.from || ""
        this.exte = (p.exte!=undefined) ? p.exte : (p.type==="Directory") ? "dir" : ""
        this.icon = (p.icon!=undefined) ? p.icon : null
        this.move = (p.move!=undefined) ? p.move : true
        this.vert = (p.vert!=undefined) ? p.vert : false
        this.plex = (p.plex!=undefined) ? p.plex : false
    }
}

class Directory extends File {
    conf = {}
    cont = {}
    constructor(p) {
        super()
        this.name = p.name
        this.conf = p.conf || this.conf
        this.cont = p.cont || this.cont
    }

    new
    (   Type, 
        childName, 
        childIcon = null, 
        childConf = null, 
        childCont = null,
    ) {
        let parent = this

        let defaults = filetypeDefaults(Type)
        let iconImag = defaults.iconImag
        let confType = defaults.confType
        let skeyName = defaults.skeyName

        childName = childName + (((confType!="Directory") && !childName.includes(".")) ? "." + childName.match(/(?:.(?<!\.))+$/s)[0] : "")

        if (childConf) { 
            //if conf argument passed use it
            this.cont[childName] = new Type({name : childName, conf : (new Configuration (childConf))})
        } else { 
            //if no conf argument passed, create default filetype
            this.cont[childName] = new Type
            (
                {
                    name : childName,
                    conf : new Configuration (
                    {
                        from : (parent===core) ? "" : "" + parent.conf["from"] + "/" + parent.name,
                        type : confType,
                        move : true,
                        exte : (confType=="Directory") ? "dir" : childName.match(/(?:.(?<!\.))+$/s)[0],
                        icon : childIcon || new Icon (
                                                {
                                                    imag : iconImag, 
                                                    name : childName, 
                                                    type : confType, 
                                                    exte : childName.match(/(?:.(?<!\.))+$/s)[0],
                                                    stat : 0  
                                                }
                                            ),
                    })
                }
            )
        }
        this.cont[childName].conf.addr = this.cont[childName].conf["from"] + "/" + childName
        this.cont[childName].conf["icon"].file = this.cont[childName].conf["from"] + "/" + childName

        if (childCont) {
            this.cont[childName][skeyName] = childCont
        }

        try {
            parent.checkCont()
        } catch (e) {
            console.log(e)
        }
    }

    checkCont(){ //this function swaps default dir icons whether it contains files or not
        if (Object.keys(this.cont).length > 0 && this.conf.icon.imag == filetypeDefaults(Directory).iconImag) {
            this.conf.icon.imag = filetypeDefaults(Directory).iconImag.replace("DIR", "DIRc")
        } else if (Object.keys(this.cont).length == 0 && this.conf.icon.imag == filetypeDefaults(Directory).iconImag.replace("DIR", "DIRc")) {
            this.conf.icon.imag = filetypeDefaults(Directory).iconImag
        }
    }
}

function isDirOpen(addr) {
    for (task of sys.taskArr) {
        if (task.apps === "exp" && task.mem.address === addr) return true
    }
    return false
}

//--------------------------------------------------------------------------|
function at(addr = "") {
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
        string.slice(-1) != "." &&
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
