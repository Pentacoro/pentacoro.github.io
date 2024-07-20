//Custom Events----------------------------------------------|

const eventOnFocus = new Event ("dofocus")

const eventUnFocus = new Event ("doblur")

const eventMenuOpen = new Event ("openmenu")

const eventMenuClose = new Event ("closemenu")

//----------------------------------------------Custom Events|

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