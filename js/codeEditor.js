
let firstMouse = true;

document.addEventListener("DOMContentLoaded", () => {
    
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
        updateEditorSummary(editor, false);
    });

    editor.addEventListener("mouseup", () => {
        updateEditorSummary(editor, firstMouse);
        firstMouse = false;
    });

});

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
    summary.innerHTML = "<span>" + charset + "</span><span>Ln " + ln + ", Col " + col + "</span><span>Lines: " + lines + "</span>";
}

function updateEditorColors(editor) {
    return;
    let range = document.getSelection().getRangeAt(0);
    for(let i = 0; i < editor.children.length; i++) {

        var str = editor.children[i].textContent;
        
        var HTMLattr = str.match(/".+"/g);

        if(HTMLattr) {
            if(editor.children[i].innerHTML.includes("span")) {
                continue;
            }
            let newSpan = document.createElement("SPAN");
            let splitStr = str.split(HTMLattr[0]);
            console.log(splitStr);
            newSpan.innerText = HTMLattr[0];
            newSpan.style.cssText = 'color:red;';
            editor.children[i].innerHTML = "";
            editor.children[i].append(splitStr[0]);
            editor.children[i].append(newSpan);
            editor.children[i].append(splitStr[1] + " ");
            let currentLineIndex = getCurrentLine(editor);
            if(currentLineIndex == i) {
                let currentLine = editor.children[currentLineIndex];
                let spanIndex = -1;
                for(let j = 0; j < currentLine.children.length; j++) {
                    if(currentLine.children[j] == newSpan) {
                        spanIndex = j;
                        break;
                    }
                }
                range.setStart(currentLine, spanIndex + 3);
                range.setEnd(currentLine, spanIndex + 3);
            }
        } else {
            for(let j = 0; j < editor.children[i].children.length; j++) {
                if(editor.children[i].children[j].tagName !== "SPAN") {
                    console.log(editor.children[i].children[j].tagName);
                    continue;
                }
                console.log("abc");
                editor.children[i].replaceChild(document.createTextNode(editor.children[i].children[j].textContent), editor.children[i].children[j]);
            }
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