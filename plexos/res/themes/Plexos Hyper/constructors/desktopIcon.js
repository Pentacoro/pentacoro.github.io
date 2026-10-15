export default function constructDesktopIcon(icon, { grid, layer }) {
    const node = document.createElement("div")
    node.setAttribute("class", "icon")
    node.setAttribute("title", icon.name)
    node.setAttribute("id", "Icon: " + icon.name)
    if (icon.coords) {
        node.setAttribute("style",
            "left:" + icon.coords.px + "px;" +
            "top:" + icon.coords.py + "px;" +
            "width:" + grid.width + "px;" +
            "height:" + grid.height + "px;"
        )
    }

    const frame = document.createElement("div")
    frame.setAttribute("class", "iconFrame")
    const square = document.createElement("div")
    square.setAttribute("class", "iconSquare")
    const art = document.createElement("div")
    art.setAttribute("class", "iconArt")
    const image = document.createElement("img")
    image.setAttribute("class", "iconImage")
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

    const text = document.createElement("h3")
    text.appendChild(document.createTextNode(icon.name))
    node.appendChild(text)

    layer.appendChild(node)
    icon.node = node
    icon.keyNodes = { frame, square, art, image, layers, front, stickers, text }
    return node
}
