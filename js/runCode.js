
document.addEventListener("DOMContentLoaded", init);

let button;

function init() {
    button = document.getElementById("run-button");
    button.addEventListener("click", buttonClick);
}

function updateRunButton() {
    let name = getCurrentFileName();
    if(!name.endsWith("html") && !name.endsWith("php")) {
        button.disabled = true;
    } else {
        button.disabled = false;
    }
}

function buttonClick() {
    if(button.disabled) {
        return;
    }
    saveCurrentFile();
    let name = getCurrentFileName();
    let contentDocument = document.getElementById("output").contentDocument;
    let editorCode = getEditorCode(document.getElementById("code-editor"));
    if(name.endsWith("html")) {
        setOutput(contentDocument, editorCode);
    } else if(name.endsWith("php")) { 
        simulate(contentDocument, editorCode);
    }
}

function simulate(contentDocument, code) {
    
    var data = new FormData();
    data.append("code", code);

    var xhr = new XMLHttpRequest();

    xhr.open("POST", "../lib/simulate.php", true);
    xhr.onload = function () {
        setOutput(contentDocument, this.responseText);
    };

    xhr.send(data);

}

function setOutput(contentDocument, outputCode) {
    contentDocument.open();
    let parser = new DOMParser();
    let newDocument = parser.parseFromString(outputCode, "text/html");
    let scripts = newDocument.querySelectorAll("script[src]");
    for(let i = 0; i < scripts.length; i++) {
        let script = scripts[i];
        let source = script.getAttribute("src");
        script.removeAttribute("src");
        script.innerText = parser.parseFromString(getFile(EXAM_NAME + source), "text/html").documentElement.textContent;
    }
    let styles = newDocument.querySelectorAll("link[rel=stylesheet]");
    for(let i = 0; i < styles.length; i++) {
        let style = styles[i];
        let source = style.getAttribute("href");
        style.removeAttribute("href");
        style.setAttribute("ref", source);
        let head = newDocument.querySelector("head");
        let styleElement = newDocument.createElement("style");
        styleElement.innerText = parser.parseFromString(getFile(EXAM_NAME + source), "text/html").documentElement.textContent;
        head.appendChild(styleElement);
    }
    contentDocument.write(newDocument.documentElement.innerHTML);
    contentDocument.close();
}