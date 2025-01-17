
document.addEventListener("DOMContentLoaded", init);

const EXAM_NAME = "inf_03-";
let editor;
let saveString = [];
let files = [];

function init() {
    editor = document.getElementById("code-editor");
    files = document.querySelectorAll(".editor-file[filename]");
    for(let i = 0; i < files.length; i++) {
        files[i].addEventListener("click", () => {
            fileClick(i);
        });
        files[i].addEventListener("contextmenu", (e) => {
            fileContextMenu(i, e);
        });
    }
    loadFileIntoEditor(getCurrentFileName());
}

function fileClick(i) {
    saveCurrentFile();
    for(let j = 0; j < files.length; j++) {
        files[j].classList.remove("active");
    }
    files[i].classList.add("active");
    loadFileIntoEditor(files[i].getAttribute("filename"));
    updateEditorSummary(editor, true);
}

function fileContextMenu(i, e) {
    e.preventDefault();
    createContextMenu(e.pageX, e.pageY, ["Otwórz"], [() => { fileClick(i); }]);
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