function iframeAntiHover (coin) {
	var tagIframe = document.getElementsByTagName("iframe");

	for (i = 0; i < tagIframe.length; i++) {
		if (coin == true) {
			tagIframe[i].className += "antiHover";
		}
		if (coin == false) {
			tagIframe[i].classList.remove("antiHover");
		}
	}
}

function selectText(node) {
    if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
}

function clearSelection(){
	if (window.getSelection) {window.getSelection().removeAllRanges();}
	else if (document.selection) {document.selection.empty();}
}

//window.addEventListener("mousedown", e => {if(keyPressCtrl == true)console.log(e.target)});
//window.addEventListener("keyup",     e => {if(keyPressCtrl == true)console.log(e.key)});

//Boolean key checks-----------------------------------------------|
	var keyPressCtrl = false; //17
	var keyPressC = false; //67

	//C KEY-------------------------------------------------|
		window.addEventListener('keydown', e => {
			if(e.key === ","){
				keyPressComma = true;
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

const idBackground= document.getElementById('background');

const idNavbar    = document.getElementById('navbar');

const idSelectBox = document.getElementById('selectBox');

const idCtextMenu = document.getElementById("dropContextMenu");

const classIcon   = document.getElementsByClassName("icon");

const classActive = document.getElementsByClassName("active");

const classWindow = document.getElementsByClassName("window");

//------------------------------------HTML element references|

//-----------------------------------------------------------------|
function areRectanglesOverlap(div1, div2) {
	let x1 = div1.offsetLeft;
	let y1 = div1.offsetTop;
	let h1 = y1 + div1.offsetHeight;
	let w1 = x1 + div1.offsetWidth;

	let x2 = div2.offsetLeft;
	let y2 = div2.offsetTop;
	let h2 = y2 + div2.offsetHeight;
	let w2 = x2 + div2.offsetWidth;

	if (h1 < y2 || y1 > h2 || w1 < x2 || x1 > w2) return false;
	return true;
}
//-----------------------------------------------------------------|