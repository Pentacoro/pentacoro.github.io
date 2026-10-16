let plexos = {
    User: "",
    System: {},
    Config: {},
    Tasks: [],
    Proxy: {},
    Settings: null,
    Boot: {},
    db: {}
}
export default plexos

//plexos.sfx.push(new Audio("plexos/res/sounds/Norrum - Interfaz Startup 2 v1.mp3"))

plexos.db.open = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('Plexos', 1)

        request.onupgradeneeded = (event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains('Users')) {
                db.createObjectStore('Users', { keyPath: 'name' }) // Use `name` as the unique key
            }
            if (!db.objectStoreNames.contains('Config')) {
                db.createObjectStore('Config')
            }
        }

        request.onsuccess = (event) => resolve(event.target.result)
        request.onerror = (event) => reject(event.target.error)
    })
}
plexos.db.getConfig = async () => {
    const db = await plexos.db.open()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction('Config', 'readonly')
        const store = transaction.objectStore('Config')

        const request = store.get("config")

        request.onsuccess = () => {
            if (request.result) {
                resolve(request.result)
            } else {
                reject(`Config not found`)
            }
        }

        request.onerror = (event) => reject(event.target.error)
    })
}
plexos.db.txnDone = (transaction) => {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error)
    })
}
plexos.db.setConfig = async(config) => {
    const db = await plexos.db.open()
    const transaction = db.transaction("Config", "readwrite")
    transaction.objectStore("Config").put(config, "config")
    await plexos.db.txnDone(transaction)
    console.log("Config saved!")
}
plexos.db.addUser = async (user) => {
    const db = await plexos.db.open()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction('Users', 'readwrite')
        const store = transaction.objectStore('Users')

        const request = store.put(user) // `put` will add or overwrite the user

        request.onsuccess = () => resolve(`User ${user.name} added/updated successfully`)
        request.onerror = (event) => reject(event.target.error)
    })
}
plexos.db.getUser = async (name) => {
    const db = await plexos.db.open()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction('Users', 'readonly')
        const store = transaction.objectStore('Users')

        const request = store.get(name)

        request.onsuccess = () => {
            if (request.result) {
                resolve(request.result)
            } else {
                reject(`User ${name} not found`)
            }
        }

        request.onerror = (event) => reject(event.target.error)
    })
}
plexos.db.saveUser = async (user) => {
    const db = await plexos.db.open()
    const transaction = db.transaction("Users", "readwrite")
    const store = transaction.objectStore("Users")
    store.put(user)
    await plexos.db.txnDone(transaction)
    console.log("User saved!")
}
plexos.db.listUsers = async () => {
    const db = await plexos.db.open()
    return new Promise((resolve, reject) => {
        const request = db.transaction("Users", "readonly").objectStore("Users").getAll()
        request.onsuccess = () => resolve(request.result || [])
        request.onerror = () => reject(request.error)
    })
}
plexos.db.deleteUser = async (name) => {
    const db = await plexos.db.open()
    const transaction = db.transaction("Users", "readwrite")
    transaction.objectStore("Users").delete(name)
    await plexos.db.txnDone(transaction)
}

// The bin (a folder whose dir is an array) holds wrappers found by id, not files found by name
function takeFrom(parent, name) {
    if (Array.isArray(parent.dir)) {
        const at = parent.dir.findIndex(entry => entry.id === name)
        return at < 0 ? undefined : parent.dir.splice(at, 1)[0].file
    }
    const node = parent.dir[name]
    delete parent.dir[name]
    return node
}
function putInto(parent, name, node, wrapper = {}) {
    if (!Array.isArray(parent.dir)) {
        parent.dir[name] = node
        return
    }
    const existing = parent.dir.find(entry => entry.id === name)
    if (existing) existing.file = node
    else parent.dir.push({ id: name, recycled: wrapper.recycled, from: wrapper.from, place: wrapper.place, file: node })
}

plexos.db.applyCorePlan = (stored, plan, File) => {
    for (const op of plan) {
        const type = op.type
        if (type === "create" || type === "write" || type === "modify") {
            const parent = File.walk(stored, File.dirname(op.path))
            if (parent?.dir && op.after) putInto(parent, File.basename(op.path), op.after)
        } else if (type === "delete") {
            const parent = File.walk(stored, File.dirname(op.path))
            if (parent?.dir) takeFrom(parent, File.basename(op.path))
        } else if (type === "repath") {
            const fromParent = File.walk(stored, File.dirname(op.oldPath))
            const toParent = File.walk(stored, File.dirname(op.path))
            if (!fromParent?.dir) continue
            const node = takeFrom(fromParent, File.basename(op.oldPath))
            // a move into the bin carries its wrapper (when, where from, desktop place); older logs only the basics
            const wrapper = op.wrapper || { recycled: op.timestamp, from: File.dirname(op.oldPath) }
            if (toParent?.dir) putInto(toParent, File.basename(op.path), op.after || node, wrapper)
        }
    }
}

plexos.db.saveCore = async (core) => {
    // Remote cores stay read-only: nothing is written back to IndexedDB.
    if (plexos.Core?.mem?.readOnly) return
    if (!plexos.System?.user) return
    // Capture before the import await, so a change that lands mid-save stays for the next flush.
    const pending = plexos.Core.changeLog.pending()
    if (!pending.length) return
    const name = core.name || "core"
    const File = (await import("../plexos/lib/classes/filesystem/file.js")).default
    const user = plexos.System.user
    const existing = user.localCores.filter(local => local.name === name)
    if (existing.length === 1) {
        const plan = plexos.Core.changeLog.getCommitPlan(pending)
        if (plan.length > 0) plexos.db.applyCorePlan(existing[0], plan, File)
    } else {
        const snapshot = File.serializeNode(core)
        snapshot.name = name
        user.localCores.push(snapshot)
        plexos.System.user.config.lastOpenedCore = name
    }
    plexos.Core.changeLog.markCommitted(pending)
    await plexos.db.saveUser(user)
}