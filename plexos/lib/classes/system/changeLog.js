import plexos from "../../../../boot/plexos.js"
import File from "../filesystem/file.js"

export default class CoreChangeLog {
    constructor() {
        this.operations = []
        this.cursor = -1 // the user's undo/redo position among their own steps
    }

    // A user step: a change the user made to files from Explorer or the Desktop (Command.authorFor sets author.user),
    // not an undo or redo replaying one (those are logged as undoable: false so they still get saved)
    isUserStep(op) {
        return !!op.author?.user && !op.fromHistory && op.undoable !== false
    }

    userOps() {
        return this.operations
            .map((op, index) => ({ op, index }))
            .filter(({ op }) => this.isUserStep(op))
    }

    // The user's steps, oldest first. Changes sharing a group (one decision: deleting several files, one transfer)
    // are a single step; a change without one is a step of its own
    userSteps() {
        const steps = []
        for (const entry of this.userOps()) {
            const last = steps[steps.length - 1]
            if (last && entry.op.group && last[0].op.group === entry.op.group) last.push(entry)
            else steps.push([entry])
        }
        return steps
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
            undoable: entry.undoable !== false, // replays and permanent deletes from the bin are saved, never undone
            group: entry.group || null,
            wrapper: entry.wrapper || null, // a move into the bin: its wrapper (when, where from, desktop place)
        }

        // A new step after some undos drops the steps that could have been redone. A change joining the step
        // being built (same group, at the end) isn't a new step
        if (this.isUserStep(record)) {
            const steps = this.userSteps()
            const joins = record.group && steps.length && this.cursor === steps.length - 1 && steps[steps.length - 1][0].op.group === record.group
            if (!joins && this.cursor < steps.length - 1) {
                const dropped = new Set(steps.slice(this.cursor + 1).flat().map(({ index }) => index))
                this.operations = this.operations.filter((op, i) => !dropped.has(i))
            }
        }

        this.operations.push(record)

        if (this.isUserStep(record)) this.cursor = this.userSteps().length - 1
        if (!record.fromHistory) {
            queueMicrotask(() => {
                if (plexos.Core?.mem?.booting || plexos.Core?.mem?.readOnly) return
                plexos.Core?.mem?.saveCore?.()
            })
        }
        return record
    }

    pending() {
        return this.operations.filter(op => !op.committed && !op.fromHistory)
    }

    // Incremental IDB save: rename/move become repath; overlapping paths go through a temp name first.
    getCommitPlan(operations = this.pending()) {
        const source = operations.map(op => {
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

    // Undo and redo replay a step as System commands marked replay: logged and saved like any change, but not
    // steps themselves, so they never stack. Every Explorer window and the Desktop share this one history.
    async undo() {
        const steps = this.userSteps()
        if (this.cursor < 0 || !steps[this.cursor]) return false
        const step = steps[this.cursor].map(({ op }) => op)
        this.cursor -= 1
        // later changes first. What went to the bin comes back as one transfer per folder it left
        const restores = new Map()
        for (const op of [...step].reverse()) {
            if (op.type === "move" && File.inBin(op.path)) {
                const folder = File.dirname(op.oldPath)
                if (!restores.has(folder)) restores.set(folder, [])
                restores.get(folder).push(op.path)
            } else {
                await this.applyInverse(op)
            }
        }
        if (restores.size) {
            const { moveFiles } = await import("/plexos/app/sys/System/File Management/move.js")
            await Promise.all([...restores].map(([folder, paths]) => moveFiles(paths.reverse(), folder)))
        }
        File.refreshViews()
        return true
    }

    async redo() {
        const steps = this.userSteps()
        const next = this.cursor + 1
        if (!steps[next]) return false
        this.cursor = next
        for (const { op } of steps[next]) await this.applyForward(op)
        File.refreshViews()
        return true
    }

    replay(command, args) {
        return plexos.System.cmd(command, { ...args, replay: true })
    }

    async applyInverse(op) {
        switch (op.type) {
            case "create":
                if (op.path) await this.replay("file.delete", { path: op.path })
                break
            case "delete":
                if (op.before) await this.replay("file.restore", { serialized: op.before, path: op.path })
                break
            case "rename":
                await this.replay("file.rename", { path: op.path, rename: File.basename(op.oldPath) })
                break
            case "move":
                // Out of the bin is a restore: a transfer, so a name taken meanwhile gets the conflict dialog
                if (File.inBin(op.path)) {
                    const { moveFiles } = await import("/plexos/app/sys/System/File Management/move.js")
                    await moveFiles([op.path], File.dirname(op.oldPath))
                    break
                }
                await this.replay("file.move", { path: op.path, to: File.dirname(op.oldPath) })
                break
            case "write":
            case "modify":
                if (op.before) await this.replay("file.write", { path: op.path, data: op.before[File.payloadKey(op.before.cfg?.class || "StringFile")] })
                break
        }
    }

    async applyForward(op) {
        switch (op.type) {
            case "create":
                if (op.after) await this.replay("file.restore", { serialized: op.after, path: op.path })
                break
            case "delete":
                if (op.path) await this.replay("file.delete", { path: op.path })
                break
            case "rename":
                await this.replay("file.rename", { path: op.oldPath, rename: File.basename(op.path) })
                break
            case "move": {
                const moved = await this.replay("file.move", { path: op.oldPath, to: File.dirname(op.path), place: op.wrapper?.place })
                // back into the bin it gets a new id, which a later undo needs to find it
                if (moved && File.inBin(op.path)) op.path = moved.cfg.path
                break
            }
            case "write":
            case "modify":
                if (op.after) await this.replay("file.write", { path: op.path, data: op.after[File.payloadKey(op.after.cfg?.class || "StringFile")] })
                break
        }
    }
}
