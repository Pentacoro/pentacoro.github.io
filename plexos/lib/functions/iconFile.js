const renderModes = new Set(["auto", "pixelated", "smooth"])
const cache = new Map()

export function isIconFile(url) {
    if (typeof url !== "string" || !url) return false
    return url.split(/[?#]/)[0].toLowerCase().endsWith(".icon")
}

export function resolveIconRef(base, ref) {
    if (!ref || typeof ref !== "string") return ""
    if (/^(https?:|data:|blob:)/i.test(ref) || ref.startsWith("/")) return ref
    try {
        return new URL(ref, new URL(base, window.location.href)).href
    } catch {
        return ref
    }
}

function readRender(value) {
    return renderModes.has(value) ? value : undefined
}

export function parseIconFile(data, base = "") {
    if (!data || typeof data !== "object" || Array.isArray(data)) return null
    const image = typeof data.image === "string" && data.image ? resolveIconRef(base, data.image) : ""
    const layers = Array.isArray(data.layers)
        ? data.layers.filter(item => item && typeof item.url === "string" && item.url).map(item => ({
            ...item,
            url: resolveIconRef(base, item.url),
        }))
        : undefined
    const stickers = {}
    if (data.stickers && typeof data.stickers === "object" && !Array.isArray(data.stickers)) {
        for (const [slot, value] of Object.entries(data.stickers)) {
            if (typeof value === "string" && value) stickers[slot] = { url: resolveIconRef(base, value), render: "auto" }
            else if (value && typeof value.url === "string" && value.url) {
                stickers[slot] = { url: resolveIconRef(base, value.url), render: readRender(value.render) || "auto" }
            }
        }
    }
    const sizes = {}
    if (data.sizes && typeof data.sizes === "object" && !Array.isArray(data.sizes)) {
        for (const [px, url] of Object.entries(data.sizes)) {
            if (typeof url === "string" && url) sizes[px] = resolveIconRef(base, url)
        }
    }
    return {
        image,
        render: readRender(data.render) || "auto",
        sizes,
        stickers,
        layers,
        layered: data.layered === true || data.layered === false ? data.layered : undefined,
    }
}

export function cachedIconFile(url) {
    return cache.get(url) || null
}

export async function loadIconFile(url) {
    if (cache.has(url)) return cache.get(url)
    const response = await fetch(url)
    if (!response.ok) return null
    const doc = parseIconFile(await response.json(), url)
    if (doc) cache.set(url, doc)
    return doc
}

export function adoptIconFile(icon, doc) {
    if (!icon || !doc) return
    icon.render = doc.render || "auto"
    icon.sizes = doc.sizes || {}
    icon.stickers = doc.stickers || {}
    if (Array.isArray(doc.layers)) icon.layers = doc.layers
    else delete icon.layers
    icon.layered = doc.layered === true
}

export function iconFileFromData(raw, base = "") {
    try {
        const data = typeof raw === "string" ? JSON.parse(raw) : raw
        return parseIconFile(data, base)
    } catch {
        return null
    }
}
