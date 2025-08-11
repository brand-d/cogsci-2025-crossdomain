function getTask(currentIdx) {
	return {
        "syllogism": syllogisms[currentIdx],
        "content" : syllogContent[currentIdx]
    }
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

function shuffleTasks() {
    syllogisms = shuffle(syllogisms)
	syllogContent = shuffle(syllogContent)
}

function createSyllogText(task) {
    let syl = task["syllogism"];
    let figure = syl[2];
    let q1 = syl[0];
    let q2 = syl[1];

    let content = task["content"];

    let p1_1 = null;
    let p1_2 = null;
    let p2_1 = null;
    let p2_2 = null;

    if(figure == "1") {
        p1_1 = content[0];
        p1_2 = content[1];
        p2_1 = content[1];
        p2_2 = content[2];
    } else if(figure == "2") {
        p1_1 = content[1];
        p1_2 = content[0];
        p2_1 = content[2];
        p2_2 = content[1];
    }
    else if(figure == "3") {
        p1_1 = content[0];
        p1_2 = content[1];
        p2_1 = content[2];
        p2_2 = content[1];
    }
    else if(figure == "4") {
        p1_1 = content[1];
        p1_2 = content[0];
        p2_1 = content[1];
        p2_2 = content[2];
    }

    let prem1 = null;
    if(q1 == "A") prem1 = `All ${p1_1} are ${p1_2}`;
    else if (q1 == "I") prem1 = `Some ${p1_1} are ${p1_2}`;
    else if (q1 == "E") prem1 = `No ${p1_1} are ${p1_2}`;
    else if (q1 == "O") prem1 = `Some ${p1_1} are not ${p1_2}`;

    let prem2 = null;
    if(q2 == "A") prem2 = `All ${p2_1} are ${p2_2}`;
    else if (q2 == "I") prem2 = `Some ${p2_1} are ${p2_2}`;
    else if (q2 == "E") prem2 = `No ${p2_1} are ${p2_2}`;
    else if (q2 == "O") prem2 = `Some ${p2_1} are not ${p2_2}`;

    return {
        "prem1" : prem1,
        "prem2" : prem2
    }
}

function createConclusion(quant, direction, content) {
    if(quant == "A") {
        if(direction == "ac") return `All ${content[0]} are ${content[2]}`;
        if(direction == "ca") return `All ${content[2]} are ${content[0]}`
    }
    if(quant == "I") {
        if(direction == "ac") return `Some ${content[0]} are ${content[2]}`;
        if(direction == "ca") return `Some ${content[2]} are ${content[0]}`
    }
    if(quant == "E") {
        if(direction == "ac") return `No ${content[0]} are ${content[2]}`;
        if(direction == "ca") return `No ${content[2]} are ${content[0]}`
    }
    if(quant == "O") {
        if(direction == "ac") return `Some ${content[0]} are not ${content[2]}`;
        if(direction == "ca") return `Some ${content[2]} are not ${content[0]}`
    }
    return null;
}

var syllogContent = [
    ["teachers", "golfers", "bankers"],
    ["actors", "painters", "workers"],
    ["lifeguards", "dentists", "plumbers"],
    ["students", "cyclists", "buyers"],
    ["carpenters", "linguists", "divers"],
    ["doctors", "tellers", "climbers"],
    ["surfers", "planners", "artists"],
    ["dancers", "boxers", "typists"],
    ["soldiers", "editors", "florists"],
    ["farmers", "assistants", "scholars"],
    ["investors", "jugglers", "barbers"],
    ["sculptors", "bakers", "gamblers"],
    ["chemists", "potters", "sailors"],
    ["poets", "skaters", "miners"],
    ["drivers", "writers", "hikers"],
    ["tailors", "pilots", "singers"],
    ["packers", "tutors", "butchers"],
    ["judges", "porters", "brewers"],
    ["lawyers", "athletes", "hunters"],
    ["nurses", "actors", "drillers"],
    ["mayors", "cooks", "swimmers"],
    ["auditors", "cleaners", "painters"],
    ["managers", "clerks", "models"],
    ["poets", "waiters", "cashiers"],
    ["secretaries", "agents", "brokers"],
    ["therapists", "climbers", "skaters"],
    ["campers", "engineers", "fencers"],
    ["analysts", "novelists", "travelers"],
    ["riders", "counselors", "joggers"],
    ["boxers", "actuaries", "opticians"],
    ["trainers", "architects", "designers"],
    ["scientists", "chefs", "runners"],
    ["teachers", "painters", "plumbers"],
    ["actors", "dentists", "buyers"],
    ["lifeguards", "cyclists", "divers"],
    ["students", "linguists", "climbers"],
    ["carpenters", "tellers", "artists"],
    ["doctors", "planners", "typists"],
    ["surfers", "boxers", "florists"],
    ["dancers", "editors", "scholars"],
    ["soldiers", "assistants", "barbers"],
    ["farmers", "jugglers", "gamblers"],
    ["investors", "bakers", "sailors"],
    ["sculptors", "potters", "miners"],
    ["chemists", "skaters", "hikers"],
    ["poets", "writers", "singers"],
    ["drivers", "pilots", "butchers"],
    ["tailors", "tutors", "brewers"],
    ["packers", "porters", "hunters"],
    ["judges", "athletes", "drillers"],
    ["lawyers", "actors", "swimmers"],
    ["nurses", "cooks", "painters"],
    ["mayors", "cleaners", "models"],
    ["auditors", "clerks", "cashiers"],
    ["managers", "waiters", "brokers"],
    ["poets", "agents", "skaters"],
    ["secretaries", "climbers", "fencers"],
    ["therapists", "engineers", "travelers"],
    ["campers", "novelists", "joggers"],
    ["analysts", "counselors", "opticians"],
    ["riders", "actuaries", "designers"],
    ["boxers", "architects", "runners"],
    ["trainers", "chefs", "bankers"],
    ["scientists", "golfers", "workers"]
]