//javascript.js
//f.js

class Task {
    constructor(apps, inst = true, appEnd) {
        this.apps = apps
        this.inst = inst
        this.pocket = []
        this.memory = {}
        this.id = genRanHex(16)
        checkUniqueID(this)
        let id = this.id

        //end task
        this.end = function() {
            
            appEnd()
            sys.wndwArr[parseInt(document.getElementsByClassName("ID_"+id)[0].id.match(/(\d+)/)[0])].deleteNode()

            sys.taskArr = sys.taskArr.remove(findTask(id))
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