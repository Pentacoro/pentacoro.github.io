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
            windowArray[parseInt(document.getElementsByClassName("ID_"+id)[0].id.match(/(\d+)/)[0])].deleteNode()

            taskArray = taskArray.remove(findTask(id))
        }
    }
}

function checkUniqueID(_this){
    for (i = 0; i < taskArray.length; i++){
        if (taskArray[i].id == _this.id && taskArray[i] != _this){
            _this.id = genRanHex(16)
            checkUniqueID(_this)
        }
    }
}

function canInstance(appName){
    for (i = 0; i < taskArray.length; i++){
        if (taskArray[i].inst === false && taskArray[i].apps === appName) return false
    }
    return true
}

function findTask(id) {
    let find = taskArray.filter(task => task.id === id)
    return find[0]
}