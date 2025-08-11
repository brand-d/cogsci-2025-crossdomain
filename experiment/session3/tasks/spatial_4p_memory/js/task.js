const continueBtn = document.getElementById("continue_btn");
const screens = document.getElementsByClassName("screen");
const taskCounter = document.getElementById("task_counter");

var currentPhase = "premise1";
var currentTaskIdx = 0;
var currentTask = null;

var timer = {
    "premise1": 0,
    "premise2": 0,
    "premise3": 0,
    "premise4": 0,
    "answer": 0
}

var fruitsPresentationList = [
    "Apple",
    "Strawberry",
    "Kiwi",
    "Pear",
    "Banana",
    "Mango",
    "Cherry",
    "Lemon"
]

const fruitsIndexMap = {
    "A": 0,
    "B": 1,
    "C": 2,
    "D": 3,
    "E": 4
}

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

function showOnly(name) {
    for(let screen of screens) {
        if(screen.id != `${name}_div`) screen.hidden = true;
        else screen.hidden = false;
    }
}

function showPremise() {
    if(currentTaskIdx >= tasks.length) {
        onFinished();
        return;
    }

    for(let option of document.getElementsByName("options")) {
        option.checked = false;
    }

    currentTask = tasks[currentTaskIdx];
    fruitsPresentationList = shuffle(fruitsPresentationList);

    for(let i=1; i <= 4; i++) {
        const premText = document.getElementById(`premise${i}_text`);
        let premiseInfo = currentTask[`premise${i}`];
        
        let obj1 = fruitsPresentationList[fruitsIndexMap[premiseInfo[1]]].toLowerCase();
        let obj2 = fruitsPresentationList[fruitsIndexMap[premiseInfo[2]]].toLowerCase();
        premText.textContent = `The ${obj1} is ${premiseInfo[0]} of the ${obj2}`;
    }

    const questionText = document.getElementById("question_text");
    const question = currentTask["question"]["form"];
    let qObj1 = fruitsPresentationList[fruitsIndexMap[question[1]]].toLowerCase();
    let qObj2 = fruitsPresentationList[fruitsIndexMap[question[2]]].toLowerCase();
    if(question[0] == "left" || question[0] == "right") {
        questionText.textContent = `Is the ${qObj1} ${question[0]} of the ${qObj2}?`;
    } else if(question[0] == "between") {
        questionText.textContent = `Is at least one fruit between the ${qObj1} and the ${qObj2}?`;
    } else if(question[0] == "nextto") {
        questionText.textContent = `Is the ${qObj1} next to the ${qObj2}?`;
    } else {
        alert("Invalid question data, please message us for assistance");
    }

    currentPhase = "premise1";
    taskCounter.textContent = `Task ${currentTaskIdx + 1}/${tasks.length}`;
    showOnly(currentPhase);
    startTimer(currentPhase);
    continueBtn.setAttribute("aria-busy", "false");
    continueBtn.disabled = false;
}

function startNextPhase() {
    endTimer(currentPhase);

    if(currentPhase == "premise1")
        currentPhase = "premise2";
    else if(currentPhase == "premise2")
        currentPhase = "premise3";
    else if(currentPhase == "premise3")
        currentPhase = "premise4";
    else if(currentPhase == "premise4")
        currentPhase = "answer";
    else return;

    if(currentPhase == "answer") {
        for(let option of document.getElementsByName("options")) {
            option.checked = false;
            option.disabled = false;
        }
        continueBtn.disabled = true;
    } else {
        continueBtn.disabled = false;
    }
    showOnly(currentPhase);
    startTimer(currentPhase);
}

function startTimer(phase) {
    timer[phase] = Date.now();
}

function endTimer(phase) {
    timer[phase] = Date.now() - timer[phase];
}

function init() {
    // Block participants from leaving
    blockLeaving();

    tasks = shuffle(tasks);

    for(let option of document.getElementsByName("options")) {
        option.addEventListener("input", function() {
            continueBtn.disabled = false;
        });
    }

    continueBtn.addEventListener("click", async function() {
        if(currentPhase != "answer") {
            startNextPhase();
        } else {
            continueBtn.disabled = true;
            continueBtn.setAttribute("aria-busy", "true");
            let response = null;
            endTimer("answer");
            for(let option of document.getElementsByName("options")) {
                if(option.checked) response = option.value;
                option.disabled = true;
            }

            // Save and continue with next task
            let personId = sessionStorage.getItem("personId");

            let charToFruits = {};
            let alphabeth = ["A", "B", "C", "D", "E"];
            for(let i=0; i<5; i++) {
                charToFruits[alphabeth[i]] = fruitsPresentationList[i].toLowerCase();
            }

            let payload = {
                "id": personId,
                "page" : pageName,
                "page_time" : Date.now() - pageStartTime,
                "task": currentTask["task"],
                "question": currentTask["question"]["question_name"],
                "response": response,
                "task_ref": currentTask["task_ref"],
                "full_task": currentTask,
                "premise1_rt": timer["premise1"],
                "premise2_rt": timer["premise2"],
                "premise3_rt": timer["premise3"],
                "premise4_rt": timer["premise4"],
                "rt": timer["answer"],
                "content_map": charToFruits
            }
            let success = await writeData(payload);
            if(success) {
                currentTaskIdx += 1;
                showPremise();
            } else {
                alert("Could not save data. Please contact us for assistance.")
            }
        }
    });

    showPremise();
}

window.addEventListener("load", init);