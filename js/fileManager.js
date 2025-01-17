
document.addEventListener("DOMContentLoaded", init);

const EXAM_NAME = "inf_03-";
let editor;
let saveString = [];

function init() {
    editor = document.getElementById("code-editor");
    let files = document.querySelectorAll(".editor-file[filename]");
    for(let i = 0; i < files.length; i++) {
        files[i].addEventListener("click", () => {
            saveCurrentFile();
            for(let j = 0; j < files.length; j++) {
                files[j].classList.remove("active");
            }
            files[i].classList.add("active");
            loadFileIntoEditor(files[i].getAttribute("filename"));
            updateEditorSummary(editor);
        });
    }
    loadFileIntoEditor(getCurrentFileName());
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
    console.log("Saved current file: " + currentFileName);
    let date = new Date();
    saveString[currentFileName] = "<em>Zapisano " + currentFileName + ": " 
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