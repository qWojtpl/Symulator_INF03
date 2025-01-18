
document.addEventListener("DOMContentLoaded", init);

let button;

function init() {
    button = document.getElementById("run-button");
    button.addEventListener("click", buttonClick);
}

function updateRunButton() {
    let name = getCurrentFileName();
    if(!name.endsWith("html") && !name.endsWith("php")) {
        button.disabled = true;
    } else {
        button.disabled = false;
    }
}

function buttonClick() {
    
    if(button.disabled) {
        return;
    }

    saveCurrentFile();
    simulate(document.getElementById("output").contentDocument, getEditorCode(document.getElementById("code-editor")));

}

function simulate(contentDocument, code) {
    
    var data = new FormData();
    data.append("code", code);

    var xhr = new XMLHttpRequest();

    xhr.open("POST", "../lib/simulate.php", true);
    xhr.onload = function () {
        contentDocument.open();
        contentDocument.write(this.responseText);
        contentDocument.close();
    };

    xhr.send(data);

}