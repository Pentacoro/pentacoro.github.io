export default function constructExplorerIcon(icon, { taskId, list }) {
    const node = document.createElement("div")
    node.setAttribute("class", "explorerIcon " + taskId)
    node.setAttribute("title", icon.name)

    const frame = document.createElement("div")
    frame.setAttribute("class", "iconFrame")
    const square = document.createElement("div")
    square.setAttribute("class", "iconSquare")
    const art = document.createElement("div")
    art.setAttribute("class", "iconArt")
    const image = document.createElement("img")
    image.setAttribute("class", "explorerIconImage iconImage " + taskId)
    image.setAttribute("src", icon.main().getImage())
    const layers = document.createElement("div")
    layers.setAttribute("class", "iconLayers")
    const front = document.createElement("img")
    front.setAttribute("class", "iconFront")
    front.draggable = false
    const stickers = document.createElement("div")
    stickers.setAttribute("class", "iconStickers")
    art.append(image, layers, front, stickers)
    square.append(art)
    frame.append(square)
    node.append(frame)

    const text = document.createElement("span")
    text.setAttribute("class", "explorerIconText " + taskId)
    text.appendChild(document.createTextNode(icon.name))
    node.appendChild(text)

    // Filled by the app; each view's CSS decides which of them show
    const date = document.createElement("span")
    date.setAttribute("class", "iconDetail iconDate")
    const type = document.createElement("span")
    type.setAttribute("class", "iconDetail iconType")
    const size = document.createElement("span")
    size.setAttribute("class", "iconDetail iconSize")
    node.append(date, type, size)

    list.appendChild(node)
    icon.node = node
    icon.keyNodes = { frame, square, art, image, layers, front, stickers, text, date, type, size }
    return node
}
