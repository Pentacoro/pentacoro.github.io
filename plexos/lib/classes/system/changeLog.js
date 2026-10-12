import plexos from "../../../ini/system.js"
import File from "../filesystem/file.js"

export default class CoreChangeLog {
    constructor() {
        this.operations = []
        this.explorerCursor = -1 // Explorer undo/redo share one cursor over explorer-authored ops
    }

    explorerAppID() {
        return plexos.Core.registry?.tryGetAppID("Explorer")
    }

    explorerOps() {
        const appID = this.explorerAppID()
        if (!appID) return []
        return this.operations
            .map((op, index) => ({ op, index }))
            .filter(({ op }) => op.author?.appID === appID && !op.fromHistory)
    }

    append(entry) {
        const record = {
            id: entry.id || crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            type: entry.type,
            path: entry.path,
            oldPath: entry.oldPath || null,
            before: entry.before ?? null,
            after: entry.after ?? null,
            timestamp: entry.timestamp || Date.now(),
            author: entry.author || {},
            committed: false,
            fromHistory: !!entry.fromHistory,
        }

        if (record.author.appID && record.author.appID === this.explorerAppID() && !record.fromHistory) {
            const ops = this.explorerOps()
            if (this.explorerCursor >= 0 && this.explorerCursor < ops.length - 1) {
                const lastKeepIndex = ops[this.explorerCursor].index
                this.operations = this.operations.filter((op, i) => {
                    if (op.author?.appID !== record.author.appID || op.fromHistory) return true
                    return i <= lastKeepIndex
                })
            }
        }

        this.operations.push(record)

        if (record.author.appID === this.explorerAppID() && !record.fromHistory) {
            this.explorerCursor = this.explorerOps().length - 1
        }
        return record
    }

    pending() {
        return this.operations.filter(op => !op.committed && !op.fromHistory)
    }

    // Incremental IDB save: rename/move become repath; overlapping paths go through a temp name first.
    getCommitPlan() {
        const source = this.pending().map(op => {
            if (op.type === "rename" || op.type === "move") {
                return { ...op, type: "repath", oldPath: op.oldPath, path: op.path }
            }
            return { ...op }
        })
        const conflicts = this.detectRenameConflicts(source)
        if (conflicts.size > 0) {
            return this.withTempPaths(source, conflicts)
        }
        return source
    }

    detectRenameConflicts(operations = this.pending()) {
        const conflictSet = new Set()
        const finalPaths = new Map()

        for (const op of operations) {
            if (op.type === "repath") {
                finalPaths.set(op.oldPath, op.path)
            }
        }

        for (const op of operations) {
            if (op.type === "repath") {
                const sourceFinal = this.traceFinalPath(op.oldPath, this.buildPathMap(operations))
                const targetFinal = this.traceFinalPath(op.path, this.buildPathMap(operations))
                if (sourceFinal !== targetFinal) {
                    conflictSet.add(sourceFinal)
                    conflictSet.add(targetFinal)
                }
            }
        }

        return conflictSet
    }

    withTempPaths(operations, conflicts) {
        const tempMap = new Map()
        const plan = []

        for (const op of operations) {
            const finalPath = this.traceFinalPath(op.path, this.buildPathMap(operations))
            if (conflicts.has(finalPath) && !tempMap.has(finalPath)) {
                tempMap.set(finalPath, this.generateTempPath(finalPath))
            }
        }

        for (const op of operations) {
            const finalPath = this.traceFinalPath(op.path, this.buildPathMap(operations))
            const tempPath = tempMap.get(finalPath)
            if (tempPath) {
                plan.push({ ...op, tempPath, finalPath })
            } else {
                plan.push(op)
            }
        }

        for (const [finalPath, tempPath] of tempMap) {
            plan.push({
                type: "repath",
                path: finalPath,
                oldPath: tempPath,
                isFinalRename: true,
            })
        }

        return plan
    }

    traceFinalPath(startPath, pathMap = this.buildPathMap()) {
        let current = startPath
        const seen = new Set()
        while (pathMap.has(current) && !seen.has(current)) {
            seen.add(current)
            current = pathMap.get(current)
        }
        return current
    }

    buildPathMap(operations = this.pending()) {
        const map = new Map()
        for (const op of operations) {
            if (op.type === "repath" || op.type === "rename" || op.type === "move") {
                if (op.oldPath) map.set(op.oldPath, op.path)
            }
        }
        return map
    }

    generateTempPath(originalPath) {
        return `${originalPath}.tmp.${Math.random().toString(36).slice(2, 9)}`
    }

    markCommitted(ops = this.pending()) {
        const ids = new Set(ops.map(op => op.id))
        for (const op of this.operations) {
            if (ids.has(op.id)) op.committed = true
        }
    }

    async undoExplorer() { // fromHistory so Command.run does not log the inverse again
        const ops = this.explorerOps()
        if (this.explorerCursor < 0 || !ops[this.explorerCursor]) return false
        const { op } = ops[this.explorerCursor]
        await this.applyInverse(op)
        this.explorerCursor -= 1
        return true
    }

    async redoExplorer() {
        const ops = this.explorerOps()
        const next = this.explorerCursor + 1
        if (!ops[next]) return false
        await this.applyForward(ops[next].op)
        this.explorerCursor = next
        return true
    }

    async applyInverse(op) {
        switch (op.type) {
            case "create":
                if (op.path) File.delete({ path: op.path, fromHistory: true })
                break
            case "delete":
                if (op.before) await File.restoreSerialized(op.before, op.path)
                break
            case "rename":
                File.rename({ path: op.path, rename: File.basename(op.oldPath), fromHistory: true })
                break
            case "move":
                File.move({ path: op.path, to: File.dirname(op.oldPath), fromHistory: true })
                break
            case "write":
            case "modify":
                if (op.before) File.writeSerialized(op.path, op.before)
                break
        }
        File.refreshViews()
    }

    async applyForward(op) {
        switch (op.type) {
            case "create":
                if (op.after) await File.restoreSerialized(op.after, op.path)
                break
            case "delete":
                if (op.path) File.delete({ path: op.path, fromHistory: true })
                break
            case "rename":
                File.rename({ path: op.oldPath, rename: File.basename(op.path), fromHistory: true })
                break
            case "move":
                File.move({ path: op.oldPath, to: File.dirname(op.path), fromHistory: true })
                break
            case "write":
            case "modify":
                if (op.after) File.writeSerialized(op.path, op.after)
                break
        }
        File.refreshViews()
    }
}
