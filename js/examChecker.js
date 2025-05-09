
document.addEventListener("DOMContentLoaded", init);

let answerKey = [];
let answerKeyMessages = [];
let answerKeyDownloadFunction;
let answerKeyMessagesDownloadFunction;
let result = [];
let skipCSS = false;

function init() {
    downloadExamAnswerKey();
    downloadExamAnswerKeyMessages();
    loadImageList();
}

function checkExam() {
    if(answerKey.length === 0) {
        answerKeyDownloadFunction = checkExam;
        return;
    }
    if(answerKeyMessages.length === 0) {
        answerKeyMessagesDownloadFunction = checkExam;
        return;
    }
    if(imageList.length === 0) {
        imageListDownloadFunctions[imageListDownloadFunctions.length] = checkExam;
        return;
    }
    saveCurrentFile();
    clearCheckExamResult();
    document.querySelector("#exam-summary-time span").innerText = getTimerText(time);
    for(let i = 0; i < answerKey.length; i++) {
        if(!answerKey[i].startsWith("@")) {
            continue;
        }
        checkExamFile(answerKey[i].replace("@", ""), i);
    }
    document.getElementById("virtual-code-dumpster").innerHTML = "";
    let examSummary = document.getElementById("exam-summary");
    for(let i = 0; i < result.length; i++) {
        if(result[i].type === "TITLE") {
            let title = document.createElement("h1");
            title.innerText = answerKeyMessages[result[i].index];
            title.classList.add("exam-summary-title");
            examSummary.appendChild(title);
            continue;
        }
        let div = document.createElement("div");
        div.classList.add("exam-summary-result");
        let sign = document.createElement("span");
        if(result[i].type === "ERROR") {
            sign.innerText = "X";
            sign.classList.add("error");
        } else if(result[i].type === "RESULT") {
            sign.innerText = "✓";
            sign.classList.add("ok");
        } else if(result[i].type === "NEUTRAL") {
            sign.innerText = "─";
            sign.classList.add("neutral");
        }
        div.appendChild(sign);
        let message = document.createElement("span");
        let answerKeySplit = answerKeyMessages[result[i].index].split(" @@@ ");
        message.innerText = answerKeySplit[0];
        div.appendChild(message);
        examSummary.appendChild(div);
        if(answerKeySplit.length > 1) {
            div.addEventListener("mouseover", () => {
                let position = div.getBoundingClientRect();
                createContextMenu(position.x * 0.99, position.bottom * 1.01, [answerKeySplit[1]], [() => {}], 20);
            });
            div.addEventListener("mouseleave", () => {
                removeContextMenu();
            });
        }
    }
    for(let i = 0; i < imageList.length; i++) {
        checkExamImage(imageList[i]);
    }
}

function checkExamImage(image) {
    let imageName = image.expected;
    let wrongExtension = false;
    let examSummary = document.getElementById("exam-summary");

    if(!isFileExists(EXAM_NAME + image.expected)) {
        if(isFileExists(EXAM_NAME + image.name)) {
            wrongExtension = true;
            imageName = image.name;
        } else {
            let div = document.createElement("div");
            div.classList.add("exam-summary-result");
            div.innerHTML = "<span class='error'>X</span><span>Nie znaleziono pliku: " + image.expected + "</span>";
            examSummary.insertBefore(div, document.querySelector("#exam-summary div.exam-summary-result"));
            return;
        }
    }

    let expectedImageUrl = "../assets/" + EXAM_NAME + "/" + image.expected + ".resource";

    let expectedImage = new Image();
    let actualImageBase64 = getFile(EXAM_NAME + imageName);
    let actualImage = new Image();
    actualImage.src = actualImageBase64;

    expectedImage.onload = () => {
        resemble(expectedImageUrl)
            .compareTo(actualImageBase64)
            .ignoreAntialiasing()
            .outputSettings({
                errorColor: {
                    red: 255,
                    green: 0,
                    blue: 0
                },
                errorType: "movement",
                transparency: 0.3
            })
            .scaleToSameSize()
            .onComplete(function(data) {
                let div = document.createElement("div");
                div.classList.add("exam-summary-result");
                let compareImage = document.createElement("img");
                compareImage.src = data.getImageDataUrl();
                compareImage.style.width = expectedImage.width + "px";
                compareImage.style.height = expectedImage.height + "px";
                div.appendChild(compareImage);
                let description = document.createElement("div");
                let sign = document.createElement("span");
                let label = document.createElement("span");
                if(wrongExtension) {
                    sign.innerText = "X";
                    sign.classList.add("error");
                    label.innerText = "Twój obraz posiada nieprawidłowe rozszerzenie (jest: " + imageName + ", powinno być: " + image.expected + ")";
                } else {
                    sign.innerText = "✓";
                    sign.classList.add("ok");
                    label.innerText = "Twój obraz posiada prawidłowe rozszerzenie (" + image.expected + ")";
                }
                description.appendChild(sign);
                description.appendChild(label);
                description.appendChild(document.createElement("br"));
                label = document.createElement("span");
                sign = document.createElement("span");
                if(data.rawMisMatchPercentage > 20) {
                    sign.innerText = "X";
                    sign.classList.add("error");
                    label.innerText = "Różnica między Twoim obrazem, a obrazem pożądanym jest za duża: " + data.misMatchPercentage + "%";
                } else {
                    sign.innerText = "✓";
                    sign.classList.add("ok");
                    label.innerText = "Twój obraz jest podobny do obrazu pożądanego: " + data.misMatchPercentage + "% różnicy";
                }
                description.appendChild(sign);
                description.appendChild(label);
                description.appendChild(document.createElement("br"));
                label = document.createElement("span");
                sign = document.createElement("span");
                let widthDifference = Math.abs(expectedImage.width - actualImage.width);
                let heightDifference = Math.abs(expectedImage.height - actualImage.height);
                if(widthDifference > 5 || heightDifference > 5) {
                    sign.innerText = "X";
                    sign.classList.add("error");
                    label.innerText = "Twój obraz ma nieprawidłowe wymiary: " + widthDifference + "px różnicy w szerokości i " + heightDifference + "px w wysokości";
                } else {
                    sign.innerText = "✓";
                    sign.classList.add("ok");
                    label.innerText = "Twój obraz ma prawidłowe wymiary: " + widthDifference + "px różnicy w szerokości i " + heightDifference + "px w wysokości";
                }
                description.appendChild(sign);
                description.appendChild(label);
                description.appendChild(document.createElement("br"));
                div.appendChild(description);
                examSummary.insertBefore(div, document.querySelector("#exam-summary div.exam-summary-result"));
            });
    };

    expectedImage.src = expectedImageUrl;

}

function checkExamFile(fileName, index) {
    if(!isFileExists(EXAM_NAME + fileName)) {
        addCheckExamError(index);
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
        setOutput(contentDocument, dumpster.textContent); // text content is a plain html/php
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
    // check for empty line
    if(line === "\r\n" || line === "" || line === "\n") {
        return;
    }
    // ~ means that the line cannot be determined due to limitations (e.g. variable names in Polish/English)
    if(line.startsWith("~")) {
        addCheckExamNeutral(index);
        return;
    } else if(line.startsWith("?")) { // ? means that the line is a title line
        addCheckExamTitle(index);
        return;
    }
    // if decideCSS line isn't meet, all CSS won't be meet
    let decideCSS = false;
    if(line.startsWith("|")) {
        decideCSS = true;
        line = line.substring(1);
    }
    // when the line starts with '=' then it's a CSS line
    let cssStyle = false;
    if(line.startsWith("=")) {
        cssStyle = true;
        line = line.substring(1);
    }
    let jsScript = false;
    if(line.startsWith("$")) {
        jsScript = true;
        line = line.substring(1);
    }
    // one line can contain multiple selectors - separated with &&
    let selectors;
    if(!jsScript) {
        selectors = line.split(" && ");
    } else {
        selectors = [line];
    }
    // when selector will be meet, c increases by 1
    let c = 0;
    // add multiple-selector support (<main><div> could be <main><section> etc.)
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
            b += ", " + contentSplit[0].replaceAll(" main div$", " main section");
            contentSplit[0] = b;
        }
        if(contentSplit.length > 1) {
            selectors[i] = contentSplit[0] + " @" + contentSplit[1];
        } else {
            selectors[i] = contentSplit[0];
        }
    }
    for(let i = 0; i < selectors.length; i++) {
        // skipping CSS (if decideCSS failed) and it is CSS line (starts with =)
        if(skipCSS && cssStyle) {
            continue;
        }
        let selector = selectors[i];
        // content is everything in one selector that is after @ sign
        let contentSplit = selector.split(" @");
        let negation = false;
        // if the selector starts with ! then it's a negation - if the selector condition is meet, then line condition is not meet
        if(contentSplit[0].startsWith("!")) {
            negation = true;
            // remove ! from the selector
            contentSplit[0] = contentSplit[0].replaceAll("!", "");
        }
        let elements;
        let dummy;
        // create a dummy element to check * in CSS
        if(contentSplit[0].startsWith("*") && cssStyle) {
            dummy = document.createElement("dummy");
            contentDocument.querySelector("body").appendChild(dummy);
            elements = [dummy];
        } else {
            // get all elements from a selector
            elements = contentDocument.querySelectorAll(contentSplit[0]);
        }
        // if we negate and there is any element selector is skipped
        if(elements.length > 0 && negation) {
            break;
        } else if(negation) {
            c++;
            continue;
        }
        // if there are no elements, then line condition won't be met
        if(elements.length === 0) {
            break;
        }
        if(cssStyle) {
            c = selectors.length;
        }
        for(let j = 0; j < elements.length; j++) {
            let element = elements[j];
            if(contentSplit.length > 1) {
                let content = contentSplit[1];
                // handle CSS styles
                if(cssStyle) {
                    let cssSplit = content.split(":");
                    // handle dashed property (e.g., background-color to backgroundColor)
                    let dashedProperty = createDashedProperty(cssSplit[0]);
                    // if at least one CSS property is not met, we exit the loop
                    if(window.getComputedStyle(element)[dashedProperty] !== cssSplit[1]) {
                        c = 0;
                        break;
                    }
                    // in CSS styles c variable is set to the required value, but if at least one property is not met, we set c to 0 and exit the loop
                    continue;
                } else if(jsScript) {
                    let res = eval("function runTest() { " + content + "} runTest();");
                    if(res) {
                        console.log("JS test " + (index + 1) + " passed");
                    } else {
                        console.log("JS test " + (index + 1) + " failed");
                        break;
                    }
                } else {
                    // if content starts with s (@s) then element's text must start with this content
                    if(content.startsWith("s")) {
                        content = content.substring(2);
                        if(!element.innerHTML.startsWith(content)) {
                            continue;
                        }
                    } else { // check strict content
                        content = content.substring(1);
                        let currentContent = element.innerHTML;
                        currentContent = currentContent.replaceAll("\t", "");
                        if(currentContent.replaceAll('"', "") !== content) {
                            continue;
                        }
                    }
                }
            }
            c++;
            break;
        }
        if(dummy != null) {
            dummy.remove();
        }
    }
    if(c !== selectors.length) {
        // line is not meet
        addCheckExamError(index);
        if(decideCSS) {
            skipCSS = true;
        }
    } else {
        // line is meet
        addCheckExamResult(index);
    }
} 

function addCheckExamError(index) {
    addCheckExamCallback(index, "ERROR");
}

function addCheckExamNeutral(index) {
    addCheckExamCallback(index, "NEUTRAL");
}

function addCheckExamTitle(index) {
    addCheckExamCallback(index, "TITLE");
}

function addCheckExamResult(index) {
    addCheckExamCallback(index, "RESULT");
}

function addCheckExamCallback(index, type) {
    result[result.length] = {
        index: index,
        type: type
    }
}

function createDashedProperty(property) {
    let dashedProperty = "";
    for(let k = 1; k < property.length; k++) {
        dashedProperty += property.charAt(k);
        if(property.charAt(k + 1) === '-') {
            dashedProperty += property.charAt(k + 2).toUpperCase();
            k += 2;
        }
    }
    return dashedProperty;
}

function clearCheckExamResult() {
    result = [];
    skipCSS = false;
    let elements = document.querySelectorAll("#exam-summary div.exam-summary-result, #exam-summary dummy, .exam-summary-title");
    for(let i = 0; i < elements.length; i++) {
        elements[i].remove();
    }
}

function downloadExamAnswerKey() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "../assets/" + EXAM_NAME + "/exam.key", true);
    xhr.onload = function () {
        answerKey = this.responseText.split("\r\n");
        if(answerKeyDownloadFunction != null) {
            answerKeyDownloadFunction();
            answerKeyDownloadFunction = null;
        }
    };
    xhr.send();
}

function downloadExamAnswerKeyMessages() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "../assets/" + EXAM_NAME + "/exam-messages.key", true);
    xhr.onload = function () {
        answerKeyMessages = this.responseText.split("\r\n");
        if(answerKeyMessagesDownloadFunction != null) {
            answerKeyMessagesDownloadFunction();
            answerKeyMessagesDownloadFunction = null;
        }
    };
    xhr.send();
}