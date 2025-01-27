
document.addEventListener("DOMContentLoaded", init);

let button;

function init() {
    button = document.getElementById("run-button");
    button.addEventListener("click", runButtonClick);
}

function updateRunButton() {
    let name = getCurrentFileName();
    if(!name.endsWith("html") && !name.endsWith("php")) {
        button.disabled = true;
    } else {
        button.disabled = false;
    }
}

function runButtonClick() {
    if(button.disabled) {
        return;
    }
    saveCurrentFile();
    cardClick(document.getElementById("output-summary").children[0]);
    let name = getCurrentFileName();
    let iframe = swapFrames();
    let contentDocument = iframe.contentDocument;
    let editorCode = getEditorCode(document.getElementById("code-editor"));
    if(name.endsWith("html")) {
        setOutput(contentDocument, editorCode);
    } else if(name.endsWith("php")) { 
        simulatePHP(contentDocument, editorCode);
    }
}

function simulatePHP(contentDocument, code) {
    
    var data = new FormData();
    data.append("vm-sandbox-code", code);
    data.append("get-test", "1234 :)");
    data.append("post-test", "1234 :)");

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
        script.innerHTML = parser.parseFromString(getFile(EXAM_NAME + source), "text/html").documentElement.textContent;
    }
    let styles = newDocument.querySelectorAll("link[rel=stylesheet]");
    for(let i = 0; i < styles.length; i++) {
        let style = styles[i];
        let source = style.getAttribute("href");
        style.removeAttribute("href");
        style.setAttribute("sref", source);
        let styleElement = newDocument.createElement("style");
        styleElement.innerHTML = parser.parseFromString(getFile(EXAM_NAME + source), "text/html").documentElement.textContent;
        style.parentElement.insertBefore(styleElement, style.nextSibling);
    }
    let images = newDocument.querySelectorAll("img");
    for(let i = 0; i < images.length; i++) {
        let image = images[i];
        let source = image.getAttribute("src");
        if(source.startsWith("http://") || source.startsWith("https://")) {
            continue;
        }
        image.setAttribute("src", "../assets/" + EXAM_NAME + "/" + source);
    }
    contentDocument.write(newDocument.documentElement.innerHTML);
    if(outputCode.startsWith("<!DOCTYPE html>")) {
        contentDocument.querySelector("html").setAttribute("doctype", "html5");
    }
    let links = contentDocument.querySelectorAll("a[href]");
    for(let i = 0; i < links.length; i++) {
        let link = links[i];
        link.addEventListener("click", (e) => {
            e.preventDefault();
            linkClick(link.getAttribute("href"));
        });
    }
    contentDocument.close();
}

function linkClick(href) {

    const editorFiles = document.getElementById("editor-files");

    for(let i = 0; i < editorFiles.children.length; i++) {
        let file = editorFiles.children[i];
        if(file.getAttribute("filename") == href) {
            fileClick(file);
            runButtonClick();
            return;
        }
    }

    window.open(href, "_blank");

}

function swapFrames() {
    let oldFrame = document.getElementById("output");
    if(oldFrame != null) {
        oldFrame.remove();
    }
    let iframe = document.createElement("iframe");
    iframe.classList.add("output-frame");
    iframe.setAttribute("id", "output");
    let container = document.getElementById("output-container");
    container.insertBefore(iframe, container.childNodes[1]);
    return iframe;
}