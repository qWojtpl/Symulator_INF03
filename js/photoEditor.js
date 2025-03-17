
document.addEventListener("DOMContentLoaded", init);

let photopeaOptions;
let imageList;
let imageOpened = false;
let currentOpenedPhoto;

function init() {
    loadPhotopeaOptions();
    loadImageList();
    document.getElementById("photo-editor-save").addEventListener("click", () => {
        saveImage();
    });
    document.getElementById("photo-editor-close").addEventListener("click", () => {
        closeImage();
    });
    document.getElementById("photo-editor-delete").addEventListener("click", () => {
        deleteImage();
    });
    window.addEventListener("message", onFileReceived);
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
    let files = getAllFiles();
    for(let i = 0; i < files.length; i++) {
        if(!files[i].startsWith(EXAM_NAME)) {
            continue;
        }
        if(getFileHeader(files[i]) != "image") {
            continue;
        }
        createPhotoElement(photoList, files[i].replace(EXAM_NAME, ""), getFile(files[i]), true);
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
        openImage(photo, !modified);
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

function openImage(element, isOriginal) {
    let photoName = element.getAttribute("name");
    let base64 = imgToBase64(element.children[0]);
    if(isOriginal) {
        if(!confirm("Czy na pewno chcesz stworzyć kopię oryginalnego pliku i go otworzyć?")) {
            return;
        }
        if(isFileExists(EXAM_NAME + photoName)) {
            let split = photoName.split(".");
            let extension = split[split.length - 1];
            if(split.length > 1) {
                split.pop();
            }
            let oldName = split.join(".");
            let newName = oldName;
            let i = 0;
            do {
                newName = oldName + " (" + ++i + ")." + extension;
            } while(isFileExists(EXAM_NAME + newName));
            photoName = newName;
        }
        saveFile(EXAM_NAME + photoName, base64, "image");
    }
    hideAllFrames();
    imageOpened = true;
    document.getElementById("photo-editor-filename").value = photoName;
    currentOpenedPhoto = photoName;
    photopeaOptions.files = [base64];
    createPhotoEditor();
}

function saveImage() {
    if(currentOpenedPhoto == null) {
        return;
    }
    let newName = document.getElementById("photo-editor-filename").value;
    if(newName != currentOpenedPhoto) {
        if(isFileExists(newName)) {
            alert("Plik z taką nazwą już istnieje!");
            return;
        }
        removeFile(EXAM_NAME + currentOpenedPhoto);
    }

    let split = newName.split(".");

    if(split.length <= 1) {
        alert("Plik obrazu musi posiadać rozszerzenie!");
        return;
    }

    let extension = split[split.length - 1];

    currentOpenedPhoto = newName;

    let photopea = document.getElementById("photo-editor-frame").contentWindow;
    console.log("Sending file request...");
    photopea.postMessage("app.activeDocument.saveToOE('" + extension + "')", "*");
    
}

function onFileReceived(e) {
    if(e.data.length < 20) {
        return;
    }

    console.log("File received.");

    const uint8Array = new Uint8Array(e.data);

    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
    }
    
    let split = currentOpenedPhoto.split(".");
    if(split.length <= 1) {
        alert("Plik obrazu musi posiadać rozszerzenie!");
        return;
    }
    let extension = split[split.length - 1];
    if(extension == "jpg") {
        extension = "jpeg";
    }

    let base64 = "data:image/" + extension + ";base64," + btoa(binaryString);
    saveFile(EXAM_NAME + currentOpenedPhoto, base64, "image");
    closeEditor();
}

function closeImage() {
    if(!confirm("Czy na pewno chcesz zamknąć obraz bez zapisywania go?")) {
        return;
    }
    closeEditor();
}

function deleteImage() {
    if(currentOpenedPhoto == null) {
        return;
    }
    if(!confirm("Czy na pewno chcesz usunąć plik " + currentOpenedPhoto + "?")) {
        return;
    }
    removeFile(EXAM_NAME + currentOpenedPhoto);
    closeEditor();
}

function closeEditor() {
    imageOpened = false;
    currentOpenedPhoto = null;
    hideAllFrames();
    createPhotoList();
}

function createPhotoEditor() {
    let photoEditor = document.getElementById("photo-editor");
    photoEditor.style.display = "block";
    // swapping frames to reload photo editor
    document.getElementById("photo-editor-frame").remove();
    let newFrame = document.createElement("iframe");
    newFrame.setAttribute("id", "photo-editor-frame");
    newFrame.src = "https://www.photopea.com#" + encodeURIComponent(JSON.stringify(photopeaOptions));
    document.getElementById("photo-editor").appendChild(newFrame);
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