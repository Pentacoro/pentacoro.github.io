const idDesktop = document.getElementById("desktop")

window.addEventListener("resize", e => {
	idDesktop.style.width = document.body.offsetWidth + "px"
    idDesktop.style.height = document.body.offsetHeight - cfg.desktop.taskbar.height + "px"
})

//set background size
idDesktop.style.width = document.body.offsetWidth + "px"
idDesktop.style.height = document.body.offsetHeight - cfg.desktop.taskbar.height + "px"
