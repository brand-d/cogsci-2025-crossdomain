var instrButton1 = document.getElementById("instr_btn_1");
var instrButton2 = document.getElementById("instr_btn_2");
var instrButton3 = document.getElementById("instr_btn_3");
var instrButton4 = document.getElementById("instr_btn_4");

var instructions1 = document.getElementById("instruction_1");
var instructions2 = document.getElementById("instruction_2");
var instructions3 = document.getElementById("instruction_3");
var instructions4 = document.getElementById("instruction_4");

function init() {
    instructions2.hidden = true;
    instructions3.hidden = true;
    instructions4.hidden = true;

    // Remove the current task
    removeCurrentTask();
    
    // Block participants from leaving
    blockLeaving();

    // Add event listeners for buttons
    instrButton1.addEventListener("click", function() {
        instructions1.hidden = true;
        instrButton1.disabled = true;

        instructions2.hidden = false;
        instrButton2.disabled = false;
    });

    instrButton2.addEventListener("click", function() {
        instructions2.hidden = true;
        instrButton2.disabled = true;

        instructions3.hidden = false;
        instrButton3.disabled = false;
    });

    instrButton3.addEventListener("click", function() {
        instructions3.hidden = true;
        instrButton3.disabled = true;

        instructions4.hidden = false;
        instrButton4.disabled = false;
    });

    instrButton4.addEventListener("click", async function() {
        instrButton4.disabled = false;
        instrButton4.setAttribute("aria-busy", "true");
        let personId = sessionStorage.getItem("personId");

        // Always save the ID and the page too
        // while redundant, it cant help to show problems when saving
        let payload = {
            "id": personId,
            "page" : "mental_rotation_instructions",
            "page_time" : Date.now() - pageStartTime
        }
        let success = await writeData(payload);
        if(success) {
            changePage("train_tasks.html");
        }
        else {
            alert("Could not save data. Please contact us for assistance.")
        }
    });
}

// Start the init function once the page is loaded
window.addEventListener("load", init);