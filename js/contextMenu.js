
let contextMenu;

document.addEventListener("click", removeContextMenu);

function createContextMenu(x, y, names, functions, fontSize = 16) {
    removeContextMenu();
    contextMenu = document.createElement("div");
    contextMenu.classList.add("context-menu");
    contextMenu.style.left = x + "px";
    contextMenu.style.top = y + "px";
    for(let i = 0; i < names.length; i++) {
        let button = document.createElement("button");
        button.innerHTML = names[i];
        button.addEventListener("click", functions[i]);
        button.setAttribute("style", "font-size: " + fontSize + "px");
        contextMenu.appendChild(button);
    }
    document.querySelector("body").appendChild(contextMenu);
}

function removeContextMenu() {
    if(contextMenu == null) {
        return;
    }
    contextMenu.remove();
    contextMenu = null;
}