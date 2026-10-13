export default function constructExplorerIcon(icon, { taskId, list }) {
    const node = document.createElement("div")
    node.setAttribute("class", "explorerIcon " + taskId)
    node.setAttribute("title", icon.name)

    const image = document.createElement("img")
    image.setAttribute("class", "explorerIconImage " + taskId)
    image.setAttribute("src", icon.main().getImage())
    node.appendChild(image)

    const text = document.createElement("span")
    text.setAttribute("class", "explorerIconText " + taskId)
    text.appendChild(document.createTextNode(icon.name))
    node.appendChild(text)

    list.appendChild(node)
    icon.node = node
    icon.keyNodes = { image, text }
    return node
}
