
document.addEventListener("DOMContentLoaded", init);

function init() {
    updateCurrentSpaceUsage();
    document.getElementById("clear-space").addEventListener("click", clearStorageClick);
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