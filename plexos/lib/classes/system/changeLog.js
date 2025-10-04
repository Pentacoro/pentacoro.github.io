import File from "../../classes/filesystem/file.js"

export default class CoreChangeLog {
    constructor() {
        this.operations = []
    }

    addChange(type, path, oldPath = null) {
        this.operations.push({ type, path, oldPath })
    }

    getCommitPlan() {
        const conflicts = this.detectRenameConflicts()
        
        if (conflicts.size > 0) {
            return this.withTempPaths(conflicts)
        } else {
            return this.rawOperations()
        }
    }

    detectRenameConflicts() {
        const conflictSet = new Set()
        const finalPaths = new Map() // originalPath -> finalPath
        
        // First pass: trace all final paths
        for (const op of this.operations) {
            if (op.type === 'repath') {
                finalPaths.set(op.oldPath, op.path)
            }
        }

        // Second pass: detect conflicts
        for (const op of this.operations) {
            if (op.type === 'repath') {
                const sourceFinal = this.traceFinalPath(op.oldPath, finalPaths)
                const targetFinal = this.traceFinalPath(op.path, finalPaths)
                
                // Conflict if: A→B and C→B (two files targeting same path)
                if (sourceFinal !== targetFinal) {
                    conflictSet.add(sourceFinal)
                    conflictSet.add(targetFinal)
                }
            }
        }

        return conflictSet
    }

    withTempPaths(conflicts) {
        const tempMap = new Map() // finalPath -> tempPath
        const plan = []

        // Assign temp paths to conflicting files
        for (const op of this.operations) {
            const finalPath = this.traceFinalPath(op.path)
            if (conflicts.has(finalPath) && !tempMap.has(finalPath)) {
                tempMap.set(finalPath, this.generateTempPath(finalPath))
            }
        }

        // Convert operations to use temp paths
        for (const op of this.operations) {
            const finalPath = this.traceFinalPath(op.path)
            const tempPath = tempMap.get(finalPath)
            
            if (tempPath) {
                plan.push({ ...op, tempPath, finalPath })
            } else {
                plan.push(op) // Non-conflicting, use as-is
            }
        }

        // Add final rename operations
        for (const [finalPath, tempPath] of tempMap) {
            plan.push({ 
                type: 'repath', 
                path: finalPath, 
                oldPath: tempPath,
                isFinalRename: true 
            })
        }

        return plan
    }

    rawOperations() {
        return [...this.operations] // No conflicts, direct execution
    }

    // Helper methods
    traceFinalPath(startPath, pathMap = this.buildPathMap()) {
        let current = startPath
        while (pathMap.has(current)) {
            current = pathMap.get(current)
        }
        return current
    }

    buildPathMap() {
        const map = new Map()
        for (const op of this.operations) {
            if (op.type === 'repath') {
                map.set(op.oldPath, op.path)
            }
        }
        return map
    }

    generateTempPath(originalPath) {
        return `${originalPath}.tmp.${Math.random().toString(36).slice(2, 9)}`
    }
}