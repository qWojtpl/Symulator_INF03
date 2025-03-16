
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

function imgToBase64(imgElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    ctx.drawImage(imgElement, 0, 0);
    return canvas.toDataURL('image/png');
}