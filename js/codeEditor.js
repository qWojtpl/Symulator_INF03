
document.addEventListener("DOMContentLoaded", init);

let firstMouse = true;
let readyToSave = false;

let saveInterval = setInterval(() => {
    readyToSave = true;
}, 1000 * 10);

function init() {
    const editor = document.getElementById("code-editor");
    
    updateEditorSummary(editor, true);

    editor.addEventListener("keydown", (e) => {
        if(e.key == "Tab") {
            e.preventDefault();
            if(e.shiftKey) {

            } else {  
                insertChar("\t");
            }
        }
        if(e.key == "Enter" && e.shiftKey) {
            e.preventDefault();
        }
        updateEditorSummary(editor, false);
    });

    editor.addEventListener("keyup", () => {
        updateEditorSummary(editor, false);
    });

    editor.addEventListener("paste", (e) => {
        e.preventDefault();
        var text = '';
        if (e.clipboardData || e.originalEvent.clipboardData) {
        text = (e.originalEvent || e).clipboardData.getData('text/plain');
        } else if (window.clipboardData) {
            text = window.clipboardData.getData('Text');
        }
        if(document.queryCommandSupported('insertText')) {
            document.execCommand('insertText', false, text);
        } else {
            document.execCommand('paste', false, text);
        }
    });

    editor.addEventListener("dragenter", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "none";
    });

    editor.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "none";
    });

    editor.addEventListener("input", () => {
        updateEditorColors(editor);
        checkChildren(editor);
        if(readyToSave) {
            readyToSave = false;
            saveCurrentFile();
        }
        updateEditorSummary(editor, false);
    });

    editor.addEventListener("mouseup", () => {
        updateEditorSummary(editor, firstMouse);
        firstMouse = false;
    });
}

function insertChar(char) {
    let sel = window.getSelection();
    let restart = false;
    if(sel.rangeCount) {
        range = sel.getRangeAt(0);
        if(range.getClientRects().length <= 1) {
            restart = true;
            range.deleteContents();
        }
        let node = document.createTextNode(char);
        range.insertNode(node);
        if(restart) {
            range.setStart(node, 1);
            range.setEnd(node, 1);
        }
    }
}

function updateEditorSummary(editor, start) {
    const summary = document.getElementById("editor-summary");
    let lines = editor.children.length;
    let charset = document.querySelector("meta[charset]").getAttribute("charset");
    let ln = 1;
    let col = 1;
    if(!start) {
        ln = getCurrentLine(editor) + 1;
        if(isNaN(ln)) {
            ln = 1;
        }
        col = document.getSelection().getRangeAt(0).startOffset + 1;
    }
    summary.innerHTML = "<span id='save-string'>" + getSaveString() + "</span><span>" + charset + "</span><span>Ln " + ln + ", Col " + col + "</span><span>Lines: " + lines + "</span>";
}

function updateEditorColors(editor) {

    let selection = document.getSelection();
    selection.extend(editor, 0);
    let character = selection.toString().length;
    for(let i = 0; i < editor.children.length; i++) {

        let divContent = editor.children[i].textContent;

        editor.children[i].innerHTML = editor.children[i].innerHTML.replace(/<span style="color:.+">/g, "").replace(/<\/span>/g, "");

        let match = [...divContent.matchAll(/".+"/g)];

        for(let j = 0; j < match.length; j++) {
            let input = match[j][0];
            editor.children[i].innerHTML = divContent.replace(input, "<span style='color:green'>" + input + "</span>");
        }
        
    }
    selection.collapse(editor, 0);

    for(let i = 0; i < character; i++) {
        selection.modify("move", "forward", "character");
    }
}

/**
 * Get current line when the cursor is in the beggining of the line
 * 
 * @param {HTMLElement} editor Editor element
 * @returns Index of currently selected line
 */
function getCurrentLine(editor) {
    let selection = document.getSelection();
    let node = selection.anchorNode.parentElement;

    if(node.getAttribute("id") == "code-editor") {
        node = selection.anchorNode;
    }

    for(let i = 0; i < editor.children.length; i++) {
        if(node == editor.children[i]) {
            return i;
        }
    }
}

function checkChildren(editor) {

    if(editor.innerHTML.startsWith("<br>")) {
        editor.innerHTML = editor.innerHTML.replace("<br>", "");
    }

    if(editor.children.length > 0) {
        return;
    }

    editor.innerHTML = "<div><br></div>";

}

function getEditorCode(editor) {
    return editor.textContent;   
}

function getEditorFormattedCode(editor) {
    return editor.innerHTML;
}

function setEditorFormattedCode(editor, code) {
    editor.innerHTML = code;
} 

function setEditorCode(editor, code) {

    if(code == null) {
        return;
    }

    let split = code.split("\n");

    let newCode = "";

    for(let i = 0; i < split.length; i++) {
        console.log(split[i]);
        newCode += "<div>" + split[i] + "</div>";
    }

    editor.innerHTML = newCode;

}