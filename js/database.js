
document.addEventListener("DOMContentLoaded", init);

let databaseFrame;

function init() {
    databaseFrame = document.getElementById("database");
    createTable("test");
}

function createTable(name) {
    let contentDocument = databaseFrame.contentDocument;
    let table = contentDocument.createElement("div");
    table.innerHTML = name;
    contentDocument.querySelector("body").appendChild(table);
}