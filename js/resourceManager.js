
const HEADER = "HEADEROF-"

function getFile(name) {
    return window.localStorage.getItem(name);
}

function getFileHeader(name) {
    return window.localStorage.getItem(HEADER + name);
}

function saveFile(name, content, header) {
    window.localStorage.setItem(name, content);
    window.localStorage.setItem(HEADER + name, header);
}

function removeFile(name) {
    window.localStorage.removeItem(name);
    window.localStorage.removeItem(HEADER + name);
}