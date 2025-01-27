
document.addEventListener("DOMContentLoaded", init);

let photopeaOptions;
let i = 0;

function init() {
    loadPhotopeaOptions();
}

function createPhotoEditor(photoEditor) {
    photoEditor.src = "https://www.photopea.com#" + encodeURIComponent(JSON.stringify(photopeaOptions));
}

function exportImg() {
    let w = document.getElementById("photo-editor").contentWindow;
    w.postMessage("app.activeDocument.saveToOE('png')", "*");
    window.addEventListener("message", onMessage);
}

function onMessage(e) {
    if(e.data.length < 20) {
        return;
    }
    // Step 1: Create a Uint8Array from the ArrayBuffer
    const uint8Array = new Uint8Array(e.data);

    // Step 2: Convert Uint8Array to binary string
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
    }

    document.getElementById("code-editor").innerHTML = "<img src='data:image/png;base64," + btoa(binaryString) + "'>";
}

function loadPhotopeaOptions() {
    var xhr = new XMLHttpRequest();

    xhr.open("GET", "../js/options/photopea.json", true);
    xhr.onload = function () {
        photopeaOptions = JSON.parse(this.responseText);
    };

    xhr.send();
}