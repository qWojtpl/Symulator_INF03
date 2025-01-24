
document.addEventListener("DOMContentLoaded", init);

let hintMenu;
let commands;

function init() {
    loadCommands();
    document.addEventListener("click", removeHintMenu);
}

function createHintMenu() {
    hintMenu = document.createElement("div");
    hintMenu.classList.add("hint-menu");
    document.querySelector("body").appendChild(hintMenu);
    for(let i = 0; i < commands.length; i++) {
        let button = document.createElement("button");
        let image = document.createElement("img");
        image.src = "../assets/" + commands[i].language + ".png"; 
        let text = document.createElement("span");
        text.innerText = commands[i].command;
        button.appendChild(image);
        button.appendChild(text);
        button.setAttribute("language", commands[i].language);
        hintMenu.appendChild(button);
    }
}

function updateHintMenu(editor, ln, col) {
    if(col == 0) {
        removeHintMenu();
        return;
    }
    let child = editor.children[ln];
    if(child == null) {
        removeHintMenu();
        return;
    }
    if(hintMenu == null) {
        createHintMenu();
    }
    let rect = child.getBoundingClientRect();
    hintMenu.style.top = (rect.y + 24) + "px";
    hintMenu.style.left = (measureWidth(child.textContent.substring(0, col)) + 50) + "px";
    let start = 0;
    for(let i = col; i >= 0; i--) {
        let char =  child.textContent.charAt(i);
        if(char == " " || char == "(" || char == "." || char == "	" || char == "<" || char == "/") {
            start = i + 1;
            break;
        }
    }
    let currentCommand = child.textContent.substring(start, col);
    let active = 0;
    let fileExtension = getCurrentFileName().split(".").pop();
    for(let i = 0; i < hintMenu.children.length; i++) {
        let child = hintMenu.children[i];
        let textChild = child.children[1];
        let language = child.getAttribute("language");
        if(textChild.textContent.toLowerCase().startsWith(currentCommand.toLowerCase())) {
            if(language != "html" && language != "css") {
                if(!language.includes(fileExtension)) {
                    child.style.display = "none";
                    continue;
                }
            }
            if(language == "html" && fileExtension == "css") {
                child.style.display = "none";
                continue;
            }
            child.style.display = "flex";
            textChild.innerHTML = child.textContent.replace(currentCommand, "<mark>" + currentCommand + "</mark>");
            active++;
        } else {
            child.style.display = "none";
        }
    }

    if(active == 0) {
        removeHintMenu();
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
    hintMenu.remove();
    hintMenu = null;
}

function loadCommands() {
    var xhr = new XMLHttpRequest();

    xhr.open("GET", "../js/editorOptions/commands.json", true);
    xhr.onload = function () {
        commands = JSON.parse(this.responseText);
    };

    xhr.send();
}