
document.addEventListener("DOMContentLoaded", init);

let firstMouse = true;
let readyToSave = false;
let regex;
let targetColumn;

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
                insertChar("	");
            }
        }
        if(e.key == "Enter" && e.shiftKey) {
            e.preventDefault();
        }
        if(e.key == "ArrowUp") {
            e.preventDefault();
            let line = getCurrentLine(editor);
            if(line != 0) {
                let column = targetColumn;
                if(targetColumn == null) {
                    column = getCurrentColumn();
                    targetColumn = column;
                }
                let textLength = editor.children[line - 1].textContent.length;
                let pos = textLength;
                if(textLength >= column) {
                    pos = column;
                }
                setCursorPosition(editor.children[line - 1], pos); 
            }
        } else if(e.key == "ArrowDown") {
            e.preventDefault();
            let line = getCurrentLine(editor);
            if(line != editor.children.length - 1) {
                let column = targetColumn;
                if(targetColumn == null) {
                    column = getCurrentColumn();
                    targetColumn = column;
                }
                let textLength = editor.children[line + 1].textContent.length;
                let pos = textLength;
                if(textLength >= column) {
                    pos = column;
                }
                setCursorPosition(editor.children[line + 1], pos); 
            }
        }
    });

    editor.addEventListener("keyup", () => {
        targetColumn = getCurrentColumn();
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
        updateEditorColors(editor);
        updateEditorSummary(editor, false);
    });

    editor.addEventListener("mouseup", () => {
        updateEditorSummary(editor, firstMouse);
        firstMouse = false;
        targetColumn = getCurrentColumn();
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
    document.execCommand('insertText', false, char);
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

    let line = getCurrentLine(editor);
    let column = getCurrentColumn();

    for(let i = 0; i < editor.children.length; i++) {

        // Remove all previous spans (colors)
        let divContent = editor.children[i].innerText;

        divContent = divContent.replace(/<span style="color:.+">/g, "").replace(/<\/span>/g, "");

        editor.children[i].innerText = divContent;

        // Match the regular expression

        let allMatches = [];

        for(let j = 0; j < regex.length; j++) {
            let reg = new RegExp(regex[j].regex, regex[j].flag);
            let match = [...divContent.matchAll(reg)];
            for(let k = 0; k < match.length; k++) {
                allMatches[allMatches.length] = {
                    input: match[k][0],
                    index: match[k].index,
                    color: regex[j].color,
                    backgroundColor: regex[j].backgroundColor
                }
            }
        }

        // Sort by index

        allMatches.sort(function(a, b) {
            return a.index - b.index;
        });

        // Insert colors and the rest of the text

        let start = 0;
        editor.children[i].innerHTML = "";

        for(let j = 0; j < allMatches.length; j++) {
            if(allMatches[j].index < start) {
                continue;
            }
            let str = divContent.substring(start, allMatches[j].index);
            start = allMatches[j].index + allMatches[j].input.length;
            editor.children[i].append(str);
            let color = document.createElement("span");
            color.style.color = allMatches[j].color;
            color.style.backgroundColor = allMatches[j].backgroundColor;
            color.innerText = allMatches[j].input;
            editor.children[i].appendChild(color);
        }

        if(start != divContent.length) {
            let str = divContent.substring(start, divContent.length);
            editor.children[i].append(str);
        }
        
    }

    // Set cursor to the previous position (changing DOM resets cursor position to the beggining of the line)

    setCursorPosition(editor.children[line], column);
}

function setCursorPosition(lineElement, position) {

    let selection = document.getSelection();
    let range = selection.getRangeAt(0);

    let total = 0;

    for(let i = 0; i < lineElement.childNodes.length; i++) {
        let indexStart = total;
        total += lineElement.childNodes[i].textContent.length;
        if(total >= position) {
            let rangeElement = lineElement.childNodes[i];
            if(rangeElement.tagName == "SPAN") {
                rangeElement = rangeElement.childNodes[0];
            }
            range.setStart(rangeElement, position - indexStart); // column: 27, current child start: 14, so range starts now from 27-14
            range.collapse(true);
            break;
        }
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
        newCode += "<div>" + split[i] + "</div>";
    }

    editor.innerHTML = newCode;
}