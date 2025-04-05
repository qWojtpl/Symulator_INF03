
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
    cards[4] = document.getElementById("check-exam");
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
    if(index == currentIndex && currentIndex != 4) {
        return;
    }
    currentIndex = index;
    for(let i = 0; i < cards.length; i++) {
        cards[i].classList.remove("active");
    }
    if(index != 4) { 
        element.classList.add("active");
    }
    setURLValue("card", index);
    if(index == 0) {
        handleCodeResult();
    } else if(index == 1) {
        handleExamSheet();
    } else if(index == 2) {
        handleDatabase();
    } else if(index == 3) {
        handlePhotos();
    } else if(index == 4) {
        handleExamCheck();
    }
}

function runCardClick(index) {
    cardClick(cards[index]);
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
    let framesToHide = document.getElementsByClassName("right-frame");
    for(let i = 0; i < framesToHide.length; i++) {
        framesToHide[i].style.display = "none";
    }
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

function handleDatabase() {
    hideAllFrames();
    openStructureTab();
}

function handlePhotos() {
    hideAllFrames();
    createPhotoList();
}

function handleExamCheck() {
    hideAllFrames();
    document.getElementById("exam-summary").style.display = "block";
    checkExam();
}