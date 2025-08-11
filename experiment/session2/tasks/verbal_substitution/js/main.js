const alphabets = {
    "full" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "consonants" : "BCDFGHJKLMNPQRSTVWXYZ",
    "vocals" : "AEIOU"
}

var alphabethList = [];

var phase = "presentation";
var checkRegex = new RegExp("^[a-zA-Z]+$");

var taskTitle = document.getElementById("task_text");

var presentationBox = document.getElementById("sequence_presentation_box");
var presentationSequence = document.getElementById("sequence_text");

var substitutionBox = document.getElementById("sequence_substitution_box");
var substitutionText = document.getElementById("sequence_substitution_text");

var sequenceResultBox = document.getElementById("sequence_test_box");
var sequenceResultInput = document.getElementById("sequence_result");

var pauseBox = document.getElementById("pause_box");

var continueBtn = document.getElementById("continue_btn");

var currentTaskDefinition = null;
var currentTaskIdx = 0;
var currentSubstitutionIdx = 0;
var currentTaskState = null;
var originalChars = new Set();
var mergedChars = new Set();
var addedChars = new Set();
var regexChars = new Set();

var substitutionInteractions = [];
var taskPresentStart = Date.now();
var substitutionPresentStart = Date.now();
var currentSubstitution = null;
var memorizeTime = 0;
var pauseBefore = 0;
var pauseStart = Date.now();

function performSubstitution() {
    let rule = currentTaskState["substitutions"].shift();
    let splitted = rule.toLowerCase().replaceAll(" ", "").split("->");
    let fromSet = splitted[0];
    let toSet = splitted[1];

    // Determine the element to be substituted
    let fromElements = new Set();
    if(fromSet.includes("orig")) {
        fromElements = fromElements.union(originalChars);
    } 
    if(fromSet.includes("merged")) {
        fromElements = fromElements.union(mergedChars);
    } 
    if(fromSet.includes("added")) {
        fromElements = fromElements.union(addedChars);
    } 
    if(fromSet.includes("any")) {
        fromElements = originalChars.union(mergedChars.union(addedChars));
    } 
    fromElements = Array.from(fromElements);

    if(fromElements.length == 0) {
        console.error("No elements in respective set");
        return;
    }
    let fromElement = fromElements[Math.floor(Math.random() * fromElements.length)];
    originalChars.delete(fromElement);
    mergedChars.delete(fromElement);
    addedChars.delete(fromElement);

    // Determine the target of the substitution
    let toElements = new Set();
    if(toSet.includes("new")) {
        let newChar = introduceNewCharacter();
        while(newChar == fromElement) newChar = introduceNewCharacter();
        addedChars.add(newChar);
        toElements.add(newChar);
        regexChars.add(newChar);
    }
    if(toSet.includes("orig")) {
        toElements = toElements.union(originalChars);
    }
    if(toSet.includes("merged")) {
        toElements = toElements.union(mergedChars);
    }
    if(toSet.includes("added")) {
        toElements = toElements.union(addedChars);
    }
    if(toSet.includes("any")) {
        toElements = originalChars.union(mergedChars.union(addedChars));
    }

    toElements = Array.from(toElements);
    let toElement = toElements[Math.floor(Math.random() * toElements.length)];

    if(toSet != "new") {
        originalChars.delete(toElement);
        addedChars.delete(toElement);
        mergedChars.add(toElement);
    }
    updateRegex(regexChars);

    substitutionText.textContent = `Replace all occurences of ${fromElement} with ${toElement}`;
    currentSubstitution = `${fromElement}->${toElement}`;
    currentTaskState["current_sequence"] = 
        currentTaskState["current_sequence"].replaceAll(fromElement, toElement);
}

function updateRegex(regexChars) {
    // Should only potential letters be allowed?
    //checkRegex = getRegexForChars(Array.from(regexChars));
}

function flashSubstitution(time=200) {
    substitutionBox.hidden = true;
    performSubstitution();
    continueBtn.disabled = true;
    continueBtn.setAttribute("aria-busy", "true");
    window.setTimeout(function() {
        continueBtn.setAttribute("aria-busy", "false");
        continueBtn.disabled = false;
        substitutionBox.hidden = false;
        substitutionPresentStart = Date.now();
    }, time);
}

function checkInputValue(e) {
    if(phase != "test") return;
    let result = e.target.value;
    //continueBtn.disabled = result.length != currentTaskDefinition["sequence_length"];
    continueBtn.disabled = result.length < 1;
}

function startTestPhase() {
    phase = "test";
    presentationBox.hidden = true;
    substitutionBox.hidden = true;
    sequenceResultBox.hidden = false;
    pauseBox.hidden = true;
    continueBtn.disabled = true;
    sequenceResultInput.disabled = false;
    sequenceResultInput.focus();
}

function startPause() {
    phase = "pause";
    presentationBox.hidden = true;
    substitutionBox.hidden = true;
    sequenceResultBox.hidden = true;
    pauseBox.hidden = false;
    continueBtn.disabled = false;
    pauseStart = Date.now();
}

async function progressThroughTask() {
    if(phase == "pause") {
        pauseBefore = Date.now() - pauseStart;
        startNextTask();
    }
    else if(phase == "test") {
        let result = sequenceResultInput.value.toUpperCase();
        sequenceResultInput.disabled = true;
        continueBtn.disabled = true;
        let personId = sessionStorage.getItem("personId");

        let payload = {
            "id": personId,
            "page" : "verbal_substitution",
            "response" : result,
            "initial_sequence" : currentTaskState["initial_sequence"],
            "final_sequence" : currentTaskState["current_sequence"],
            "initial_num_chars" : currentTaskState["initial_num_chars"],
            "final_num_chars" : currentTaskState["current_num_chars"],
            "substitution_rules": currentTaskDefinition["substitutions"],
            "substitutions_interactions" : substitutionInteractions,
            "memorize_time" : memorizeTime,
            "pause_before" : pauseBefore,
            "rt" : Date.now() - taskPresentStart,
        }

        let success = await writeData(payload);
        if(success) {
            if(currentTaskIdx < tasksDefinitions.length) {
                startPause();
            } else {
                goToNextTask();
            }
        }
        else {
            alert("Could not save data. Please contact us for assistance.")
        }
    }
    // If there are no substitution rules left, go to test phase
    else if(currentTaskState["substitutions"].length == 0) {
        if(phase == "presentation") {
            memorizeTime = Date.now() - taskPresentStart;
            console.warn("There should always be at least one substitution rule.");
        }
        substitutionInteractions.push({
            "rule" : currentSubstitution,
            "rt" : Date.now() - substitutionPresentStart
        });
        startTestPhase();
    }
    // If it was in the presentation phase, start substitution phase
    else if(phase == "presentation") {
        memorizeTime = Date.now() - taskPresentStart;
        phase = "substitution";
        presentationBox.hidden = true;
        sequenceResultBox.hidden = true;
        pauseBox.hidden = true;
        flashSubstitution();
    }
    // If in substitution phase, but there are more rules to come
    else if(phase == "substitution") {
        substitutionInteractions.push({
            "rule" : currentSubstitution,
            "rt" : Date.now() - substitutionPresentStart
        });
        flashSubstitution();
    }
    // Error
    else {
        console.error("Unknown phase");
    }
}

function startNextTask() {
    currentTaskDefinition = tasksDefinitions[currentTaskIdx];
    currentTaskIdx += 1;
    taskTitle.textContent = `Task ${currentTaskIdx} / ${tasksDefinitions.length}`; 
    processTaskDefinition(currentTaskDefinition);

    substitutionInteractions = [];
    substitutionPresentStart = Date.now();
    currentSubstitution = null;
    memorizeTime = 0;

    taskPresentStart = Date.now();
    substitutionBox.hidden = true;
    sequenceResultBox.hidden = true;
    sequenceResultInput.disabled = true;
    continueBtn.disabled = false;
}

function introduceNewCharacter() {
    currentTaskState["current_num_chars"] += 1;
    return alphabethList.shift();
}

function processTaskDefinition(taskDefinition) {
    // Prepare task information
    let occurences = createBalanceOccurences(
        taskDefinition["num_characters"], 
        taskDefinition["sequence_length"]
    );
    buildAlphabethList(taskDefinition["alphabeth"]);
    let chars = getCharacters(taskDefinition["num_characters"]);
    let initialSequence = createSequence(chars, occurences);

    currentTaskState = {
        "initial_sequence": initialSequence,
        "current_sequence": initialSequence,
        "initial_num_chars": taskDefinition["num_characters"],
        "current_num_chars": taskDefinition["num_characters"],
        "substitutions": taskDefinition["substitutions"].slice(0)
    }
    currentSubstitutionIdx = 0;

    // Prepare sets
    originalChars = new Set(chars);
    regexChars = new Set(chars);
    mergedChars.clear();
    addedChars.clear();

    // Set the sequence text
    presentationSequence.textContent = initialSequence;

    // Set the phase
    phase = "presentation";

    // Prepare the result input length and regex
    sequenceResultInput.value = "";
    //sequenceResultInput.setAttribute("maxlength", taskDefinition["sequence_length"]);
    updateRegex(regexChars);

    // Set visibility
    presentationBox.hidden = false;
    sequenceResultBox.hidden = true;
    substitutionBox.hidden = true;
    pauseBox.hidden = true;
}

function buildAlphabethList(alphabethName) {
    let alphabethString = alphabets[alphabethName];
    alphabethList = [...alphabethString];
    alphabethList = shuffle(alphabethList);
}

function getCharacters(numChars) {
    let result = [];

    // Obtain the first letters
    for(let i = 0; i < numChars; i += 1) {
        result.push(alphabethList.shift());
    }
    
    return result;
}

function getRegexForChars(charList) {
    let inner = charList.join("");
    let regExStr = `^[${inner.toLowerCase()}${inner.toUpperCase()}]+\$`;
    return new RegExp(regExStr);
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

function createSequence(chars, occurences) {
    let permutedOccurences = shuffle(occurences);
    let sequence = [];
    for(let i=0; i<permutedOccurences.length; i+=1) {
        for(j=0; j<permutedOccurences[i]; j+=1) {
            sequence.push(chars[i]);
        }
    }
  
    sequence = shuffle(sequence);
    return sequence.join("");
}

function createBalanceOccurences(numChars, sequenceLength) {
    let result = [];
    for(let i = 0; i < sequenceLength; i+=1) {
        if(result.length < numChars) {
            result.push(1);
        } else {
            result[i % numChars] += 1;
        }
    }    
    return result;
}

window.addEventListener("load", function() {
    // Block participants from leaving
    blockLeaving();

    // Prevent the input from any non-alphabetical inputs
    sequenceResultInput.addEventListener("beforeinput", function(event) {
        let data = event.data;
        if(data) {
            let allowed = checkRegex.test(data);
            if(!allowed) event.preventDefault();
        }
    });

    // Add the continueBtn
    continueBtn.addEventListener("click", progressThroughTask);

    // Add listener to result box
    sequenceResultInput.addEventListener("input", checkInputValue);

    // Present the first task
    startNextTask();
})
