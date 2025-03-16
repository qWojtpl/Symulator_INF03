
document.addEventListener("DOMContentLoaded", init);

let photopeaOptions;
let imageList;
let imageOpened = false;

function init() {
    loadPhotopeaOptions();
    loadImageList();
}

function createPhotoList() {
    if(imageOpened) {
        createPhotoEditor();
        return;
    }
    let photoList = document.getElementById("photo-list");
    photoList.innerHTML = "";
    photoList.style.display = "flex";
    for(let i = 0; i < imageList.length; i++) {
        createPhotoElement(photoList, imageList[i].name, "../assets/" + EXAM_NAME + "/" + imageList[i].name, false);
    }
    for(let i = 0; i < window.localStorage.length; i++) {
        let key = window.localStorage.key(i);
        if(!key.startsWith(EXAM_NAME)) {
            continue;
        }
        if(getFileHeader(key) != "image") {
            continue;
        }
        createPhotoElement(photoList, key.replace(EXAM_NAME, ""), getFile(key), true);
    }
}

function createPhotoElement(parent, imageName, imageURL, modified) {
    let photo = document.createElement("div");
    photo.classList.add("photo");
    photo.setAttribute("name", imageName);
    let photoImg = document.createElement("img");
    photoImg.setAttribute("src", imageURL);
    photoImg.setAttribute("alt", imageName + " (buffer)");
    photoImg.style.display = "none";
    photo.appendChild(photoImg);
    photo.addEventListener("click", () => {
        openImage(photoImg);
    });
    let photoBackground = document.createElement("div");
    photoBackground.style.backgroundImage = "url('" + imageURL + "')";
    photoBackground.classList.add("photo-background");
    photo.appendChild(photoBackground);
    let photoName = document.createElement("span");
    photoName.innerText = imageName + (modified ? " (zmodyfikowany)" : " (oryginał)");
    photo.appendChild(photoName);
    parent.appendChild(photo);
}

function openImage(element) {
    hideAllFrames();
    imageOpened = true;
    document.getElementById("photo-editor-filename").value = element.getAttribute("name");
    photopeaOptions.files = [imgToBase64(element)];
    createPhotoEditor();
}

function createPhotoEditor() {
    let photoEditor = document.getElementById("photo-editor");
    photoEditor.style.display = "block";
    let photoEditorFrame = document.getElementById("photo-editor-frame");
    photoEditorFrame.src = "https://www.photopea.com#" + encodeURIComponent(JSON.stringify(photopeaOptions));
    
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

function loadImageList() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "../assets/" + EXAM_NAME + "/images.json", true);
    xhr.onload = function () {
        imageList = JSON.parse(this.responseText);
    };
    xhr.send();
}