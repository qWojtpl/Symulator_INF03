
document.addEventListener("DOMContentLoaded", init);

let navTimer;
let time;

function init() {
    navTimer = document.getElementById("time");
    if(isFileExists(EXAM_NAME + "timer")) {
        startTimer(getFile(EXAM_NAME + "timer"));
    } else {
        startTimer(0);
    }
}

function startTimer(startTime) {
    time = startTime;
    setInterval(() => {
        time = updateTimer(time);
        saveFile(EXAM_NAME + "timer", time, "meta");
    }, 1000);
}

function updateTimer(time) {
    time++;
    navTimer.innerText = getTimerText(time);
    return time;
}

function getTimerText(time) {
    let minutes = parseInt(time / 60);
    let seconds = time % 60;
    return (minutes < 10 ? "0" + minutes.toString() : minutes) + ":" + (seconds < 10 ? "0" + seconds.toString() : seconds)
}