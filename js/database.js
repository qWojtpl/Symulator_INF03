
document.addEventListener("DOMContentLoaded", init);

let databaseFrame;
let movingTable;
let startX;
let startY;
let tables = [];

function init() {
    databaseFrame = document.getElementById("database-structure");
    initDatabaseStyles();
    databaseFrame.contentDocument.addEventListener("mousemove", (e) => {
        if(movingTable == null) {
            return;
        }
        let rect = movingTable.getBoundingClientRect();
        let posX = e.pageX - (startX - rect.x);
        movingTable.style.left = posX;
        startX = e.pageX;
        let posY = e.pageY - (startY - rect.y);
        movingTable.style.top = posY;
        startY = e.pageY;
    });
    createTable("test", ["id"], ["int PK"]);
    createTable("test", ["id"], ["int PK"]);
}

function initDatabaseStyles() {
    let css = document.createElement("link");
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("href", "../css/database.css");
    databaseFrame.contentDocument.querySelector("head").appendChild(css);
    css = document.createElement("link");
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("href", "../css/fonts.css");
    databaseFrame.contentDocument.querySelector("head").appendChild(css);
}

function createTable(name, columns, columnTypes) {
    let contentDocument = databaseFrame.contentDocument;
    let table = contentDocument.createElement("div");
    table.style.left = (tables.length * 300 + 50) + "px";
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
    table.appendChild(tableColumns);
    table.addEventListener("mousedown", (e) => {
        movingTable = table;
        table.style.zIndex = 2;
        startX = e.pageX;
        startY = e.pageY;
    });
    table.addEventListener("mouseup", () => {
        movingTable.style.zIndex = 0;
        movingTable = null;
    });
    tables[tables.length] = table;
    contentDocument.querySelector("body").appendChild(table);
}

