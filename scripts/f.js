//javascript.js

//window.addEventListener("mousedown", e => {if(keyPressCtrl == true)console.log(e.target)});
//window.addEventListener("keyup",     e => {if(keyPressCtrl == true)console.log(e.key)});

//Boolean key checks-----------------------------------------------|
	let keyPressCtrl = false //17
	let keyPressC = false //67

	//C KEY-------------------------------------------------|
		window.addEventListener('keydown', e => {
			if(e.key === ","){
				keyPressComma = true
			}
		})

		window.addEventListener('keyup', e => {
			if(e.key === ","){
				keyPressComma = false;
			}
		})
	//-------------------------------------------------C KEY|

	//CONTROL-----------------------------------------------|
		window.addEventListener('keydown', e => {
			if(e.key === "Control"){
				keyPressCtrl = true;
			}
		})

		window.addEventListener('keyup', e => {
			if(e.key === "Control"){
				keyPressCtrl = false;
			}
		})
	//-----------------------------------------------CONTROL|

//-----------------------------------------------Boolean key checks|

//HTML element references------------------------------------|

const idDesktop   = document.getElementById('desktop');

const idNavbar    = document.getElementById('navbar');

const idSelectBox = document.getElementById('selectBox');

const idDropMenu  = document.getElementsByClassName("clickContext")[0];

const classIcon   = document.getElementsByClassName("icon");

const classActive = document.getElementsByClassName("active");

const classWindow = document.getElementsByClassName("window");

//------------------------------------HTML element references|

//Custom Events----------------------------------------------|

const eventFocus = new Event ("focus")

const eventDfocus = new Event ("dfocus")

//----------------------------------------------Custom Events|