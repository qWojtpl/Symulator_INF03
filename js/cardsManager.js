
document.addEventListener("DOMContentLoaded", init);

let cards = [];
let currentIndex = 0;
let codeFrame;
let examFrame;

function init() {
    cards[0] = document.getElementById("card-code-result");
    cards[1] = document.getElementById("card-exam-sheet");
    cards[2] = document.getElementById("card-database");
    cards[3] = document.getElementById("card-photos");
    for(let i = 0; i < cards.length; i++) {
        cards[i].addEventListener("click", (e) => {
            if(!e.target.classList.contains("button-card")) {
                cardClick(e.target.parentElement);
            } else { 
                cardClick(e.target);
            }
        });
    }
}

function cardClick(element) {
    let index = getCardIndex(element);
    if(index == currentIndex) {
        return;
    }
    currentIndex = index;
    for(let i = 0; i < cards.length; i++) {
        cards[i].classList.remove("active");
    }
    element.classList.add("active");
    if(index == 0) {
        handleCodeResult();
    } else if(index == 1) {
        handleExamSheet();
    } else if(index == 2) {
        handleDatabase();
    } else if(index == 3) {
        handlePhotos();
    }
}

function getCardIndex(element) {
    for(let i = 0; i < cards.length; i++) {
        if(cards[i] == element) {
            return i;
        }
    }
    return null;
}

function hideAllFrames() {
    document.getElementById("output").style.display = "none";
    document.getElementById("exam-sheet").style.display = "none";
    document.getElementById("photo-editor").style.display = "none";
}

function handleCodeResult() {
    hideAllFrames();
    document.getElementById("output").style.display = "block";
}

function handleExamSheet() {
    hideAllFrames();
    let examFrame = document.getElementById("exam-sheet")
    if(examFrame.getAttribute("src") == null) {
        examFrame.src = "../assets/" + EXAM_NAME + "/" + EXAM_NAME + "_SG.pdf";
    }
    examFrame.style.display = "block";
}

function handlePhotos() {
    hideAllFrames();
    let photoEditor = document.getElementById("photo-editor");
    createPhotoEditor(photoEditor);
    photoEditor.style.display = "block";
}