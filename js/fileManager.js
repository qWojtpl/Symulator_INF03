
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
    let c = 0;
    for(let i = 0; i < window.localStorage.length; i++) {
        let key = window.localStorage.key(i);
        if(!key.startsWith(EXAM_NAME)) {
            continue;
        }
        createFileElement(key.replace(EXAM_NAME, ""), i == 0);
        c++;
    }
    if(c == 0) {
        saveFile(EXAM_NAME + "index.php", "");
        createFileElement("index.php", true);
    }
    loadFileIntoEditor(getCurrentFileName());
}

function fileClick(element) {
    saveCurrentFile();
    files = document.querySelectorAll(".editor-file[filename]");
    for(let j = 0; j < files.length; j++) {
        files[j].classList.remove("active");
    }
    element.classList.add("active");
    loadFileIntoEditor(element.getAttribute("filename"));
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
    element.addEventListener("click", (e) => {
        let el = e.target;
        if(!el.classList.contains("editor-file")) {
            el = el.parentElement;
        }
        fileClick(el);
    });
    element.addEventListener("contextmenu", (e) => {
        fileContextMenu(e);
    });
    updateRunButton();
}

function fileContextMenu(e) {
    e.preventDefault();
    let element = e.target;
    if(!element.classList.contains("editor-file")) {
        element = element.parentElement;
    }
    createContextMenu(e.pageX, e.pageY, ["Otwórz", "Zmień nazwę", "Usuń"], [() => { fileClick(element); }, () => { changeFileName(element); }, () => { deleteExistingFile(element); }]);
}

function newFileContextMenu(e) {
    e.preventDefault();
    createContextMenu(e.pageX, e.pageY, ["Stwórz nowy plik"], [() => { createNewFile() }]);
}

function changeFileName(element) {
    let oldName = element.getAttribute("filename");
    let newName = prompt("Wpisz nową nazwę pliku", oldName);
    if(newName == null || newName == "" || newName == oldName) {
        return;
    }
    if(newName.length > 32) {
        alert("Nazwa pliku jest za długa!");
        return;
    }
    if(!checkFileName(newName)) {
        alert("Plik z taką nazwą już istnieje!");
        return;
    }
    let content = getFile(EXAM_NAME + oldName);
    removeFile(EXAM_NAME + oldName);
    saveFile(EXAM_NAME + newName, content);
    element.setAttribute("filename", newName);
    let split = newName.split(".");
    element.children[0].src = "../assets/" + split[split.length - 1] + ".png";
    element.children[1].innerText = newName;
    updateRunButton();
}

function createNewFile() {
    let name = prompt("Wpisz nazwę pliku");
    if(name == null || name == "") {
        return;
    }
    if(name.length > 32) {
        alert("Nazwa pliku jest za długa!");
        return;
    }
    if(!checkFileName(name)) {
        alert("Plik z taką nazwą już istnieje!");
        return;
    }
    saveFile(EXAM_NAME + name, "");
    createFileElement(name, false);
    fileClick(editorFiles.children[editorFiles.children.length - 2]);
    updateRunButton();
}

function deleteExistingFile(element) {
    if(editorFiles.children.length == 2) {
        alert("Nie możesz usunąć wszystkich plików!");
        return;
    }
    let name = element.getAttribute("fileName");
    let confirmation = confirm("Czy na pewno chcesz usunąć plik " + name + "?");
    if(!confirmation) {
        return;
    }    
    removeFile(EXAM_NAME + name);
    element.remove();
    fileClick(editorFiles.children[0]);
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