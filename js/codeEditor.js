
document.addEventListener("DOMContentLoaded", init);

let firstMouse = true;
let readyToSave = false;
let regex;

let saveInterval = setInterval(() => {
    readyToSave = true;
}, 1000 * 10);

function init() {

    loadSyntax();

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
    });

    editor.addEventListener("keyup", () => {
        updateEditorColors(editor);
        updateEditorSummary(editor, false);
    });

    editor.addEventListener("paste", (e) => {
        e.preventDefault();
        let text = "";
        if(e.clipboardData || e.originalEvent.clipboardData) {
            text = (e.originalEvent || e).clipboardData.getData('text/plain');
        } else if(window.clipboardData) {
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
        checkChildren(editor);
        if(readyToSave) {
            readyToSave = false;
            saveCurrentFile();
        }
        updateHintMenu(editor, getCurrentLine(editor), getCurrentColumn());
    });

    editor.addEventListener("mouseup", () => {
        updateEditorSummary(editor, firstMouse);
        firstMouse = false;
    });
}

function loadSyntax() {
    var xhr = new XMLHttpRequest();

    xhr.open("GET", "../js/editorOptions/syntax.json", true);
    xhr.onload = function () {
        regex = JSON.parse(this.responseText);
    };

    xhr.send();
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
        col = getCurrentColumn() + 1;
    }
    summary.innerHTML = "<span id='save-string'>" + getSaveString() + "</span><span>" + charset + "</span><span>Ln " + ln + ", Col " + col + "</span><span>Lines: " + lines + "</span>";
}

function updateEditorColors(editor) {

    let selection = document.getSelection();
    selection.extend(editor, 0);
    let character = selection.toString().length;

    for(let i = 0; i < editor.children.length; i++) {

        // Remove all previous spans (colors)
        let divContent = editor.children[i].innerText;

        divContent = divContent.replace(/<span style="color:.+">/g, "").replace(/<\/span>/g, "");

        editor.children[i].innerText = divContent;

        // Match the regular expression

        for(let j = 0; j < regex.length; j++) {
            let reg = new RegExp(regex[j].regex, regex[j].flag);
            let match = [...divContent.matchAll(reg)];
            for(let k = 0; k < match.length; k += 2) {
                let input = match[k][0];
                if(input == '') {
                    continue;
                }
                let str1 = divContent.substring(0, match[k].index); // Everything before match
                let str2 = divContent.substring(match[k].index + input.length); // Everything after match
                editor.children[i].innerHTML = "";
                editor.children[i].append(str1);
                let color = document.createElement("span");
                color.style.color = regex[j].color;
                color.style.backgroundColor = regex[j].backgroundColor;
                color.innerText = input;
                editor.children[i].appendChild(color);
                editor.children[i].append(str2);
            }
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
    if(node.tagName == "SPAN") {
        node = node.parentElement;
    }

    for(let i = 0; i < editor.children.length; i++) {
        if(node == editor.children[i]) {
            return i;
        }
    }
}

function getCurrentColumn() {
    let range = document.getSelection().getRangeAt(0);
    let startContainer = range.startContainer;
    let c = range.startOffset;
    if(c == 0) {
        return 0;
    }
    if(startContainer.parentNode.tagName == "SPAN") {
        let absoluteChildren = startContainer.parentNode.parentNode.childNodes;
        for(let i = 0; i < absoluteChildren.length; i++) {
            if(absoluteChildren[i] == startContainer.parentNode) {
                break;
            }
            c += absoluteChildren[i].textContent.length;
        }
    } else {
        let absoluteChildren = startContainer.parentNode.childNodes;
        for(let i = 0; i < absoluteChildren.length; i++) {
            if(absoluteChildren[i] == startContainer) {
                break;
            }
            c += absoluteChildren[i].textContent.length;
        }
    }
    return c;
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
    if(code == null || code == "" || code == "null") {
        code = "<div><br></div>";
    }
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