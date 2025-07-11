
document.addEventListener("DOMContentLoaded", init);

let button;
let buttonHint = false;
let fullscreen = false;
let emptyBackgroundColor = false;

function init() {
    button = document.getElementById("run-button");
    button.addEventListener("click", runButtonClick);
    button.addEventListener("mouseover", () => {
        if(!buttonHint && button.disabled) {
            let rect = button.getBoundingClientRect();
            createContextMenu(rect.right, rect.top, ["Nie można uruchomić pliku tego typu!"], [() => {}]);
            buttonHint = true;
        }
    });
    button.addEventListener("mouseleave", () => {
        if(buttonHint) { 
            removeContextMenu();
            buttonHint = false;
        }
    });
    document.getElementById("output-fullscreen").addEventListener("click", () => {
        let frame = document.getElementById("output-frame");
        let fullscreenButton = document.getElementById("output-fullscreen");
        fullscreen = !fullscreen;
        if(fullscreen) {
            frame.style.position = "absolute";
            frame.style.zIndex = 2;
            frame.style.left = 0;
            frame.style.top = 0;
            fullscreenButton.style.top = "100%";
            if(frame.style.backgroundColor === "" || frame.style.backgroundColor === "transparent") {
                frame.style.backgroundColor = "white";
                emptyBackgroundColor = true;
            }
        } else {
            frame.style.position = "static";
            frame.style.zIndex = 0;
            fullscreenButton.style.removeProperty("left");
            fullscreenButton.style.removeProperty("top");
            if(emptyBackgroundColor) {
                emptyBackgroundColor = false;
                frame.style.backgroundColor = "transparent";
            }
        }
    });
}

function updateRunButton() {
    let name = getCurrentFileName();
    button.disabled = !name.endsWith(".html") && !name.endsWith(".php");
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
    if(name.endsWith(".html")) {
        setOutput(contentDocument, editorCode);
    } else if(name.endsWith(".php")) { 
        simulatePHP(contentDocument, editorCode, getValues, postValues);
    }
}

function simulatePHP(contentDocument, code, getValues, postValues) {
    
    let data = new FormData();
    data.append("vm-sandbox-code", code);
    data.append("vm-sandbox-exam", EXAM_NAME);

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

    let xhr = new XMLHttpRequest();

    xhr.open("POST", "../lib/phpSimulation.php", true);
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
    let lang = newDocument.querySelector("html").getAttribute("lang");
    initializeScripts(parser, newDocument);
    initializeStylesheets(parser, newDocument);
    initializeImages(newDocument);
    // Content document - live document
    contentDocument.write(newDocument.documentElement.innerHTML);
    if(outputCode.startsWith("<!DOCTYPE html>")) {
        let html = contentDocument.querySelector("html");
        html.setAttribute("doctype", "html5");
        html.setAttribute("lang", lang);
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
        let sheets = parser.parseFromString(getFile(EXAM_NAME + source), "text/html").documentElement.textContent;
        styleElement.innerHTML = sheets;
        // hover
        let styleSplit = sheets.replace("\n", "").split("}");
        for(let i = 0; i < styleSplit.length; i++) {
            let selector = styleSplit[i].split("{");
            if(!selector[0].includes(":hover")) {
                continue;
            }
            let elements = newDocument.querySelectorAll(selector[0].split(":hover")[0]);
            for(let j = 0; j < elements.length; j++) {
                elements[j].setAttribute("computed-hover-styles", selector[1].replaceAll("\n", "").replaceAll(" ", "").replaceAll("\t", "").toLowerCase());
            }
        }
        styleElement.setAttribute("autogenerated", true);
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
        image.setAttribute("req-src", source);
        if(isFileExists(EXAM_NAME + source)) {
            image.setAttribute("src", getFile(EXAM_NAME + source));
        } else {
            image.setAttribute("src", "../assets/" + EXAM_NAME + "/" + source);
        }
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

    let getValues = [];

    let split = href.split("?");

    if(split.length > 1) {
        let keyValues = split[1].split("&");
        for(let i = 0; i < keyValues.length; i++) {
            let keyValueSplit = keyValues[i].split("=");
            getValues[getValues.length] = {
                key: keyValueSplit[0],
                value: keyValueSplit[1]
            };
        }
        href = split[0];
    }

    for(let i = 0; i < editorFiles.children.length; i++) {
        let file = editorFiles.children[i];
        if(file.getAttribute("filename") === href) {
            fileClick(file);
            runButtonClick(getValues);
            return;
        }
    }
    window.open(href, "_blank");
}

function formSubmit(form) {
    let formData = new FormData(form);
    let action = form.getAttribute("action");

    let getValues = [];
    let postValues = [];

    if(form.getAttribute("method") === "post") {
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
        if(file.getAttribute("filename") === action || (action == null && file.classList.contains("active"))) {
            fileClick(file);
            runButtonClick(getValues, postValues);
            return;
        }
    }
}

function swapFrames() {
    let oldFrame = document.getElementById("output-frame");
    if(oldFrame != null) {
        oldFrame.remove();
    }
    let iframe = document.createElement("iframe");
    iframe.setAttribute("id", "output-frame");
    let container = document.getElementById("output");
    container.insertBefore(iframe, container.childNodes[1]);
    return iframe;
}