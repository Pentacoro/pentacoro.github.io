var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(core));
var dlAnchorElem = document.getElementById('downloadAnchorElem');
dlAnchorElem.setAttribute("href",     dataStr     );
dlAnchorElem.setAttribute("download", "scene.json");
dlAnchorElem.click();