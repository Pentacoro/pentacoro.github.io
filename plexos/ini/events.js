const eventMenuOpen = new Event ("openmenu")
const eventMenuClose = new Event ("closemenu")

//close context menu on mousedown anywhere
window.addEventListener("mousedown", (e) => {
	if (e.target.parentElement.parentElement){
		if(
			e.target.parentElement.classList.contains("contextSection") == false && 
			e.target.parentElement.parentElement.classList.contains("contextSection") == false &&
            !e.target.contextMenu
		) {
			ContextMenu.close()
			dll.clearSelection()
		}
	} else{
		ContextMenu.close()
        dll.clearSelection()
	}
})

if (dll.storageAvailable('localStorage')) {
        
    // Yippee! We can use localStorage awesomeness
    window.addEventListener("keydown", e => {
        if (e.key === "," && e.ctrlKey) {  
            e.preventDefault()
            window.localStorage.core = JSON.stringify(core)
            alert("Saved to localStorage")
        } 
    })
    window.addEventListener("keydown", e => {
        if (e.key === "." && e.ctrlKey) {  
            e.preventDefault()
            delete window.localStorage.core
            alert("Cleared localStorage")
        } 
    })
    window.addEventListener("keydown", e => {
        if (e.key === "s" && e.ctrlKey) {  
            e.preventDefault()
            downloadCoreJSON()
            alert("Downloading Core JSON")
        } 
    })
    window.addEventListener("keyrelease", e => {
        if (e.ctrlKey) window.onkeydown = null
    })
}

function touchHandler(event)
{
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
    switch(event.type)
    {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type = "mousemove"; break;        
        case "touchend":   type = "mouseup";   break;
        default:           return;
    }

    // initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //                screenX, screenY, clientX, clientY, ctrlKey, 
    //                altKey, shiftKey, metaKey, button, relatedTarget)

    var simulatedEvent = document.createEvent("MouseEvent")
    simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                                  first.screenX, first.screenY, 
                                  first.clientX, first.clientY, false, 
                                  false, false, false, 0/*left*/, null)

    first.target.dispatchEvent(simulatedEvent);

    //check if click
    if (type === "mouseup"){
        simulatedEvent.initMouseEvent("click", true, true, window, 1, 
                                    first.screenX, first.screenY, 
                                    first.clientX, first.clientY, false, 
                                    false, false, false, 0/*left*/, null)
        first.target.dispatchEvent(simulatedEvent)
    }

    //event.preventDefault();
}

document.addEventListener("touchstart", touchHandler, true)
document.addEventListener("touchmove", touchHandler, true)
document.addEventListener("touchend", touchHandler, true)
document.addEventListener("touchcancel", touchHandler, true)

var touchTap = false

window.addEventListener('touchstart', function() {
    touchTap = true;
    setTimeout(function() {
      if(touchTap) {
        touchTap = false
      }
    }, 250)
  })
  
window.addEventListener('touchend', function() {
    touchTap = false
})