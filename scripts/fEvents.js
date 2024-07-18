//Custom Events----------------------------------------------|

const eventOnFocus = new Event ("dofocus")

const eventUnFocus = new Event ("doblur")

const eventMenuOpen = new Event ("openmenu")

const eventMenuClose = new Event ("closemenu")

//----------------------------------------------Custom Events|

if (jsc.storageAvailable('localStorage')) {
        
    // Yippee! We can use localStorage awesomeness
    window.addEventListener("keydown", e => {
        if (e.key === "," && e.ctrlKey) {  
            e.preventDefault()
            window.localStorage.core = JSON.stringify(core)
            console.log("Saved to localStorage")
        } 
    })
    window.addEventListener("keydown", e => {
        if (e.key === "." && e.ctrlKey) {  
            e.preventDefault()
            delete window.localStorage.core
            console.log("Cleared localStorage")
        } 
    })
    window.addEventListener("keydown", e => {
        if (e.key === "s" && e.ctrlKey) {  
            e.preventDefault()
            console.log("Downloading Core JSON")
            downloadCoreJSON()
        } 
    })
    window.addEventListener("keyrelease", e => {
        if (e.ctrlKey) window.onkeydown = null
    })

}