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