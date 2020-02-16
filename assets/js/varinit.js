// GLOBAL SYSTEM VARIABLES **********
const debug = true; // true will console log debug data 
const db = firebase.firestore(); // firebase db reference
const TTL = 5000; // game doc TTL (when game can be played/players added)
const archiveTTL = 720000; // remove game TTL (when game data W/L/T can be retrieved)
const activeTTL = 300000; // no activity TTL (controls interval functions via activeTS)
const activityData = {} // activity object placeholder
const gesturePause = 750; // disable gesture pick for x milliseconds   
let backgroundTimer = 5000; // background process iteration - not a const so iteration can be changed based on number of active users
let backgroundProcessID; // background interval id
let bpOn = false; // background process running;
let activeTS = timeNow(activeTTL); // activity timestamp init - includes activeTTL (time to shutdown background processes) 
let locationLogged = false; // IP address logged on server;
let usersOnline = 0; // online user count

// GLOBAL USER VARIABLES **********
let ipAddress = geoplugin_request(); // users IP address
let city = geoplugin_city(); // user city
let authState = false; // firebase authorization state
let fbUid = ""; // firebase unique user id - ap specific
let password; // password 
let email; // email address
let newbie = true; // new login

// GLOBAL GAME PLAY VARIABLES **********
const pickName = ["ROCK", "PAPER", "SCISSORS"] // for human readable results of resultMatrix
const action = ["WON", "LOST", "TIED"] // for human readable results of resultMatrix
const resultMatrix = [ // matrix for scoring game without if branches
    [2, 1, 0],
    [0, 2, 1],
    [1, 0, 2]
] // 0=win, 1=loss, 2=tie | rock =  0, paper =  1, scissors = 2
let localScore = [0, 0, 0] // win[0], loss[1], tie[2] - session score
let updateScore = [0, 0, 0] // win[0], loss[1], tie[2] - resets to zero when sent to server
let rpsPick = (-1); // user rock, paper, scissor pick
let botPick = 0; // bot rock, paper, scissor pick

// GLOBAL CHAT VARIABLES **********
const chatLimit = 50; // number of chat entries tp keep in chat window
let chatName = ipAddress; // chat signature
let chatData; // chat message data
let chatLines = 0; // number of chat entries  

// GLOBAL HTML <DIV ID> INJECTORS **********
const chatBody = document.querySelector('#chat-view');
const showHTML00 = document.getElementById("showHTML00");
const showHTML01 = document.getElementById("showHTML01");
const showHTML02 = document.getElementById("showHTML02");
const showHTML03 = document.getElementById("showHTML03");
const showHTML04 = document.getElementById("showHTML04");
const showHTML05 = document.getElementById("showHTML05");
const showHTML06 = document.getElementById("showHTML06");
const showHTML07 = document.getElementById("showHTML07");
const showHTML08 = document.getElementById("showHTML08");
const showHTML09 = document.getElementById("showHTML09");
const showHTML10 = document.getElementById("showHTML10");
const showHTML11 = document.getElementById("showHTML11");

if (debug) { // logs linked scripts if debug set to true
    console.log("firebase.js linked");
}

// GLOBAL NON-SECTION SPECIFIC FUNCTIONS **********
function validateEmail(email) { // regex text email validation from SO
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function timeNow(eTTL) { // returns current time in ms (+/- eTTL)
    d = new Date();
    return t = (d.getTime() + eTTL);
}

function arrSum(arr) { // returns the sum of any array
    return arr.reduce(function (a, b) {
        return a + b
    }, 0);
}