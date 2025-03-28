
init();

let answerKey = [];
let result = [];

function init() {
    downloadExamAnswerKey();
}

function checkExam() {
    clearCheckExamResult();
    for(let i = 0; i < answerKey.files.length; i++) {
        checkExamFile(answerKey.files[i].name, i);
    }
    document.getElementById("virtual-code-dumpster").innerHTML = "";
    let examSummary = document.getElementById("exam-summary");
    for(let i = 0; i < result.length; i++) {
        let span = document.createElement("span");
        span.innerHTML = JSON.stringify(result[i]);
        examSummary.appendChild(span);
    }
}

function checkExamFile(fileName, index) {
    if(!isFileExists(EXAM_NAME + fileName)) {
        addCheckExamError("FILE_NOT_FOUND", fileName);
        return;
    }
    let dumpster = document.getElementById("virtual-code-dumpster");
    let virtualOutput = document.getElementById("virtual-output");
    dumpster.innerHTML = getFile(EXAM_NAME + fileName);

    if(fileName.endsWith(".html")) {
        setOutput(virtualOutput.contentDocument, dumpster.textContent);
    } else if(fileName.endsWith(".php")) {
        simulatePHP(virtualOutput.contentDocument, dumpster.textContent);
    }
    checkExamTag(virtualOutput.contentDocument, "html", answerKey.files[index].root, "");
}

function checkExamTag(contentDocument, tagName, object, previousQuery) {
    let element = contentDocument.querySelector(previousQuery + tagName); 
    console.log(previousQuery + tagName);
    let attributes = Object.keys(object);
    for(let i = 0; i < attributes.length; i++) {
        if(attributes[i] == "tagName") {
            continue;
        }
        if(attributes[i] == "--elements") {
            let children = Object.keys(object[attributes[i]]);
            for(let j = 0; j < children.length; j++) {
                checkExamTag(contentDocument, children[j].tagName, object[attributes[i]][children[j]], previousQuery + " " + tagName);
            }
            continue;
        } else if(attributes[i] == "--content") {
            if(element.innerText != object[attributes[i]]) {
                addCheckExamError("CONTENT_ERROR", attributes[i] + ": is " + element.innerText + ", should be " + object[attributes[i]]);
            }
            continue;
        }
        if(element.getAttribute(attributes[i]) != object[attributes[i]]) {
            addCheckExamError("ATTRIBUTE_ERROR", attributes[i] + ": is "+ element.getAttribute(attributes[i]) + ", should be " + object[attributes[i]]);
        }
    }
}

function addCheckExamError(name, message) {
    addCheckExamCallback(name, message, "ERROR");
}

function addCheckExamResult(name, message) {
    addCheckExamCallback(name, message, "RESULT");
}

function addCheckExamCallback(name, message, type) {
    result[result.length] = {
        name: name,
        message: message,
        type: type
    }
}

function clearCheckExamResult() {
    result = [];
}

function downloadExamAnswerKey() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "../assets/" + EXAM_NAME + "/exam.json", true);
    xhr.onload = function () {
        answerKey = JSON.parse(this.responseText);
    };
    xhr.send();
}