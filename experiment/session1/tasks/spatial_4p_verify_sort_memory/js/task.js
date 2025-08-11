const artificialDelay = 150;

var fruitSort = null;
var fruitDiv = document.getElementById("fruit_div");
var taskCounter = document.getElementById("task_counter");
var currentTask = null;
var currentTaskIdx = 0;

var continueBtn = document.getElementById("continue_btn");
var yesBtn = document.getElementById("consistent_btn");
var noBtn = document.getElementById("inconsistent_btn");
var questionDiv = document.getElementById("question_div");
var fixArrangementDiv = document.getElementById("fix_arrangement_div");
var fixArrangementText = document.getElementById("fix_arrangement_text");
var currentPhase = "premises";

var fruitVisualBlocks = [];
var interactions = [];
var response = null;
var initialOrder = null;

var timer = {
    "premises": 0,
    "answer": 0,
    "sorting": 0
}


var fruitsPresentationList = [
    {"unicode": "&#127823;", "name": "Apple"},
    {"unicode": "&#127827;", "name": "Strawberry"},
    {"unicode": "&#129373;", "name": "Kiwi"},
    {"unicode": "&#127824;", "name": "Pear"},
    {"unicode": "&#127820;", "name": "Banana"},
    {"unicode": "&#129389;", "name": "Mango"},
    {"unicode": "&#127826;", "name": "Cherry"},
    {"unicode": "&#127819;", "name": "Lemon"},
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

function makeVisible(name, visible=true) {
    document.getElementById(`${name}_div`).hidden = !visible;
}

function presentTask() {
    currentTask = tasksList[currentTaskIdx];
    questionDiv.hidden = false;
    fixArrangementDiv.hidden = true;

    fruitsPresentationList = shuffle(fruitsPresentationList);
    for(let i=1; i<=4; i++) updatePremise(i);
    updateFruit();
    initialOrder = fruitSort.toArray();

    taskCounter.textContent = `Task ${currentTaskIdx + 1}/${tasksList.length}`;
    currentPhase = "premises";
    timer["premises"] = Date.now();
    interactions = [];
    makeVisible(currentPhase);
    continueBtn.disabled = false;
    continueBtn.setAttribute("aria-busy", "false");
    fruitSort.option("disabled", true);
    fruitDiv.classList.remove("movable");
}

function updatePremise(idx) {
    let name = `premise${idx}`;
    let premiseDef = currentTask[name];
    let obj1 = fruitsPresentationList[fruitsIndexMap[premiseDef[1]]]["name"].toLowerCase();
    let obj2 = fruitsPresentationList[fruitsIndexMap[premiseDef[2]]]["name"].toLowerCase();
    let rel = premiseDef[0];
    let premiseText = `${idx}. The ${obj1} is ${rel} of the ${obj2}`;
    document.getElementById(`${name}_text`).textContent = premiseText;
}

function updateFruit() {
    let model = currentTask["model"];
    for(let i=0; i < 5; i++) {
        let elem = model[i];
        let symbol = fruitsPresentationList[fruitsIndexMap[elem]];
        fruitVisualBlocks[i]["block"].setAttribute("term", elem);
        fruitVisualBlocks[i]["block"].setAttribute("fruit", symbol["name"]);
        fruitVisualBlocks[i]["symbol"].innerHTML = symbol["unicode"];
        fruitVisualBlocks[i]["name"].innerHTML = symbol["name"];
    }
    
    document.getElementById("answer_div").hidden = true;
}

function startSorting(answer) {
    response = answer;
    if(answer == "yes") {
        fixArrangementText.innerHTML = "Was this the arrangement you had in mind?<br>If not, please bring it in the order you imagined.";
    } else {
        fixArrangementText.innerHTML = "Please correct the arrangement above so that it is consistent with the statements.";
    }
	timer["answer"] = Date.now() - timer["answer"];
    fruitSort.option("disabled", false);
    fruitDiv.classList.add("movable");
    questionDiv.hidden = true;
    fixArrangementDiv.hidden = false;
    continueBtn.disabled = false;
    currentPhase = "sorting";
    timer[currentPhase] = Date.now();
}

async function continueFunction() {
    if(currentPhase != "sorting") {
        makeVisible(currentPhase, false);
        timer[currentPhase] = Date.now() - timer[currentPhase];
        startNextPhase();
    } else {
        timer[currentPhase] = Date.now() - timer[currentPhase];
        continueBtn.disabled = true;
        continueBtn.setAttribute("aria-busy", "true");

        fruitSort.option("disabled", true);

        let fruitsToChars = {};
        let alphabeth = ["A", "B", "C", "D", "E"];
        for(let i=0; i<5; i++) {
            fruitsToChars[fruitsPresentationList[i]["name"].toLowerCase()] = alphabeth[i];
        }

        // Determine final fruit order
        let finalFruitNodes = fruitDiv.querySelectorAll(".fruit");
        let finalModel = [];
        let finalFruits = [];
        for(let fruitNode of finalFruitNodes) {
            finalModel.push(fruitNode.getAttribute("term"));
            finalFruits.push(fruitNode.getAttribute("fruit"));
        }

        // Save and continue with next task
        let personId = sessionStorage.getItem("personId");

        let payload = {
            "id": personId,
            "page" : pageName,
            "page_time" : Date.now() - pageStartTime,
            "response": response,
            "response_model" : finalModel,
            "response_fruits": finalFruits,
            "fruit_map": fruitsToChars,
            "premise_rt": timer["premises"],
            "sorting_rt": timer["sorting"],
            "rt": timer["answer"],
            "task": currentTask["task_id"],
            "presented_model": currentTask["model"],
            "valid": currentTask["valid"],
            "continuous": currentTask["continuous"],
            "indeterminate": currentTask["indeterminate"],
            "interactions": interactions
        }

        let success = await writeData(payload);
        if(success) {
            currentTaskIdx += 1;
            if(currentTaskIdx >= tasksList.length) {
                onFinished();
            } else {
                fruitSort.sort(initialOrder);
                presentTask();
            }
        } else {
            alert("Could not save data. Please contact us for assistance.")
        }
    }
}

function startNextPhase() {
    continueBtn.disabled = true;

    if(currentPhase == "premises") currentPhase = "answer";

    window.setTimeout(function() {
        timer[currentPhase] = Date.now();
        if(currentPhase != "answer") {
            continueBtn.disabled = false;
        }
        else {
            for(let option of document.getElementsByName("consistency")) {
                option.checked = false;
                option.disabled = false;
            }
            continueBtn.disabled = true;
        }
        makeVisible(currentPhase);
    }, artificialDelay);
}

function init() {
    // Block participants from leaving
    blockLeaving();

    // Make the fruits sortable
    fruitSort = new Sortable(fruitDiv, {
        swapThreshold: 1,
        animation: 150,
        direction: "horizontal",
        swap: false,
        forceFallback: true,
        ghostClass: 'drag_from',
        swapClass: 'drag_to',
    });
    fruitDiv.addEventListener("update", function(e) {
        // Determine final fruit order
        let finalFruitNodes = fruitDiv.querySelectorAll(".fruit");
        let order = [];
        for(let fruitNode of finalFruitNodes) {
            order.push(fruitNode.getAttribute("fruit"));
        }
        interactions.push({
            "order": order,
            "time": Date.now() - timer["sorting"]
        });
    });

    // Create fruit visual block list
    for(let i=1; i <= 5; i++) {
        fruitVisualBlocks.push({
            "block": document.getElementById(`fruit${i}_block`),
            "symbol": document.getElementById(`fruit${i}`),
            "name": document.getElementById(`fruit${i}_text`)
        });
    }

    // Shuffle the tasks
    tasksList = shuffle(tasksList);

    // Add continue Btn
    continueBtn.addEventListener("click", continueFunction);

    // Add response radio button logic
    for(let option of document.getElementsByName("consistency")) {
        option.addEventListener("input", function() {
            continueBtn.disabled = false;
        });
    }

    // Add response buttons logic
    yesBtn.addEventListener("click", function() {
        startSorting("yes");
    });
    noBtn.addEventListener("click", function() {
        startSorting("no");
    });

    // Start experiment
    presentTask();
}

window.addEventListener("load", init);