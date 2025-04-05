
document.addEventListener("DOMContentLoaded", init);

let databaseFrame;
let databaseCanvas;
let movingTable;
let startMove = [];
let tables = [];
let relations = [];
let structure;
const relationColors = ["#0078d4", "#059862", "#aa2e04"];

function init() {
    databaseFrame = document.getElementById("database-structure");
    initDatabaseStyles();
    initCanvas();
    initEvents();
    
    downloadStructure();
}

function initDatabaseStyles() {
    let contentDocument = databaseFrame.contentDocument;
    let css = document.createElement("link");
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("href", "../css/database.css");
    contentDocument.querySelector("head").appendChild(css);
    css = document.createElement("link");
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("href", "../css/fonts.css");
    contentDocument.querySelector("head").appendChild(css);
    contentDocument.querySelector("body").style.overflow = "hidden";
}

function initCanvas() {
    let contentDocument = databaseFrame.contentDocument;
    databaseCanvas = contentDocument.createElement("canvas");
    databaseCanvas.setAttribute("id", "database-structure-canvas");
    contentDocument.querySelector("body").appendChild(databaseCanvas);
}

function initEvents() {
    databaseFrame.contentDocument.addEventListener("mousemove", (e) => {
        if(movingTable == null) {
            return;
        }
        let rect = movingTable.getBoundingClientRect();
        let posX = e.pageX - (startMove[0] - rect.x);
        movingTable.style.left = posX;
        startMove[0] = e.pageX;
        let posY = e.pageY - (startMove[1] - rect.y);
        movingTable.style.top = posY;
        startMove[1] = e.pageY;
        updateRelations();
    });
}

function initStructure() {
    let keys = Object.keys(structure);
    for(let i = 0; i < keys.length; i++) {
        let names = [];
        let types = [];
        for(let j = 0; j < structure[keys[i]].length; j++) {
            names[j] = structure[keys[i]][j][0];
            types[j] = structure[keys[i]][j][1] + " " + structure[keys[i]][j][3] + " " + structure[keys[i]][j][4];
        }
        createTable(keys[i], names, types);
    }
    for(let i = 0; i < keys.length; i++) {
        for(let j = 0; j < structure[keys[i]].length; j++) {
            if(structure[keys[i]][j][3] == "MUL") {
                let split = structure[keys[i]][j][5].split(" ");
                for(let k = 0; k < keys.length; k++) {
                    let found = false;
                    if(split[0] == keys[k]) {
                        for(let l = 0; l < structure[keys[k]].length; l++) {
                            if(split[1] == structure[keys[k]][l][0]) {
                                addRelation(tables[i].children[j], tables[k].children[l]);
                                found = true;
                                break;
                            }
                        }
                    }
                    if(found) {
                        break;
                    }
                }
            }
        }
    }
}

function openStructureTab() {
    document.getElementById("database").style.display = "block";
    updateRelations();
}

function addRelation(element1, element2) {
    relations[relations.length] = {
        firstElement: element1,
        secondElement: element2
    };
    updateRelations();
}

function updateRelations() {
    let frameRect = databaseFrame.getBoundingClientRect();
    databaseCanvas.width = frameRect.width;
    databaseCanvas.height = frameRect.height;
    const context = databaseCanvas.getContext("2d");
    context.clearRect(0, 0, context.width, context.height);
    for(let i = 0; i < relations.length; i++) {
        context.beginPath();
        let firstElementRect = relations[i].firstElement.getBoundingClientRect();
        let secondElementRect = relations[i].secondElement.getBoundingClientRect();
        if(firstElementRect.x > secondElementRect.x) {
            let temp = firstElementRect;
            firstElementRect = secondElementRect;
            secondElementRect = temp;
        }
        context.moveTo(firstElementRect.right, firstElementRect.y + 5);
        context.lineTo(secondElementRect.left - 15, secondElementRect.y + 5);
        context.strokeStyle = relationColors[i % relationColors.length];
        context.stroke();
    }
}

function createTable(name, columns, columnTypes) {
    let contentDocument = databaseFrame.contentDocument;
    let table = contentDocument.createElement("div");
    table.style.left = randomNumber(0, 600);
    table.style.top = randomNumber(0, 600);
    table.classList.add("database-table");
    let tableName = contentDocument.createElement("span");
    tableName.innerText = name;
    table.appendChild(tableName);
    let tableColumns = contentDocument.createElement("table");
    for(let i = 0; i < columns.length; i++) {
        let row = contentDocument.createElement("tr");
        let columnName = contentDocument.createElement("td");
        columnName.innerText = columns[i];
        row.appendChild(columnName);
        let columnType = contentDocument.createElement("td");
        columnType.innerText = columnTypes[i];
        row.appendChild(columnType);
        tableColumns.appendChild(row);
    }
    tables[tables.length] = tableColumns;
    table.appendChild(tableColumns);
    table.addEventListener("mousedown", (e) => {
        movingTable = table;
        table.style.zIndex = 1;
        startMove[0] = e.pageX;
        startMove[1] = e.pageY;
    });
    table.addEventListener("mouseup", () => {
        movingTable.style.zIndex = 0;
        movingTable = null;
    });
    contentDocument.querySelector("body").appendChild(table);
}

function downloadStructure() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "../lib/databaseSimulation.php?structure", true);
    xhr.onload = function () {
        structure = JSON.parse(this.responseText);
        initStructure();
    };
    xhr.send();
    
}

