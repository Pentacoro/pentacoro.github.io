import plexos from "/boot/plexos.js"

export function themeName() {
    if (plexos.Theme?.face === "landing") {
        const name = plexos.Config?.theme
        if (!name || name === "default") return "Plexos Hyper"
        return name
    }
    return plexos.Settings?.system?.theme || "Plexos Hyper"
}

export function themeRoot() {
    return `/plexos/res/themes/${themeName()}`
}

export function themeConstruct(kind, ...args) {
    const constructor = plexos.Theme?.constructors?.[kind]
    if (typeof constructor === "function") return constructor(...args)
    if (constructor && typeof constructor === "object") return constructor
    throw new Error(`Theme constructor '${kind}' is not loaded`)
}

export function applyThemeFavicon() {
    const link = document.querySelector("link[rel='icon']")
    if (link) link.href = `${themeRoot()}/icons/plexos/Plexos 4.png`
}

export async function loadThemeConstructors() {
    const root = themeRoot()
    const face = plexos.Theme?.face || "session"
    const kinds = ["window", "contextMenu", "desktopIcon", "explorerIcon", "dragShip", "controls"]
    const constructors = {}
    for (const kind of kinds) {
        constructors[kind] = (await import(`${root}/constructors/${kind}.js`)).default
    }
    plexos.Theme = {
        name: themeName(),
        root,
        constructors,
        schemes: null,
        colorScheme: null,
        face,
    }
    try {
        plexos.Theme.schemes = (await import(`${root}/schemes.js`)).default
    } catch { /* this theme has no color schemes */ }
    return plexos.Theme
}

export function resolveColorScheme(name) {
    const schemes = plexos.Theme?.schemes
    if (!schemes?.list?.length) return null
    const stored = plexos.Theme?.face === "landing"
        ? plexos.Config?.colorScheme
        : plexos.Settings?.system?.colorScheme
    const wanted = name || stored || schemes.default
    return schemes.list.find(scheme => scheme.name === wanted) || schemes.list.find(scheme => scheme.name === schemes.default) || schemes.list[0]
}

export function applyColorScheme(name) {
    const chosen = resolveColorScheme(name)
    if (!chosen) return null
    const face = plexos.Theme?.face || "session"
    if (face === "landing") {
        if (plexos.Config && plexos.Config.colorScheme !== chosen.name) {
            plexos.Config.colorScheme = chosen.name
            plexos.db.setConfig(plexos.Config)
        }
    } else if (plexos.Settings?.system && plexos.Settings.system.colorScheme !== chosen.name) {
        plexos.Settings.system.colorScheme = chosen.name
        import("/plexos/ini/init.js").then(mod => mod.writeSettingsFile())
    }
    plexos.Theme.colorScheme = chosen.name
    let link = document.getElementById("theme-scheme")
    if (!link) {
        link = document.createElement("link")
        link.id = "theme-scheme"
        link.rel = "stylesheet"
        document.head.appendChild(link)
    }
    link.href = `${themeRoot()}/${chosen.file}`
    document.head.appendChild(link)
    return chosen.name
}

function loadFaceStylesheet(file) {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = `${themeRoot()}/${file}`
    link.dataset.themeFace = plexos.Theme.face
    document.head.appendChild(link)
    return new Promise(resolve => {
        link.onload = () => resolve()
        link.onerror = () => resolve()
    })
}

// One face at a time. Landing is the theme's landing/ sheet. Session is the desktop kit.
export async function applyThemeFace(face) {
    plexos.Theme = plexos.Theme || {}
    plexos.Theme.face = face
    const name = themeName()
    if (!plexos.Theme.constructors || plexos.Theme.name !== name) {
        await loadThemeConstructors()
    }
    plexos.Theme.face = face

    document.querySelectorAll("link[data-theme-face]").forEach(node => node.remove())
    const themeLayer = document.getElementById("themeLayer")
    if (themeLayer) themeLayer.replaceChildren()

    if (face === "landing") {
        await loadFaceStylesheet("landing/landing.css")
    } else {
        const {displayComponent} = await import("/plexos/lib/functions/dll.js")
        const {default: Task} = await import("/plexos/lib/classes/system/task.js")
        const task = Task.get("Theme Manager")
        await displayComponent({
            url: "/plexos/app/sys/Theme Manager/themeManager.html",
            taskid: task.id,
            container: themeLayer,
        })
    }

    const stored = face === "landing" ? plexos.Config?.colorScheme : plexos.Settings?.system?.colorScheme
    applyColorScheme(stored)
    applyThemeFavicon()
    return plexos.Theme
}
