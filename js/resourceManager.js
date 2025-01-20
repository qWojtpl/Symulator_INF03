
function getFile(name) {
    return window.localStorage.getItem(name);
}

function saveFile(name, content) {
    window.localStorage.setItem(name, content);
}

function removeFile(name) {
    window.localStorage.removeItem(name);
}