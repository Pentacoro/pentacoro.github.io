import cfg from "./config.js"

let plexos = {
    System: {},
    Windows: [],
    Tasks: [],
    Proxy: {},
    cfg: cfg,
    db: {}
}
export {plexos, cfg}

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
plexos.db.setConfig = async(config) => {
    const db = await plexos.db.open()

    db.transaction("Config", "readwrite").objectStore("Config").put(config, "config")

    await db.transaction.complete
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

    await transaction.complete
    console.log("User saved!")
}

plexos.db.saveCore = async (core) => {
    import("../lib/classes/filesystem/file.js")
    let localCore = plexos.System.user.localCores.filter(localCore=>localCore.name === core.name)
    if (localCore.length > 0) {
        for (let change of plexos.Core.changeLog) {
            switch (change.name) {
                case "update":
                    if (plexos.Core.mem.classCompilers[change.file.cfg.class]) {
                        File.at(change.file.cfg.path,"file","localCore")[File.classDefaults(change.file.cfg.class).skeyName] = plexos.Core.mem.classCompilers[change.file.cfg.class]
                    } else {
                        File.at(change.file.cfg.path,"file","localCore")[File.classDefaults(change.file.cfg.class).skeyName] = change.file
                    }
                    break
                case "delete":
                    delete File.at(change.file.cfg.path,"parent","localCore")[change.file.name]
                    break
                case "create":
            }
        }
        plexos.System.user.localCores = plexos.System.user.localCores.filter(core=>localCore.name !== core.name)
        plexos.System.user.localCores.push(core)
    } else {
        plexos.System.user.localCores.push(core)
    }
    await plexos.db.saveUser(plexos.System.user)
}

import("../lib/functions/prototype.js")
import("./events.js")
import("./core.js")