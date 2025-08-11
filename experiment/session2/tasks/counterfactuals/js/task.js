const continueBtn = document.getElementById("continue_btn");
const premise = document.getElementById("premise");
const minor = document.getElementById("minor");
const posAnswerText = document.getElementById("pos_answer_text");
const negAnswerText = document.getElementById("neg_answer_text");
const answerOptions = document.getElementsByName("options");
const taskCounter = document.getElementById("task_counter");

var currentTaskIdx = 0;
var currentTask = null;
var currentContent = null;
var currentTaskStartTime = Date.now();

function shuffle(l) {
    let result = l.slice(0);
    let currentIndex = result.length;
  
    while (currentIndex != 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [result[currentIndex], result[randomIndex]] = [result[randomIndex], result[currentIndex]];
    }
    return result;
}

function resetState() {
    for(let option of answerOptions) {
        option.checked = false;
        option.disabled = false;
    }
    continueBtn.setAttribute("aria-busy", "false");
    continueBtn.disabled = true;
}

function presentTask() {
    if(currentTaskIdx >= tasks.length) {
        continueFn();
    } else {
        if(taskCounter !== null)
            taskCounter.textContent = `Task ${currentTaskIdx + 1 + taskOffset}/${maxTasks}`;

        currentTask = tasks[currentTaskIdx];
        currentContent = contents[currentTaskIdx];

        premise.textContent = `1. ${currentContent["premise"]}`;

        if(currentTask == "MP") {
            minor.textContent = `2. ${currentContent["p"]}`;
            posAnswerText.textContent = currentContent["q"];
            negAnswerText.textContent = currentContent["not_q"];
        } else if(currentTask == "MT") {
            minor.textContent = `2. ${currentContent["not_q"]}`;
            posAnswerText.textContent = currentContent["p"];
            negAnswerText.textContent = currentContent["not_p"];
        } else if(currentTask == "DA") {
            minor.textContent = `2. ${currentContent["not_p"]}`;
            posAnswerText.textContent = currentContent["q"];
            negAnswerText.textContent = currentContent["not_q"];
        } else if(currentTask == "AC") {
            minor.textContent = `2. ${currentContent["q"]}`;
            posAnswerText.textContent = currentContent["p"];
            negAnswerText.textContent = currentContent["not_p"];
        } else {
            console.error("Unknown task, skipping");
            continueFn();
        }

        resetState();
        currentTaskStartTime = Date.now();
    }
}

function init() {
    // Block participants from leaving
    blockLeaving();

    // Prepare contents and tasks
    contents = shuffle(contents);
    tasks = shuffle(tasks);

    for(let option of answerOptions) {
        option.addEventListener("input", function() {
            continueBtn.disabled = false;
        });
    }

    continueBtn.addEventListener("click", async function() {
        // Disable UI
        continueBtn.disabled = true;
        continueBtn.setAttribute("aria-busy", "true");
        let response = null;
        for(let option of answerOptions) {
            option.disabled = true;
            if(option.checked) response = option.value;
        }

        // Save and continue with next task
        let personId = sessionStorage.getItem("personId");

        let payload = {
            "id": personId,
            "page" : pageName,
            "page_time" : Date.now() - pageStartTime,
            "task": currentTask,
            "item": currentContent["item"],
            "response": response,
            "rt": Date.now() - currentTaskStartTime,
            "contents": currentContent
        }
        console.log(payload);
        let success = await writeData(payload);
        if(success) {
            currentTaskIdx += 1;
            presentTask();
        } else {
            alert("Could not save data. Please contact us for assistance.")
        }

    });

    presentTask();
}

window.addEventListener("load", init);