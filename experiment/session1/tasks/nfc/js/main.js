var continueBtn = document.getElementById("continue_btn");
var likertBtns = document.getElementsByClassName("likert_btn");

// Checks if all answers are checked and disabled/enables the buttons accordingly
function checkAllAnswered() {
    let selected = new Set();
    let allNames = new Set();
    for(let elem of likertBtns) {
        allNames.add(elem.getAttribute("name"));
        if(elem.checked) selected.add(elem.getAttribute("name"));
    }
    continueBtn.disabled = allNames.intersection(selected).size != allNames.size;
}

window.addEventListener("load", function() {
    // Remove the current task
    removeCurrentTask();
    
    // Block participants from leaving
    blockLeaving();

    // Init all likert buttons with an onchange function
    for(let elem of likertBtns) {
        elem.addEventListener("input", checkAllAnswered);
        elem.checked = false;
        elem.disabled = false;
    }

    // Add functionality for continue btn
    continueBtn.addEventListener("click", async function() {
        continueBtn.disabled = true;
        continueBtn.setAttribute("aria-busy", "true");
        let personId = sessionStorage.getItem("personId");
        let payload = {
            "id": personId,
            "page" : "nfc_questionaire",
            "page_time" : Date.now() - pageStartTime
        }
        for(let elem of likertBtns) {
            elem.disabled = false;
            if(elem.checked) {
                payload[elem.getAttribute("name")] = elem.value;
            }
        }
        let success = await writeData(payload);
        if(success) {
            goToNextTask();
        }
        else {
            alert("Could not save data. Please contact us for assistance.");
        }
    });
});

