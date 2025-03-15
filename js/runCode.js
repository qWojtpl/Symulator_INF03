
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

function runButtonClick(getValues, postValues) {
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
        simulatePHP(contentDocument, editorCode, getValues, postValues);
    }
}

function simulatePHP(contentDocument, code, getValues, postValues) {
    
    var data = new FormData();
    data.append("vm-sandbox-code", code);

    if(getValues != null) {
        for(let i = 0; i < getValues.length; i++) {
            data.append("get-" + getValues[i].key, getValues[i].value);
        }
    }

    if(postValues != null) {
        for(let i = 0; i < postValues.length; i++) {
            data.append("post-" + postValues[i].key, postValues[i].value);
        }
    }

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
    // Preparing document
    let newDocument = parser.parseFromString(outputCode, "text/html");
    initializeScripts(parser, newDocument);
    initializeStylesheets(parser, newDocument);
    initializeImages(newDocument);
    // Content document - live document
    contentDocument.write(newDocument.documentElement.innerHTML);
    if(outputCode.startsWith("<!DOCTYPE html>")) {
        contentDocument.querySelector("html").setAttribute("doctype", "html5");
    }
    initializeLinks(contentDocument);
    initializeForms(contentDocument);
    contentDocument.close();
}

function initializeScripts(parser, newDocument) {
    let scripts = newDocument.querySelectorAll("script[src]");
    for(let i = 0; i < scripts.length; i++) {
        let script = scripts[i];
        let source = script.getAttribute("src");
        script.removeAttribute("src");
        script.innerHTML = parser.parseFromString(getFile(EXAM_NAME + source), "text/html").documentElement.textContent;
    }
}

function initializeStylesheets(parser, newDocument) {
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
}

function initializeImages(newDocument) {
    let images = newDocument.querySelectorAll("img");
    for(let i = 0; i < images.length; i++) {
        let image = images[i];
        let source = image.getAttribute("src");
        if(source.startsWith("http://") || source.startsWith("https://")) {
            continue;
        }
        image.setAttribute("src", "../assets/" + EXAM_NAME + "/" + source);
    }
}

function initializeLinks(contentDocument) {
    let links = contentDocument.querySelectorAll("a[href]");
    for(let i = 0; i < links.length; i++) {
        let link = links[i];
        link.addEventListener("click", (e) => {
            e.preventDefault();
            linkClick(link.getAttribute("href"));
        });
    }
}

function initializeForms(contentDocument) {
    let forms = contentDocument.querySelectorAll("form");
    for(let i = 0; i < forms.length; i++) {
        let form = forms[i];
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            formSubmit(form);
        });
    }
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

function formSubmit(form) {
    let formData = new FormData(form);
    let action = form.getAttribute("action");

    getValues = [];
    postValues = [];

    if(form.getAttribute("method") == "post") {
        for (const [key, value] of formData) {
            postValues[postValues.length] = {
                key: key,
                value: value
            };
        }
    } else {
        for (const [key, value] of formData) {
            getValues[getValues.length] = {
                key: key,
                value: value
            };
        }
    }

    const editorFiles = document.getElementById("editor-files");
    for(let i = 0; i < editorFiles.children.length; i++) {
        let file = editorFiles.children[i];
        if(file.getAttribute("filename") == action || (action == null && file.classList.contains("active"))) {
            fileClick(file);
            runButtonClick(getValues, postValues);
            return;
        }
    }
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