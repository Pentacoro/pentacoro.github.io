var core = new Directory ("core")

core.createNewDir   (
                        "vertex",  
                        {
                            icon : new Icon ("background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');", "vertex", "explorer", 0),
                            from : core,
                            type : "dir",
                            vert : true
                        }
                    )

var currentVertex = core.cont["vertex"]

core.cont["vertex"].createNewDir("Folder 1")
core.cont["vertex"].createNewDir("Folder 2")
core.cont["vertex"].createNewDir("Folder 3")


console.log(addressInterpreter("/vertex/Folder 3"))
function addressInterpreter(addr = "") {
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
            } else { 
                return expression 
            }

        }
    }

    return expression
}
// core/vertex/Folder 3/


//future init function
/*
for ([key,value] of Object.entries(core.cont["vertex"].cont)) {
    iconArray.push(value.conf.icon)
    value.conf.icon.createNode()
}
*/
