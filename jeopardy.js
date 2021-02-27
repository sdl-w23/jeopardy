// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]


let start = 1
let categories = [];
const NUM_CATEGORIES = 6;

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    const response = await axios.get("https://jservice.io/api/categories?count=100");
    const IDs = response.data.map(function(cat){
        return cat.id;
    });
    return _.sampleSize(IDs, NUM_CATEGORIES);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const response = await axios.get(`https://jservice.io/api/category?id=${catId}`);
    const catClues = response.data.clues;
    const catCluesArr = _.sampleSize(catClues, 5);
    const clues = catCluesArr.map(function(clue){
        return {
            question: clue.question,
            answer: clue.answer,
            showing: null
        }
    })
    const catTitle = response.data.title;
    return {
        title: catTitle,
        clues
    }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

function fillTable() {
    $("#jeopardy-table thead").empty();
    let $tr = $("<tr>");
    for(let i = 0; i < NUM_CATEGORIES; i++){
        $tr.append($("<th>").text(categories[i].title));
    }
    $("#jeopardy-table thead").append($tr);
    $("#jeopardy-table tbody").empty();
    for(let j = 0; j < 5; j++){
        let $tr = $("<tr>");
        for (let i = 0; i < NUM_CATEGORIES; i++){
            $tr.append($("<td>").append($("<td>").attr("id", `${i}-${j}`).text("?")));
        }
        $("#jeopardy-table tbody").append($tr);
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let count = 0
    let id = evt.target.id;
    let [catId, clueId] = id.split("-");
    let clue = categories[catId].clues[clueId];
  
    let msg;
  
    if (!clue.showing) {
      msg = clue.question;
      clue.showing = "question";
    } 
    else if (clue.showing === "question") {
      msg = clue.answer;
      clue.showing = "answer";
    } 
    else {
      return
    }
    $(`#${catId}-${clueId}`).html(msg);
    evt.stopImmediatePropagation();
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */


/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    const catIds = await getCategoryIds();
    categories = [];
    for(let catId of catIds){
        categories.push(await getCategory(catId));
    }
    fillTable();
    if(start == 1){
        document.getElementById("start-button").innerHTML = "Restart";
        start = start + 1
    }
    
}


/** On click of start / restart button, set up game. */
$("#start-button").on("click", setupAndStart);




// TODO

/** On page load, add event handler for clicking clues */
$("#jeopardy-table").on("click", "td", handleClick);
    
// TODO