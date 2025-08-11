var cardGrid = document.getElementById("card_grid");
var selectedCardsText = document.getElementById("turned_cards_text");
var continueBtn = document.getElementById("continue_btn");
var cardOrder = [];

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

function getCheckedCards() {
    let allCheckedNames = [];
    for(let card of document.querySelectorAll("input[class^='wason_checkboxes']:checked")) {
        allCheckedNames.push(
            document.getElementById(`${card.parentElement.id}_content`).textContent
        );
    }
    return allCheckedNames;
}

function onSelection(e) {
    let allCheckedNames = getCheckedCards();
    if(allCheckedNames.length == 0)
        selectedCardsText.textContent = "Cards selected to be turned: None";
    else {
        selectedCardsText.textContent = 
            `Cards selected to be turned: ${Array.from(allCheckedNames).join(", ")}`;
    }
}

window.addEventListener("load", function() {
    // Remove task from task list
    removeCurrentTask();
    
    // Block participants from leaving
    blockLeaving();

    // Shuffle the cards
    let cards = shuffle(Array.from(cardGrid.querySelectorAll(".wason_card")));
    cardGrid.replaceChildren(...cards);
    
    // Add selection callback
    for(let card of cards) {
        card.addEventListener("input", onSelection);
        cardOrder.push(Array.from(card.querySelectorAll(".card_content"))[0].textContent);
    }

    // Add callback for continue button
    continueBtn.addEventListener("click", async function() {
        // Disable button
        continueBtn.disabled = true;
        
        // Show spinning circle while saving
        continueBtn.setAttribute("aria-busy", "true");

        // Disable cards
        for(let card of document.getElementsByClassName("wason_checkboxes")) {
            card.disabled = true;
        }

        // Save and continue with next task
        let personId = sessionStorage.getItem("personId");

        let payload = {
            "id": personId,
            "page" : "wason_card_task",
            "page_time" : Date.now() - pageStartTime,
            "response" : getCheckedCards(),
            "card_order": cardOrder
        }
        console.log(payload);
        let success = await writeData(payload);
        if(success) {
            goToNextTask();
        } else {
            alert("Could not save data. Please contact us for assistance.")
        }
    });
});