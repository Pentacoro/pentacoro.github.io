class Task {
    appEnd = null 
    name = null
    inst = null
    node = null
    from = null 
    id = null
    constructor(p) {
        this.name = p.name
        this.apps = p.apps
        this.from = p.from || this.from

        this.inst = (p.inst===null) ? true : p.inst
        this.node = p.node || this.node

        this.load = 0
        this.pocket = []

        this.mem = {
            var: {} 
        }
        this.id = (p.id !== null) ? p.id : genRanHex(16)
        checkUniqueID(this)
        
        //end task
        this.appEnd = p.appEnd || null
    }
    end () {
        if (this.appEnd) this.appEnd()

        //delete style tags
        for (let styleTag of document.head.getElementsByClassName("ID_"+this.id)) {
            styleTag.parentElement.removeChild(styleTag)
        }
        //close window
        if (document.getElementsByClassName("ID_"+this.id).length > 0) {
            sys.wndwArr[parseInt(document.getElementsByClassName("ID_"+this.id)[0].id.match(/(\d+)/)[0])].deleteNode()
        }
        sys.taskArr = sys.taskArr.remove(system.mem.task(this.id))
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
        window.getSelection().removeAllRanges()
        if (this.wndw) {
            this.wndw.focus(true)
            this.wndw.statNode()
            //restore select ranges
			let taskRange = this.mem.selectionRange
			if (taskRange && taskRange.commonAncestorContainer instanceof HTMLElement) {
				taskRange.commonAncestorContainer.focus()
				//selectRange(taskRange)
			} else {
				taskRange = null
			}
        }
        if (this.node) this.node.focus()
        if (this.node?.onfocus) this.node.onfocus()
    }
    blur() {
        if (this.wndw) {
            //store select ranges
			if (window.getSelection().rangeCount) {
				this.mem.selectionRange = window.getSelection().getRangeAt(0).cloneRange()
			}
			if (this.mem.selectionRange && this.mem.selectionRange.commonAncestorContainer instanceof HTMLElement) {
				this.mem.selectionRange.commonAncestorContainer.blur()
				//selectRange(taskRange)
			}
            this.wndw.focus(false)
			this.node.blur()
            if (this.node?.onblur) this.node.onblur()
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
        if (sys.taskArr[i].inst === false && sys.taskArr[i].name === appName) return false
    }
    return true
}

function openInstance(appName){
    for (i = 0; i < sys.taskArr.length; i++){
        if (sys.taskArr[i].name === appName) return sys.taskArr[i]
    }
    return null
}

function endTask(taskid) {
    system.mem.task(taskid).end()
}

function deleteSelectedNodes(pocket){
    for(icon of pocket){
        icon.deleteNode()
        //delete from filesystem
        if(at(icon.file)!=undefined) at(icon.file).delete()
    }
}

const system = new Task(
    {
		name : "system",
		inst : false,
		appEnd : null,
		node : null,
		from : "sys"
	}
)
sys.taskArr.push(system)

system.mem.lau = {}
system.mem.var.dragging = false
system.mem.var.shSelect = true
system.mem.var.envfocus = null
system.mem.focus = function (env) {
    if (system.mem.var.envfocus && env != system.mem.var.envfocus){
        system.mem.var.envfocus.blur()
    }
    system.mem.var.envfocus = env
    system.mem.var.envfocus.focus()
}
system.mem.task = function(id) {
    let find = sys.taskArr.filter(task => task.id === id)
    return find[0]
}