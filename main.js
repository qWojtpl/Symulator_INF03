

function load() {
    const contentDocument = document.querySelector("iframe").contentDocument;

    var data = new FormData();"\n", ""
    data.append('code', document.querySelector("textarea").value);
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', './simulate.php', true);
    xhr.onload = function () {
        contentDocument.open();
        contentDocument.write(this.responseText);
        contentDocument.close();
    };
    xhr.send(data);

}