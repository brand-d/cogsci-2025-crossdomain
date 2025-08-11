var responseBoxes = document.getElementsByClassName("response_box");
var responseCheckboxes = document.getElementsByClassName("response_checkboxes");
var guessBtn = document.getElementById("guess_btn");
var confidenceBtn = document.getElementById("confidence_btn");
var interactions = [];
var currentTaskIdx = 0;
var currentTask = null;
var taskStartTime = Date.now();

function controlResponseOptions(disabledState) {
    for(let chkbx of responseCheckboxes) {
        chkbx.disabled = disabledState;
    }
}

function fixNvcState(val) {
    if(val == "nvc") {
        for(let chkbx of responseCheckboxes) {
            if(chkbx.getAttribute("value") != "nvc") {
                chkbx.checked = false;
            }
        }
    }
    else {
        for(let chkbx of responseCheckboxes) {
            if(chkbx.getAttribute("value") == "nvc") {
                chkbx.checked = false;
            }
        }
    }
}

function checkContinue() {
    for(let chkbx of responseCheckboxes) {
        if(chkbx.checked) {
            guessBtn.disabled = false;
            confidenceBtn.disabled = false;
            return;
        }
    }
    guessBtn.disabled = true;
    confidenceBtn.disabled = true;
}

async function handleContinue(confidence) {
    controlResponseOptions(true);
    guessBtn.disabled = true;
    guessBtn.setAttribute("aria-busy", "true");
    confidenceBtn.disabled = true;
    confidenceBtn.setAttribute("aria-busy", "true");

    let result = [];
    for(let chkbx of responseCheckboxes) {
        if(chkbx.checked) {
            result.push(chkbx.value);
        }
    }

    let personId = sessionStorage.getItem("personId");

    let payload = {
        "id": personId,
        "page" : "syllogisms_tasks",
        "page_time" : Date.now() - pageStartTime,
        "response" : result,
        "interactions": interactions,
        "task": currentTask["syllogism"],
        "terms" : currentTask["content"],
        "confidence": confidence,
        "rt" : Date.now() - taskStartTime,
    }

    let success = await writeData(payload);
    if(success) {
        currentTaskIdx += 1;
        if(currentTaskIdx >= syllogisms.length)
            changePage("some_all.html");
        else {
            presentTask();
        }
    }
    else {
        alert("Could not save data. Please contact us for assistance.")
    }
}

function presentTask() {
    confidenceBtn.disabled = true;
    guessBtn.disabled = true;
    

    for(let chkbx of responseCheckboxes) {
        chkbx.checked = false;
        chkbx.disabled = true;
    }

    currentTask = getTask(currentTaskIdx);
    let premises = createSyllogText(currentTask);
    document.getElementById("premise1").textContent = premises["prem1"];
    document.getElementById("premise2").textContent = premises["prem2"];

    document.getElementById("Aac").textContent = createConclusion("A", "ac", currentTask["content"]);
    document.getElementById("Aca").textContent = createConclusion("A", "ca", currentTask["content"]);
    document.getElementById("Iac").textContent = createConclusion("I", "ac", currentTask["content"]);
    document.getElementById("Ica").textContent = createConclusion("I", "ca", currentTask["content"]);
    document.getElementById("Eac").textContent = createConclusion("E", "ac", currentTask["content"]);
    document.getElementById("Eca").textContent = createConclusion("E", "ca", currentTask["content"]);
    document.getElementById("Oac").textContent = createConclusion("O", "ac", currentTask["content"]);
    document.getElementById("Oca").textContent = createConclusion("O", "ca", currentTask["content"]);

    for(let chkbx of responseCheckboxes) {
        chkbx.checked = false;
        chkbx.disabled = false;
    }
    confidenceBtn.setAttribute("aria-busy", "false");
    guessBtn.setAttribute("aria-busy", "false");

    taskStartTime = Date.now();
    document.getElementById("title_text").textContent = `Task ${currentTaskIdx + 1}/${syllogisms.length}`;
    interactions = [];
}

function init() {
    blockLeaving();

    for(let chkbx of responseCheckboxes) {
        chkbx.addEventListener("change", function(e) {
            interactions.push({
                "time": Date.now() - taskStartTime,
               "option": chkbx.getAttribute("value"),
                "state": chkbx.checked
            });
            fixNvcState(chkbx.getAttribute("value"));
            checkContinue();
        });
    }

    for(let box of responseBoxes) {
        box.addEventListener("click", function(evt) {
            let chkbx = document.getElementById(this.getAttribute("for"));
            if(evt.target == chkbx) return;
             if(chkbx.disabled) return;
            chkbx.checked = !chkbx.checked;
            chkbx.focus();
            interactions.push({
                "time": Date.now() - taskStartTime,
                "option": chkbx.getAttribute("value"),
                "state": chkbx.checked
            });

            fixNvcState(chkbx.getAttribute("value"));
            checkContinue();
        });
    }

    guessBtn.addEventListener("click", function() {
        handleContinue("guessed");
    });
    confidenceBtn.addEventListener("click", function() {
        handleContinue("confident");
    });

    // Init syllogisms
    shuffleTasks();

    // Start experiment
    presentTask();
}

window.addEventListener("load", init);