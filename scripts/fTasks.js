//javascript.js
//f.js
//fWindows.js

class Task {
    constructor(apps, inst = true, appEnd = null, node = null, from = null, id = null) {
        this.apps = apps
        this.from = from

        this.inst = inst
        this.node = node

        this.load = 0
        this.pocket = []

        this.mem = {var: {} }
        this.id = (id !== null) ? id : genRanHex(16)
        checkUniqueID(this)
        
        //end task
        let thisid = this.id
        this.end = function() {
            
            if (appEnd) appEnd()

            //close window
            if (document.getElementsByClassName("ID_"+thisid).length > 0) {
                sys.wndwArr[parseInt(document.getElementsByClassName("ID_"+thisid)[0].id.match(/(\d+)/)[0])].deleteNode()
            }

            sys.taskArr = sys.taskArr.remove(task(thisid))
        }
    }
    loader(op) {
        (op) ? this.load++ : this.load--
        this.load = (this.load < 0) ? 0 : this.load

        if (this.load === 0) {
            if (this.node) this.node.style.cursor = ""
        } else {
            if (this.node) this.node.style.cursor = "progress"
        }
    }
    focus() {
        if (this.wndw) {
            this.wndw.focus(true)
            this.wndw.statNode()
            this.wndw.node.dispatchEvent(eventFocus)
        }
    }
    unfocus() {
        if (this.wndw) {
            this.wndw.focus(false)
            this.wndw.node.dispatchEvent(eventDfocus)
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

function task(id) {
    let find = sys.taskArr.filter(task => task.id === id)
    return find[0]
}

function endTask(taskid) {
    task(taskid).end()
}

function deleteSelectedNodes(pocket){
    for(icon of pocket){
        let getFile = at(icon.file)

        icon.deleteNode()

        //delete from filesystem
        getFile.delete()
    }
}

const system = new Task("system", false, null, null, "sys")
sys.taskArr.push(system)

system.mem.lau = {}
system.mem.var.dragging = false
system.mem.var.shSelect = true
system.mem.var.envfocus = {}
system.mem.focus = function (env) {
    if (env != system.mem.var.envfocus){
        if (system.mem.var.envfocus.mem) system.mem.var.envfocus.unfocus()
        system.mem.var.envfocus = env
        system.mem.var.envfocus.focus()
    }
}