import plexos from "/plexos/ini/system.js"

export function themeName() {
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
    }
    try {
        plexos.Theme.schemes = (await import(`${root}/schemes.js`)).default
    } catch { /* this theme has no color schemes */ }
    return plexos.Theme
}

export function resolveColorScheme(name) {
    const schemes = plexos.Theme?.schemes
    if (!schemes?.list?.length) return null
    const wanted = name || plexos.Settings?.system?.colorScheme || schemes.default
    return schemes.list.find(scheme => scheme.name === wanted) || schemes.list.find(scheme => scheme.name === schemes.default) || schemes.list[0]
}

export function applyColorScheme(name) {
    const chosen = resolveColorScheme(name)
    if (!chosen) return null
    if (plexos.Settings.system.colorScheme !== chosen.name) {
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
    return chosen.name
}
