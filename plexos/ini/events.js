import {plexos} from "./system.js"
import {clearSelection, storageAvailable} from "../lib/functions/dll.js"
import ContextMenu from "../lib/classes/interface/contextmenu.js"

//close context menu on mousedown anywhere
window.addEventListener("mousedown", (e) => {
	if (e.target.parentElement.parentElement){
		if(
			e.target.parentElement.classList.contains("contextSection") == false && 
			e.target.parentElement.parentElement.classList.contains("contextSection") == false &&
            !e.target.contextMenu
		) {
			ContextMenu.close()
			clearSelection()
		}
	} else{
		ContextMenu.close()
        clearSelection()
	}
})

window.addEventListener("resize", e => {
	plexos.System.emit("viewport-resize")
})

window.addEventListener("paste", async e => {
    let task = plexos.System.mem.focused
	if (task && task.onpaste) task.onpaste(e)
})
window.onbeforeunload = async e => {
    e.preventDefault()
    await plexos.db.saveCore(plexos.System.core)
    return false
}

//indexedDB
window.addEventListener("keydown", async e => {
    if (e.key === "," && e.ctrlKey) {  
        e.preventDefault()

        await plexos.db.saveCore(plexos.System.core)

        alert("Saved to indexedDB")
    } 
})
window.addEventListener("keydown", async e => {
    if (e.key === "." && e.ctrlKey) {  
        e.preventDefault()

        plexos.System.user.config.lastOpenedCore = null
        await plexos.db.saveUser(plexos.System.user)

        alert("Cleared lastOpenedCore")
    } 
})
window.addEventListener("keydown", async e => {
    if (e.key === "s" && e.ctrlKey) {  
        e.preventDefault()

        await plexos.db.saveCore(plexos.System.core)

        plexos.System.mem.downloadCoreJSON()
        alert("Downloading Core JSON")
    } 
})
window.addEventListener("keyrelease", e => {
    if (e.ctrlKey) window.onkeydown = null
})


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