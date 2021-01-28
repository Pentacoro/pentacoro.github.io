// JavaScript Document

	var right = document.createElement("div");
	right.className = "windowBorder";
	right.id = "windowRight";
	wndw.appendChild(right);

	var bottom = document.createElement("div");
	bottom.className = "windowBorder";
	bottom.id = "windowBottom";
	wndw.appendChild(bottom);

	var br = document.createElement("div");
	br.className = "windowBorder";
	br.id = "windowBr";
	wndw.appendChild(br);
	

	parseInt(window.getComputedStyle(document.getElementById("id"),null).getPropertyValue("css attribute"));