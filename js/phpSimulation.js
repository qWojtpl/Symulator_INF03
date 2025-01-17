
function simulate(contentDocument, code) {
    
    var data = new FormData();"\n", ""
    data.append("code", code);

    var xhr = new XMLHttpRequest();

    xhr.open("POST", "../simulate.php", true);
    xhr.onload = function () {
        contentDocument.open();
        contentDocument.write(this.responseText);
        contentDocument.close();
    };

    xhr.send(data);

}