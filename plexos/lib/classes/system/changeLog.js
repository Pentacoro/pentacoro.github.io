import File from "../../classes/filesystem/file.js"

export default class CoreChangeLog {
    constructor() {
        this.operations = []  // Raw operations in user-executed order
    }

    addChange(type, path, oldPath = null) {
        this.operations.push({ type, path, oldPath })
    }

    getCommitPlan() {
        const fileHistories = new Map() // path -> Array<operation>

        // 1. Group operations by final path (after renames)
        for (const op of this.operations) {
            const targetPath = this.traceFinalPath(op.path)
            if (!fileHistories.has(targetPath)) {
                fileHistories.set(targetPath, [])
            }
            fileHistories.get(targetPath).push(op)
        }

        // 2. Filter each file's history to only meaningful operations
        const plan = []
        for (const [path, ops] of fileHistories) {
            const filtered = this.filterFileHistory(ops)
            plan.push(...filtered)
        }

        // 3. Sort by original execution order
        return plan.sort((a, b) => a.originalIndex - b.originalIndex)
    }

    traceFinalPath(path) {
        // Follow rename chains to find final path
        let current = path
        for (const op of this.operations) {
            if (op.type === 'repath' && op.oldPath === current) {
                current = op.path
            }
        }  
        return current
    }

    filterFileHistory(ops) {
        const history = []
        let exists = false

        // Replay operations to determine final state
        for (const op of ops) {
            if (op.type === 'create') exists = true
            if (op.type === 'delete') exists = false
            if (op.type === 'repath') continue // Handled by traceFinalPath
            
            if (exists || op.type === 'create') {
                history.push(op)
            }
        }

        return history
    }
}