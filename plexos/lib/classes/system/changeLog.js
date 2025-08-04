import File from "../../classes/filesystem/file.js"

export default class ChangeLog {
    constructor() {
        this.stack = []
        this.pointer = -1
        this.pathMap = new Map() // Tracks final paths: { originalPath -> currentPath }
    }

    addDirtyChange(change={
            type:"",            // 'create', 'delete', or 'update'
            path:"",            // File/folder path
            dir:"",             // Parent folder
            snap:"",            // Snapshot for undo
            app:"",             // Application that made the change
            args:{},            // Additionals (particular undo/redo logic)
            isCommitted:false   // Saved to IndexedDB?
    }) {
        this.stack = this.stack.slice(0, this.pointer + 1);

        // Update path mapping for repaths
        if (change.type === 'repath') {
            const effectiveOldPath = this.pathMap.get(change.args.oldPath) || change.args.oldPath
            this.pathMap.set(effectiveOldPath, change.path)
        }

        this.stack.push(change)
        this.pointer++
    }

    markChangesAsCommitted() {
        this.stack.forEach(change => {
            change.isCommitted = true
        })
    }

    undo() {
        if (this.pointer < 0) return null
        const change = this.stack[this.pointer]
        return change.isCommitted ? 
        this._handleCommittedUndo(change) : 
        this._createInverseChange(change)
    }

    redo() {
        if (this.pointer >= this.stack.length - 1) return null
        return this.stack[++this.pointer]
    }

    _handleCommittedUndo(change) {
        const compensatingChange = {
            type:this._getInverseType(change.type),
            path:change.path,
            dir:change.dir,
            snap:_loadCurrentState(change.path),
            from:change.from,
            args:change.args,
            isCommited:false
        }
        this.stack.splice(this.pointer + 1, 0, compensatingChange)
        this.pointer++;
        return compensatingChange
    }

    _createInverseChange(change) {
        return new Change({
            type:this._getInverseType(change.type),
            path:change.path,
            dir:change.dir,
            snap:change.snap,
            from:change.from,
            args:change.args,
            isCommited:change.isCommitted
        })
    }

    _getInverseType(type) {
        return { 
            create: 'delete',
            delete: 'create', 
            update: 'update',
            repath: 'repath'
        }[type]
    }

    _loadCurrentState(path) {
       // Implement based on your system
       console.log(path)
       return JSON.parse(JSON.stringify(File.at(path)))
    }
}