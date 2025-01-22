
let hintMenu;

function createHintMenu() {
    hintMenu = document.createElement("div");
    hintMenu.classList.add("hint-menu");
    document.querySelector("body").appendChild(hintMenu);
}

function updateHintMenu(editor, ln, col) {
    if(hintMenu == null) {
        createHintMenu();
    }
    let child = editor.children[ln];
    let rect = child.getBoundingClientRect();
    hintMenu.style.top = (rect.y + 24) + "px";
    hintMenu.style.left = (measureWidth(child.textContent.substring(0, col)) + 50) + "px";
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