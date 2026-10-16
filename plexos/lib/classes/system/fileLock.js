import plexos from "../../../../boot/plexos.js"

// path -> { token, taskId, appID, app }. A lock covers the file, everything under it,
// and blocks changes to the folders above it, so a held file can't move away underneath its holder.
const locks = new Map()

function under(path, root) {
    return path === root || path.startsWith(root + "/")
}

export default class FileLock {
    // A Task holds with its own id. Anything else (a transfer job) passes its own token.
    static holder(owner) {
        if (!owner) return null
        if (owner.token) return owner
        return {
            token: owner.id,
            taskId: owner.id,
            appID: owner.appID || null,
            app: owner.name || "Unknown application",
        }
    }

    // The lock that stops token from touching path, or null. deep also checks files inside path.
    static blocking(path, token = null, { deep = false } = {}) {
        if (!path) return null
        for (const [locked, lock] of locks) {
            if (lock.token === token) continue
            if (under(path, locked)) return { path: locked, ...lock }
            if (deep && under(locked, path)) return { path: locked, ...lock }
        }
        return null
    }

    static acquire(path, owner) {
        const holder = FileLock.holder(owner)
        if (!path || !holder) return false
        if (FileLock.blocking(path, holder.token, { deep: true })) return false
        locks.set(path, holder)
        return true
    }

    // acquire, or tell the user who has it. For launchers: end the task when this is false.
    static claim(path, task) {
        if (FileLock.acquire(path, task)) return true
        FileLock.deny(FileLock.blocking(path, FileLock.holder(task).token, { deep: true }), path, task)
        return false
    }

    static release(path, owner) {
        const token = typeof owner === "string" ? owner : FileLock.holder(owner)?.token
        if (locks.get(path)?.token === token) locks.delete(path)
    }

    static releaseAll(token) {
        for (const [path, lock] of [...locks]) if (lock.token === token) locks.delete(path)
    }

    // A held file was moved or renamed by its holder. Its lock goes with it.
    static rekey(oldPath, newPath) {
        if (!oldPath || !newPath || oldPath === newPath) return
        for (const [path, lock] of [...locks]) {
            if (!under(path, oldPath)) continue
            locks.delete(path)
            locks.set(newPath + path.slice(oldPath.length), lock)
        }
    }

    static dropUnder(path) {
        for (const locked of [...locks.keys()]) if (under(locked, path)) locks.delete(locked)
    }

    static list() {
        return [...locks].map(([path, lock]) => ({ path, ...lock }))
    }

    // Error popup naming the app that holds the file, with its ids under More details.
    static async deny(lock, path, actor = null) {
        if (!lock) return
        const { runLauncher } = await import("../../functions/dll.js")
        const { themeRoot } = await import("../../functions/theme.js")
        const name = (path || lock.path).split("/").filter(Boolean).pop() || path
        const parent = actor?.window ? actor.id : plexos.System.id
        runLauncher("/plexos/app/sys/System/Popup/popup.ls", {
            name: "File in use",
            type: true,
            title: "File in use",
            description: `"${name}" is being used by ${lock.app}. Close it there, or wait for it to finish, and try again.`,
            image: `${themeRoot()}/icons/interface/forms/error.png`,
            taskid: parent,
            detailsHeight: "96px",
            details: [
                ["app", lock.app],
                ["appID", lock.appID || "none"],
                ["taskId", lock.taskId || "none"],
                ["locked path", lock.path],
                ["requested path", path || lock.path],
            ],
        })
    }
}
