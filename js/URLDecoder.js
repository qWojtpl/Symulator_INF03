
document.addEventListener("DOMContentLoaded", init);

let values = [];

function init() {
    document.title += " " + EXAM_NAME + " - część praktyczna";
    let url = new URL(window.location);

    let params = new URLSearchParams(url.search);

    if(params.has("file")) {
        let file = params.get("file");
        let editorFiles = document.getElementById("editor-files");

        for(let i = 0; i < editorFiles.children.length; i++) {
            if(editorFiles.children[i].getAttribute("filename") == file) {
                fileClick(editorFiles.children[i]);
                break;
            }
        }
    }

    if(params.has("card")) {
        runCardClick(params.get("card"));
    }

}

function setURLValue(key, value) {
    let changedValue = false;
    for(let i = 0; i < values.length; i++) {
        if(values[i].key == key) {
            values[i].value = value;
            changedValue = true;
        }
    }
    if(!changedValue) {
        values[values.length] = {
            key: key,
            value: value
        };
    }
    let valueStr = "";
    for(let i = 0; i < values.length; i++) {
        if(i == 0) {
            valueStr = "?";
        } else {
            valueStr += "&";
        }
        valueStr += values[i].key + "=" + values[i].value;
    }
    let defaultHref = window.location.href.split("?");
    window.history.replaceState({}, "url", defaultHref[0] + valueStr);
}