const lightUpDuration = 500;
const timeBetweenLight = 1000;
const initialWaitTime = 1000;
const onClickLightUpDuration = 500;

const repeatSequenceText = document.getElementById("current_phase_text");
const continueBtn = document.getElementById("continue_btn");

var currentTaskIdx = 0;
var withinSequenceIdx = 0;
var isRunning = false;
var currentSequence = null;
var isInAnsweringPhase = false;
var currentLength = 0;
var correctWithinLength = 0;
var tasksWithSameLength = 0;

var enteredBlocks = [];
var sequenceStartTime = Date.now();

var answeredSequence = [];
var answeringStartTime = Date.now();

function startSequence() {
    withinSequenceIdx = 0;
    currentSequence = corsiSequences[currentTaskIdx];

    if(currentSequence.length > currentLength) {
        currentLength = currentSequence.length;
        correctWithinLength = 0;
        tasksWithSameLength = 0;
    }

    isRunning = true;
    isInAnsweringPhase = false;
    repeatSequenceText.innerHTML = "";
    continueBtn.disabled = true;

    enteredBlocks = [];
    sequenceStartTime = Date.now();
    console.log("Starting sequence", currentSequence);
    setTimeout(lightCurrentBlock, initialWaitTime);
}

function lightCurrentBlock() {
    let currentBlockId = currentSequence[withinSequenceIdx];
    let currentBlock = document.getElementById(`block_${currentBlockId}`);
    currentBlock.setAttribute("lighted", "true");
    console.log("Lighted up block", currentBlockId);
    setTimeout(lightOffCurrentBlock, lightUpDuration);
}

function lightOffCurrentBlock() {
    let currentBlockId = currentSequence[withinSequenceIdx];
    let currentBlock = document.getElementById(`block_${currentBlockId}`);
    currentBlock.setAttribute("lighted", "false");
    console.log("Turned off block", currentBlockId);
    withinSequenceIdx += 1;
    if(withinSequenceIdx < currentSequence.length) {
        setTimeout(lightCurrentBlock, timeBetweenLight);
    }
    else {
        isRunning = false;
        isInAnsweringPhase = true;
        answeredSequence = [];
        answeringStartTime = Date.now();
        repeatSequenceText.innerHTML = "<span id='green_circle'>&#128994;</span> Repeat the sequence, then click on continue";
        console.log("Waiting for answer sequence");
    }
}

function blockClicked(e) {
    if(!isInAnsweringPhase) return;
    if(e.target.getAttribute("lighted") == "true") {
        return;
    }

    setTimeout(function() {
        e.target.setAttribute("lighted", "false");
    }, onClickLightUpDuration);
    e.target.setAttribute("lighted", "true");
    answeredSequence.push({
        "block": parseInt(e.target.getAttribute("value")),
        "time": Date.now() - answeringStartTime
    });
    continueBtn.disabled = false;
}

function arrayEquals(a, b) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
}

async function lockInSequence() {
    if(!isInAnsweringPhase) return;

    continueBtn.setAttribute("aria-busy", "true");
    continueBtn.disabled = true;
    isInAnsweringPhase = false;

    let plainAnswers = answeredSequence.map((elem) => elem["block"]);
    let isCorrect = arrayEquals(currentSequence, plainAnswers);
    tasksWithSameLength += 1;
    if(isCorrect) {
        correctWithinLength += 1;
    }

    let personId = sessionStorage.getItem("personId");
    let payload = {
        "id": personId,
        "page" : corsiPageName,
        "rt" : Date.now() - answeringStartTime,
        "length": currentLength,
        "sequence": currentTaskIdx,
        "response": answeredSequence,
        "correct": isCorrect,
        "correct_sequence": currentSequence,
        "response_sequence": plainAnswers,
        "observation_mouse": enteredBlocks
    }
    let success = await writeData(payload);
    if(success) {
        continueBtn.setAttribute("aria-busy", "false");

        currentTaskIdx += 1;
        startNextSequence(isCorrect);
    } else {
        alert("Could not save data. Please contact us for assistance.");
    }
}

function startNextSequence(isCorrect) {
    if(!practiceMode) {
        if(tasksWithSameLength >= 2 && correctWithinLength == 0) {
            goNext();
        } else if(currentTaskIdx < corsiSequences.length) {
            startSequence();
        } else {
            goNext();
        }
    } else {
        let feedbackText = document.getElementById("feedback_text");
        let feedbackBox = document.getElementById("feedback_text_box");
        let feedbackBtn = document.getElementById("feedback_btn");
        if(isCorrect) feedbackText.textContent = "Your sequence was correct!";
        else feedbackText.textContent = "Your sequence was wrong!";
        feedbackBtn.disabled = false;
        feedbackBox.hidden = false;
    }
}

function trackObservationStrategy(e) {
    if(isInAnsweringPhase) return;
    enteredBlocks.push({
        "block": parseInt(e.target.getAttribute("value")),
        "time": Date.now() - sequenceStartTime
    });
}

function init() {
    // Block participants from leaving
    blockLeaving();

    // Add click-listeners to blocks
    for(let block of document.getElementsByClassName("corsi_block")) {
        block.addEventListener("click", blockClicked);
        block.addEventListener("mouseenter", trackObservationStrategy);
    }

    continueBtn.addEventListener("click", lockInSequence);

    if(practiceMode) {
        let feedbackBox = document.getElementById("feedback_text_box");
        let feedbackBtn = document.getElementById("feedback_btn");
        feedbackBox.hidden = true;
        feedbackBtn.disabled = true;
        feedbackBtn.addEventListener("click", function() {
            feedbackBox.hidden = true;
            feedbackBtn.disabled = true;
            if(currentTaskIdx < corsiSequences.length) startSequence();
            else goNext();
        });
    }

    startSequence();
}

window.addEventListener("load", init);