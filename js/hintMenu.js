
document.addEventListener("DOMContentLoaded", init);

let hintMenu;
let commands;

function init() {
    loadCommands();
}

function createHintMenu() {
    hintMenu = document.createElement("div");
    hintMenu.classList.add("hint-menu");
    document.querySelector("body").appendChild(hintMenu);
    for(let i = 0; i < commands.length; i++) {
        let button = document.createElement("button");
        button.innerText = commands[i].command;
        hintMenu.appendChild(button);
    }
}

function updateHintMenu(editor, ln, col) {
    if(hintMenu == null) {
        createHintMenu();
    }
    if(col == 0) {
        return;
    }
    let child = editor.children[ln];
    let rect = child.getBoundingClientRect();
    hintMenu.style.top = (rect.y + 24) + "px";
    hintMenu.style.left = (measureWidth(child.textContent.substring(0, col)) + 50) + "px";
    let start = 0;
    for(let i = col; i >= 0; i--) {
        if(child.textContent.charAt(i) == " ") {
            start = i + 1;
            break;
        }
    }
    let currentCommand = child.textContent.substring(start, col);
    for(let i = 0; i < hintMenu.children.length; i++) {
        let child = hintMenu.children[i];
        if(child.textContent.includes(currentCommand)) {
            child.style.display = "block";
        } else {
            child.style.display = "none";
        }
    }
}

function measureWidth(text) {
    let font = "16px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif";
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    context.font = font;
    let width = context.measureText(text).width;
    return Math.ceil(width);
}

function removeHintMenu() {
    if(hintMenu == null) {
        return;
    }
}

function loadCommands() {
    var xhr = new XMLHttpRequest();

    xhr.open("GET", "../js/editorOptions/commands.json", true);
    xhr.onload = function () {
        commands = JSON.parse(this.responseText);
    };

    xhr.send();
}