
let selectedLine;

document.addEventListener("DOMContentLoaded", () => {
    
    const editor = document.getElementById("code-editor");

    editor.addEventListener("keydown", (e) => {
        if(e.key == "Tab") {
            e.preventDefault();
            if(e.shiftKey) {

            } else {  
                insertTabChar();
            }
        }
        if(e.key == "Enter") {
            e.preventDefault();
            createNewLine(editor);
        }
        updateEditorSummary();
    });

    editor.addEventListener("keyup", (e) => {
        if(e.key == "Enter") {
            updateEditorColors(editor, "CSS");
        }
    });

    editor.addEventListener("focus", () => {
        updateEditorSummary();
    });

    editor.addEventListener("paste", (e) => {
        e.preventDefault();
    });

});

function insertTabChar() {
    let sel = window.getSelection();
    let restart = false;
    if(sel.rangeCount) {
        range = sel.getRangeAt(0);
        if(range.getClientRects().length <= 1) {
            restart = true;
            range.deleteContents();
        }
        let node = document.createTextNode("\t");
        range.insertNode(node);
        if(restart) {
            range.setStart(node, 1);
            range.setEnd(node, 1);
        }
    }
}

function updateEditorSummary() {

    
    const editor = document.getElementById("code-editor");

    const summary = document.getElementById("editor-summary");

    let lines = editor.children.length;

    summary.innerText = "Lines: " + lines + "";

}

function updateEditorColors(editor, style) {
    for(let i = 0; i < editor.children.length - 1; i++) {
        let child = editor.children[i];
        if(style == "CSS") {
            styleCSS(child);
        }
    }
}

function moveCursorToEnd(child) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(child);
    range.collapse(false); 
    selection.removeAllRanges();
    selection.addRange(range);
}

function createNewLine(editor) {
    let line = document.createElement("div");
    line.setAttribute("index", editor);
    line.addEventListener("click", (e) => {
        selectedLine = e.target.getAttribute("index");
    });
    editor.appendChild(line);
    moveCursorToEnd(editor.children[editor.children.length - 1]);
}

function styleCSS(child) {
    let firstLetter = child.innerText.substring(0, 1);
    let text = child.innerText;
    text = text.replace("{", "<span style='color: green'>{</span> ");
    text = text.replace("}", "<span style='color: green'>}</span> ");
    if(firstLetter == '\t') {
        child.innerHTML = "<span style='color:blue'>" + text + "</span> ";
    } else if(firstLetter == '.') {
        child.innerHTML = "<span style='color:orange'>" + text + "</span> "
    }
}