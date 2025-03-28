
init();

let answerKey = [];
let result = [];

function init() {
    downloadExamAnswerKey();
}

function checkExam() {
    saveCurrentFile();
    clearCheckExamResult();
    for(let i = 0; i < answerKey.length; i++) {
        if(!answerKey[i].startsWith("@")) {
            continue;
        }
        checkExamFile(answerKey[i].replace("@", ""), i);
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

    virtualOutput.remove();
    virtualOutput = document.createElement("iframe");
    virtualOutput.setAttribute("id", "virtual-output");
    dumpster.parentNode.insertBefore(virtualOutput, dumpster.nextSibling);

    dumpster.innerHTML = getFile(EXAM_NAME + fileName);

    let contentDocument = virtualOutput.contentDocument;

    if(fileName.endsWith(".html")) {
        setOutput(contentDocument, dumpster.textContent);
    } else if(fileName.endsWith(".php")) {
        simulatePHP(contentDocument, dumpster.textContent);
    }

    for(let i = index; i < answerKey.length; i++) {
        if(answerKey[i].startsWith("@")) {
            continue;
        }
        checkLine(answerKey[i], contentDocument);
    }
}

function checkLine(line, contentDocument) {
    if(line == "\r\n" || line == "" || line == "\n") {
        return;
    }
    let selectors = line.split(" && ");
    let c = 0;
    for(let i = 0; i < selectors.length; i++) {
        let selector = selectors[i];
        let contentSplit = selector.split(" @");
        if(contentSplit[0].includes(" aside$")) {
            let b = contentSplit[0].replaceAll(" aside$", " aside");
            b += ", " + contentSplit[0].replaceAll(" aside$", " section");
            contentSplit[0] = b;
        }
        if(contentSplit[0].includes(" main$")) {
            let b = contentSplit[0].replaceAll(" main$", " main");
            b += ", " + contentSplit[0].replaceAll(" main$", " main");
            b += ", " + contentSplit[0].replaceAll(" main$", " section");
            contentSplit[0] = b;
        }
        if(contentSplit[0].includes(" main div$")) {
            let b = contentSplit[0].replaceAll(" main div$", " main div");
            b += ", " + contentSplit[0].replaceAll(" main div$", " section section");
            b += ", " + contentSplit[0].replaceAll(" main div$", " main section");
            b += ", " + contentSplit[0].replaceAll(" main div$", " section div");
            contentSplit[0] = b;
        }
        if(contentSplit.length > 1) {
            selectors[i] = contentSplit[0] + " @" + contentSplit[1];
        } else {
            selectors[i] = contentSplit[0];
        }
    }
    for(let i = 0; i < selectors.length; i++) {
        let selector = selectors[i];
        let contentSplit = selector.split(" @");
        let negation = false;
        if(contentSplit[0].startsWith("!")) {
            negation = true;
            contentSplit[0] = contentSplit[0].replaceAll("!", "");
        }
        let elements = contentDocument.querySelectorAll(contentSplit[0]);
        if(elements.length > 0 && negation) {
            addCheckExamError("Element which is not allowed", line);
            continue;
        } else if(negation) {
            c++;
            continue;
        }
        if(elements.length == 0) {
            addCheckExamError("ELEMENT NOT FOUND", line);
            continue;
        }
        for(let j = 0; j < elements.length; j++) {
            let element = elements[j];
            if(contentSplit.length > 1) {
                let content = contentSplit[1];
                if(content.startsWith("s")) {
                    content = content.substring(2);
                    if(!element.innerHTML.startsWith(content)) {
                        continue;
                    }
                } else {
                    content = content.substring(1);
                    if(element.innerHTML != content) {
                        continue;
                    }
                }
            }
            c++;
            break;
        }
    }
    if(c != selectors.length) {
        addCheckExamCallback("NOT_MEET", line);
    }
} 

function addCheckExamError(name, message) {
    console.log("Error: " + name + " " + message);
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
    xhr.open("GET", "../assets/" + EXAM_NAME + "/exam.key", true);
    xhr.onload = function () {
        answerKey = this.responseText.split("\r\n");
    };
    xhr.send();
}