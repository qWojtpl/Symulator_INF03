
init();

let answerKey = [];
let answerKeyMessages = [];
let result = [];

function init() {
    downloadExamAnswerKey();
    downloadExamAnswerKeyMessages();
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
        let div = document.createElement("div");
        div.classList.add("exam-summary-result");
        let sign = document.createElement("span");
        if(result[i].type == "ERROR") {
            sign.innerText = "X";
            sign.classList.add("error");
        } else if(result[i].type == "RESULT") {
            sign.innerText = "✓";
            sign.classList.add("ok");
        }
        div.appendChild(sign);
        let message = document.createElement("span");
        message.innerText = answerKeyMessages[result[i].index];
        div.appendChild(message);
        examSummary.appendChild(div);
    }
}

function checkExamFile(fileName, index) {
    if(!isFileExists(EXAM_NAME + fileName)) {
        addCheckExamError("FILE_NOT_FOUND", fileName, index);
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
        checkLine(answerKey[i], contentDocument, i);
    }
}

function checkLine(line, contentDocument, index) {
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
        let cssStyle = false;
        if(contentSplit[0].startsWith("=")) {
            cssStyle = true;
            contentSplit[0] = contentSplit[0].substring(1);
        }
        let elements;
        if(contentSplit[0].startsWith("*") && cssStyle) {
            let dummy = document.createElement("dummy");
            contentDocument.querySelector("body").appendChild(dummy);
            elements = [dummy];
        } else {
            elements = contentDocument.querySelectorAll(contentSplit[0]);
        }
        if(elements.length > 0 && negation) {
            continue;
        } else if(negation) {
            c++;
            continue;
        }
        if(elements.length == 0) {
            continue;
        }
        for(let j = 0; j < elements.length; j++) {
            let element = elements[j];
            if(contentSplit.length > 1) {
                let content = contentSplit[1];
                if(cssStyle) {
                    if(window.getComputedStyle(element)["fontFamily"] != "Cambria") {
                        continue;
                    }
                } else {
                    if(content.startsWith("s")) {
                        content = content.substring(2);
                        if(!element.innerHTML.startsWith(content)) {
                            continue;
                        }
                    } else {
                        content = content.substring(1);
                        let currentContent = element.innerHTML;
                        currentContent = currentContent.replaceAll("\t", "");
                        if(currentContent != content) {
                            continue;
                        }
                    }
                }
            }
            c++;
            break;
        }
    }
    if(c != selectors.length) {
        addCheckExamError("NOT_MEET", index);
    } else {
        addCheckExamResult("RESULT_OK", index);
    }
} 

function addCheckExamError(name, index) {
    addCheckExamCallback(name, index, "ERROR");
}

function addCheckExamResult(name, index) {
    addCheckExamCallback(name, index, "RESULT");
}

function addCheckExamCallback(name, index, type) {
    result[result.length] = {
        name: name,
        index: index,
        type: type
    }
}

function clearCheckExamResult() {
    result = [];
    let elements = document.querySelectorAll("#exam-summary div.exam-summary-result, #exam-summary dummy");
    for(let i = 0; i < elements.length; i++) {
        elements[i].remove();
    }
}

function downloadExamAnswerKey() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "../assets/" + EXAM_NAME + "/exam.key", true);
    xhr.onload = function () {
        answerKey = this.responseText.split("\r\n");
    };
    xhr.send();
}

function downloadExamAnswerKeyMessages() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "../assets/" + EXAM_NAME + "/exam-messages.key", true);
    xhr.onload = function () {
        answerKeyMessages = this.responseText.split("\r\n");
    };
    xhr.send();
}