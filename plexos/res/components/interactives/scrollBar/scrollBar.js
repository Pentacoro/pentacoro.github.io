import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let comp = task.getComponent(/COMPID/)
let mem  = comp.mem

mem.isDragging = false

const subject = comp.args.subject
const container = comp.container
const scrollBar = container.getElementsByClassName(`scrollBar`)[0]
const buttonLeft = container.getElementsByClassName(`minus`)[0]
const buttonRight = container.getElementsByClassName(`plus`)[0]
const scrollTrack = container.getElementsByClassName(`scrollTrack`)[0]

scrollBar.onmousedown = (e)=>{
    mem.isDragging = true
    let startX = e.clientX
    let initialScrollLeft = subject.scrollLeft

    document.onmousemove = dragScroll
    function dragScroll(e) {
        const deltaX = e.clientX - startX
        const contentWidth = subject.scrollWidth
        const trackWidth = scrollTrack.offsetWidth
        const scrollDelta = (deltaX / trackWidth) * contentWidth
      
        // Adjust the container's scroll position
        subject.scrollLeft = initialScrollLeft + scrollDelta
    }
    document.onmouseup = endScroll
    function endScroll(e) {
        mem.isDraggin = false
        document.onmousemove = null
        document.onmouseup   = null
    }
}
mem.updateStickyBar = function() {
    if (comp.args.sticky) container.style.top = `${comp.args.sticky.offsetHeight + comp.args.sticky.scrollTop - container.offsetHeight}px`
}
if (comp.args.sticky) {
    container.style.position = "absolute"
    mem.updateStickyBar()
    comp.args.sticky.addEventListener ("scroll", ()=>mem.updateStickyBar())
}
mem.updateScrollBar = function() {
    const viewportWidth = subject.clientWidth; // Visible area
    const contentWidth = subject.scrollWidth; // Total scrollable area
    const trackWidth = scrollTrack.offsetWidth; // Total scrollbar track width
  
    const thumbWidth = (viewportWidth / contentWidth) * trackWidth
    scrollBar.style.width = `${thumbWidth}px`
  
    // Update the thumb's position
    const scrollLeft = subject.scrollLeft
    const thumbLeft = (scrollLeft / contentWidth) * trackWidth
    scrollBar.style.left = `${thumbLeft}px`
}

subject.addEventListener("scroll", ()=>mem.updateScrollBar())

buttonLeft.addEventListener("click", ()=>{
    subject.scrollLeft = subject.scrollLeft - 25
})
buttonRight.addEventListener("click", ()=>{
    subject.scrollLeft = subject.scrollLeft + 25
})

mem.updateScrollBar()