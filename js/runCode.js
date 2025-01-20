
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
    simulate(document.getElementById("output").contentDocument, getEditorCode(document.getElementById("code-editor")));
}

function simulate(contentDocument, code) {
    
    var data = new FormData();
    data.append("code", code);

    var xhr = new XMLHttpRequest();

    xhr.open("POST", "../lib/simulate.php", true);
    xhr.onload = function () {
        contentDocument.open();
        let parser = new DOMParser();
        let newDocument = parser.parseFromString(this.responseText, "text/html");
        let scripts = newDocument.querySelectorAll("script[src]");
        for(let i = 0; i < scripts.length; i++) {
            let script = scripts[i];
            let source = script.getAttribute("src");
            script.removeAttribute("src");
            script.innerText = getFile(EXAM_NAME + source);
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
    };

    xhr.send(data);

}