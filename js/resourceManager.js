
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

function isFileExists(name) {
    for(let i = 0; i < window.localStorage.length; i++) {
        if(window.localStorage.key(i) == name) {
            return true;
        }
    }
    return false;
}

function getAllFiles() {
    files = [];
    for(let i = 0; i < window.localStorage.length; i++) {
        files[files.length] = window.localStorage.key(i);
    }
    files.sort();
    return files;
}

function imgToBase64(imgElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    ctx.drawImage(imgElement, 0, 0);
    return canvas.toDataURL('image/png');
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}