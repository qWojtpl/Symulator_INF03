
document.addEventListener("DOMContentLoaded", init);

const EXAM_NAME = "inf_034";
let editor;
let editorFiles;
let saveString = [];
let files = [];

function init() {
    editor = document.getElementById("code-editor");
    editorFiles = document.getElementById("editor-files");
    editorFiles.addEventListener("contextmenu", (e) => {
        if(e.target != editorFiles) {
            return;
        }
        newFileContextMenu(e);
    });
    if(window.localStorage.length == 0) {
        createFileElement("index.php", true);
    } else {
        for(let i = 0; i < window.localStorage.length; i++) {
            let key = window.localStorage.key(i);
            if(!key.startsWith(EXAM_NAME)) {
                continue;
            }
            createFileElement(key.replace(EXAM_NAME, ""), i == 0);
        }
    }
    loadFileIntoEditor(getCurrentFileName());
}

function fileClick(i) {
    saveCurrentFile();
    files = document.querySelectorAll(".editor-file[filename]");
    for(let j = 0; j < files.length; j++) {
        files[j].classList.remove("active");
    }
    editorFiles.children[i].classList.add("active");
    loadFileIntoEditor(files[i].getAttribute("filename"));
    updateRunButton();
}

function createFileElement(name, active) {
    let editorFiles = document.getElementById("editor-files");
    let element = document.createElement("div");
    element.classList.add("editor-file");
    if(active) {
        element.classList.add("active");
    }
    element.setAttribute("filename", name);
    let image = document.createElement("img");
    let split = name.split(".");
    image.src = "../assets/" + split[split.length - 1] + ".png";
    element.appendChild(image);
    let paragraph = document.createElement("p");
    paragraph.innerText = name;
    element.appendChild(paragraph);
    editorFiles.insertBefore(element, editorFiles.children[editorFiles.children.length - 1]);
    let i = editorFiles.children.length - 2;
    element.addEventListener("click", () => {
        fileClick(i);
    });
    element.addEventListener("contextmenu", (e) => {
        fileContextMenu(i, e);
    });
    updateRunButton();
}

function fileContextMenu(i, e) {
    e.preventDefault();
    createContextMenu(e.pageX, e.pageY, ["Otwórz", "Zmień nazwę", "Usuń"], [() => { fileClick(i); }, () => { changeFileName(i); }, () => { deleteExistingFile(i); }]);
}

function newFileContextMenu(e) {
    e.preventDefault();
    createContextMenu(e.pageX, e.pageY, ["Stwórz nowy plik"], [() => { createNewFile() }]);
}

function changeFileName(i) {
    file = editorFiles.children[i];
    let oldName = file.getAttribute("filename");
    let newName = prompt("Wpisz nową nazwę pliku", oldName);
    if(newName == null || newName == "" || newName == oldName) {
        return;
    }
    if(!checkFileName(newName)) {
        alert("Plik z taką nazwą już istnieje!");
        return;
    }
    let content = getFile(EXAM_NAME + oldName);
    removeFile(EXAM_NAME + oldName);
    saveFile(EXAM_NAME + newName, content);
    file.setAttribute("filename", newName);
    let split = newName.split(".");
    file.children[0].src = "../assets/" + split[split.length - 1] + ".png";
    file.children[1].innerText = newName;
}

function createNewFile() {
    let name = prompt("Wpisz nazwę pliku");
    if(name == null || name == "") {
        return;
    }
    if(!checkFileName(name)) {
        alert("Plik z taką nazwą już istnieje!");
        return;
    }
    saveFile(EXAM_NAME + name, "");
    createFileElement(name, false);
    fileClick(editorFiles.children.length - 2);
}

function deleteExistingFile(i) {
    if(editorFiles.children.length == 2) {
        alert("Nie możesz usunąć wszystkich plików!");
        return;
    }
    let file = editorFiles.children[i];
    let name = file.getAttribute("fileName");
    let confirmation = confirm("Czy na pewno chcesz usunąć plik " + name + "?");
    if(!confirmation) {
        return;
    }
    removeFile(EXAM_NAME + name);
    file.remove();
    fileClick(0);
}

function checkFileName(name) {
    files = document.querySelectorAll(".editor-file[filename]");
    for(let i = 0; i < files.length; i++) {
        if(files[i].getAttribute("filename") == name) {
            return false;
        }
    }
    return true;
}

function getFile(name) {
    return window.localStorage.getItem(name);
}

function saveFile(name, content) {
    window.localStorage.setItem(name, content);
}

function removeFile(name) {
    window.localStorage.removeItem(name);
}

function getCurrentFileName() {
    let el = document.querySelector(".editor-file.active[filename]");
    if(el != null) {
        return el.getAttribute("filename");
    }
    return null;
}

function saveCurrentFile() {
    let currentFileName = getCurrentFileName();
    if(currentFileName == null) {
        return;
    }
    saveFile(EXAM_NAME + currentFileName, getEditorFormattedCode(editor));
    createSaveString(currentFileName);
    updateEditorSummary(editor, true);
}

function createSaveString(name) {
    let date = new Date();
    saveString[name] = "<em>Zapisano " + name + ": " 
        + date.toLocaleDateString() + " " + date.toLocaleTimeString() + "</em>";
}

function getSaveString() {
    let str = saveString[getCurrentFileName()];
    if(str == null) {
        return "";
    }
    return str;
}

function loadFileIntoEditor(name) {
    setEditorFormattedCode(editor, getFile(EXAM_NAME + name));
}