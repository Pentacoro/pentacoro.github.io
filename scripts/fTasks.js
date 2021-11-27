//javascript.js
//f.js
//fWindows.js

class Task {
    constructor(apps, inst = true, appEnd = null, node = null, name = null) {
        this.apps = apps
        this.name = name

        this.inst = inst
        this.node = node

        this.load = 0
        this.pocket = []

        this.mem = {var: {} }
        this.id = genRanHex(16)
        checkUniqueID(this)
        let id = this.id

        //end task
        if (appEnd) {
            this.end = function() {
                
                appEnd()

                //close window
                if (document.getElementsByClassName("ID_"+id).length > 0) sys.wndwArr[parseInt(document.getElementsByClassName("ID_"+id)[0].id.match(/(\d+)/)[0])].deleteNode()
    
                sys.taskArr = sys.taskArr.remove(findTask(id))
            }
        }

        this.loader = function(op) {
            (op) ? this.load++ : this.load--
            this.load = (this.load < 0) ? 0 : this.load

            if (this.load === 0) {
                if (this.node) this.node.style.cursor = ""
            } else {
                if (this.node) this.node.style.cursor = "progress"
            }
        }
    }
}

function checkUniqueID(_this){
    for (i = 0; i < sys.taskArr.length; i++){
        if (sys.taskArr[i].id == _this.id && sys.taskArr[i] != _this){
            _this.id = genRanHex(16)
            checkUniqueID(_this)
        }
    }
}

function canInstance(appName){
    for (i = 0; i < sys.taskArr.length; i++){
        if (sys.taskArr[i].inst === false && sys.taskArr[i].apps === appName) return false
    }
    return true
}

function findTask(id) {
    let find = sys.taskArr.filter(task => task.id === id)
    return find[0]
}

function endTask(taskid) {
    findTask(taskid).end()
}

sys.taskArr.push(new Task("sys", false, null, null, "system"))
const system = sys.taskArr[sys.taskArr.length - 1]