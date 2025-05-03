
document.addEventListener("DOMContentLoaded", init);

function init() {
    updateCurrentSpaceUsage();
    document.getElementById("clear-space").addEventListener("click", clearStorageClick);
    registerExamListeners();
}

function updateCurrentSpaceUsage() {
    let usage = (getTotalSizeInKB() / 1024).toFixed(2);
    let usageColor = "lightgreen";
    if(usage > 3) {
        usageColor = "orange";
    }
    if(usage > 4.5) {
        usageColor = "red";
    }
    document.getElementById("current-space-usage").innerHTML = "<span style='color: " + usageColor + "'>" + usage + " MB</span>";
}

function clearStorageClick() {
    if(!confirm("Uwaga! Wyczyszczenie pamięci spowoduje usunięcie Twoich dotychczasowych kodów i obrazków egzaminów. Czy na pewno chcesz to zrobić?")) {
        return;
    }
    clearStorage();
    updateCurrentSpaceUsage();
}

function registerExamListeners() {
    let exams = document.querySelectorAll(".exam");
    for(let i = 0; i < exams.length; i++) {
        exams[i].addEventListener("click", () => {
            window.location.href = "./exam/?exam=" + exams[i].getAttribute("exam-id");
        });
    }
}