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

    const image = document.createElement("img")
    image.setAttribute("class", "iconImage")
    image.setAttribute("src", icon.main().getImage())
    const frame = document.createElement("div")
    frame.setAttribute("class", "iconFrame")
    frame.appendChild(image)
    node.appendChild(frame)

    const text = document.createElement("h3")
    text.appendChild(document.createTextNode(icon.name))
    node.appendChild(text)

    layer.appendChild(node)
    icon.node = node
    icon.keyNodes = { frame, image, text }
    return node
}
