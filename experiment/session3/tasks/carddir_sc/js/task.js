const termsList = ['bank', 'bar', 'bridge', 'church', 'gym', 'hotel', 'mall', 'market', 'museum', 'school', 'station', 'store'];
const directions = ['east', 'north', 'north-east', 'north-west', 'south', 'south-east', 'south-west', 'west'];

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
    
var tasks = shuffle([
    {"dir1": "west", "dir2": "west", "item": "west_west"},
    {"dir1": "east", "dir2": "north-east", "item": "east_north-east"},
    {"dir1": "west", "dir2": "north", "item": "west_north"},
    {"dir1": "east", "dir2": "north-west", "item": "east_north-west"},
    {"dir1": "west", "dir2": "east", "item": "west_east"},
    {"dir1": "east", "dir2": "south-west", "item": "east_south-west"},
    {"dir1": "west", "dir2": "south", "item": "west_south"},
    {"dir1": "east", "dir2": "south-east", "item": "east_south-east"},
    {"dir1": "south-east", "dir2": "east", "item": "south-east_east"},
    {"dir1": "north-east", "dir2": "north-east", "item": "north-east_north-east"},
    {"dir1": "south-east", "dir2": "south", "item": "south-east_south"},
    {"dir1": "north-east", "dir2": "north-west", "item": "north-east_north-west"},
    {"dir1": "south-east", "dir2": "west", "item": "south-east_west"},
    {"dir1": "north-east", "dir2": "south-west", "item": "north-east_south-west"},
    {"dir1": "south-east", "dir2": "north", "item": "south-east_north"},
    {"dir1": "north-east", "dir2": "south-east", "item": "north-east_south-east"},
    {"dir1": "south", "dir2": "east", "item": "south_east"},
    {"dir1": "north", "dir2": "north-east", "item": "north_north-east"},
    {"dir1": "south", "dir2": "south", "item": "south_south"},
    {"dir1": "north", "dir2": "north-west", "item": "north_north-west"},
    {"dir1": "south", "dir2": "west", "item": "south_west"},
    {"dir1": "north", "dir2": "south-west", "item": "north_south-west"},
    {"dir1": "south", "dir2": "north", "item": "south_north"},
    {"dir1": "north", "dir2": "south-east", "item": "north_south-east"},
    {"dir1": "south-west", "dir2": "east", "item": "south-west_east"},
    {"dir1": "north-west", "dir2": "north-east", "item": "north-west_north-east"},
    {"dir1": "south-west", "dir2": "south", "item": "south-west_south"},
    {"dir1": "north-west", "dir2": "north-west", "item": "north-west_north-west"},
    {"dir1": "south-west", "dir2": "west", "item": "south-west_west"},
    {"dir1": "north-west", "dir2": "south-west", "item": "north-west_south-west"},
    {"dir1": "south-west", "dir2": "north", "item": "south-west_north"},
    {"dir1": "north-west", "dir2": "south-east", "item": "north-west_south-east"}
]);

function sample(l, n=3) {
    let result = new Array(n);
    let len = l.length;
    let taken = new Array(len);
    if (n > len)
        throw new RangeError(`sample: tried to take ${n} elements list with ${l.length} elements.`);
    while (n--) {
        let x = Math.floor(Math.random() * len);
        result[n] = l[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

function getTaskInfo(task) {
    let selTerms = sample(termsList, n=3);
    let result = {
        "termA": selTerms[0],
        "termB": selTerms[1],
        "termC": selTerms[2],
        "dir1": task["dir1"],
        "dir2": task["dir2"],
        "task": task["item"],
        "premise1": `The ${selTerms[0]} is ${task["dir1"]} of the ${selTerms[1]}`,
        "premise2": `The ${selTerms[1]} is ${task["dir2"]} of the ${selTerms[2]}`
    }
    return result;
}

var responseBoxes = document.getElementsByClassName("response_box");
var responseCheckboxes = document.getElementsByClassName("response_checkboxes");
var interactions = [];
var taskStartTime = Date.now();

var premise1 = document.getElementById("premise1");
var premise2 = document.getElementById("premise2");
var titleText = document.getElementById("task_header");
var continueBtn = document.getElementById("continue_btn");
var currentTaskIdx = 0;
var currentTask = null;

function controlResponseOptions(disabledState) {
    for(let chkbx of responseCheckboxes) {
        chkbx.disabled = disabledState;
    }
}

function clearAllCheckmarks() {
    for(let chkbx of responseCheckboxes) {
        chkbx.checked = false;
    }
}

function presentTask() {
    currentTaskIdx += 1;
    if(currentTaskIdx > tasks.length) {
        changePage("questionaire.html");
        return;
    }

    clearAllCheckmarks();
    interactions = [];
    currentTask = getTaskInfo(tasks[currentTaskIdx - 1]);
    premise1.textContent = currentTask["premise1"];
    premise2.textContent = currentTask["premise2"];


    for(let box of responseBoxes) {
        let chkbx = document.getElementById(box.getAttribute("for"));
        let label = box.querySelector(":scope > span");
        if(box.getAttribute("for") != "nvc") {
            label.innerHTML = `The ${currentTask["termC"]} is <b>${chkbx.getAttribute("value")}</b> of the ${currentTask["termA"]}`;
        }
        else {
            label.innerHTML = "None of the conclusions are plausible"
        }
    }

    controlResponseOptions(false);
    titleText.textContent = `Task ${currentTaskIdx}/${tasks.length}`;
    taskStartTime = Date.now();
    continueBtn.setAttribute("aria-busy", "false");
    continueBtn.disabled = true;
}

function checkContinue() {
    for(let chkbx of responseCheckboxes) {
        if(chkbx.checked) {
            continueBtn.disabled = false;
            return;
        }
    }
    continueBtn.disabled = true;
}

async function handleContinue() {
    controlResponseOptions(true);
    continueBtn.disabled = true;
    continueBtn.setAttribute("aria-busy", "true");

    let result = [];
    for(let chkbx of responseCheckboxes) {
        if(chkbx.checked) {
            result.push(chkbx.value);
        }
    }

    let personId = sessionStorage.getItem("personId");

    let payload = {
        "id": personId,
        "page" : "cardinal_directions_sc",
        "response" : result,
        "interactions": interactions,
        "task": currentTask["task"],
        "terms" : [currentTask["termA"], currentTask["termB"], currentTask["termC"]],
        "rt" : Date.now() - taskStartTime,
        }

        let success = await writeData(payload);
        if(success) {
            presentTask();
        }
        else {
            alert("Could not save data. Please contact us for assistance.")
        }
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

            checkContinue();
        });
    }


    continueBtn.addEventListener("click", handleContinue);
    controlResponseOptions(true);
    presentTask();
}

window.addEventListener("load", init);