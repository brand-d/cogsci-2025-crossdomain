var tasks = [];
var finishedFunction = null;
var pageTitle = null;
var title = document.getElementById("task_title");
var target = document.getElementById("task_target");
var optionA = document.getElementById("task_A");
var optionB = document.getElementById("task_B");
var optionC = document.getElementById("task_C");
var optionD = document.getElementById("task_D");
var continueBtn = document.getElementById("continue_btn");
var currentTaskIdx = 0;
var currentTask = null;
var trialStartTime = Date.now();

var progressBar = null;
var progressText = null;
var progressTimer = null;
var timeLeft = 180;
var imagesLoading = false;

function updateName(name, task) {
    title.textContent = "Mental Rotations - " + name + " " + task;
}

async function loadImage(url, elem) {
    console.info("loading image", url);
    return new Promise((resolve, reject) => {
      elem.onload = () => resolve(elem);
      elem.onerror = reject;
      elem.src = url;
    });
  }

async function updateImages(taskName) {
    continueBtn.disabled = true;
    continueBtn.setAttribute("aria-busy", "true");
    imagesLoading = true;
    await loadImage(`./img/${taskName}.jpg`, target);
    await loadImage(`./img/${taskName}_A.jpg`, optionA);
    await loadImage(`./img/${taskName}_B.jpg`, optionB);
    await loadImage(`./img/${taskName}_C.jpg`, optionC);
    await loadImage(`./img/${taskName}_D.jpg`, optionD);
    imagesLoading = false;
    controlContinueBtn();
    continueBtn.setAttribute("aria-busy", "false");
}

async function presentTrial() {
    for(let elem of document.getElementsByName("option")) {
        elem.checked = false;
    }

    if(currentTaskIdx >= tasks.length) finishedFunction();
    else {
        currentTask = tasks[currentTaskIdx];
        await updateImages(currentTask);
        updateName(pageTitle, `${currentTaskIdx + 1}/${tasks.length}`);
        trialStartTime = Date.now();
        currentTaskIdx += 1;
    }
}

function controlContinueBtn() {
    let numElems = 0;
    for(let elem of document.getElementsByName("option")) {
        if(elem.checked) numElems += 1;
    }
    continueBtn.disabled = numElems != 2;
}

async function init() {
    continueBtn.addEventListener("click", async function() {
        continueBtn.disabled = true;
        continueBtn.setAttribute("aria-busy", "true");
        let responses = [];
        for(let elem of document.getElementsByName("option")) {
            if(elem.checked) responses.push(elem.value);
        }
        
        let personId = sessionStorage.getItem("personId");
        let payload = {
            "id": personId,
            "page" : pageName,
            "task" : currentTask,
            "rt" : Date.now() - trialStartTime,
            "page_time" : Date.now() - pageStartTime,
            "response" : responses
        }
        let success = await writeData(payload);
        continueBtn.setAttribute("aria-busy", "false");
        presentTrial();
    });

    for(let elem of document.getElementsByName("option")) {
        elem.addEventListener("input", controlContinueBtn);
    }

    if(progressBar != null) {
        progressTimer = window.setInterval(updateTimer, 1000);
    }

    presentTrial();
}

function updateTimer() {
    if(timeLeft <= 0) {
        continueBtn.disabled = true;
        continueBtn.setAttribute("aria-busy", "true");
        finishedFunction();
    } else {
        if(imagesLoading) return;
        timeLeft -= 1;
        progressText.textContent = `Time left: ${timeLeft}s`;
        progressBar.value = 180 - timeLeft;
    }
    
}