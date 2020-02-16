if (debug) { // logs linked scripts if debug set to true
  console.log("app.js linked");
}

document.body.onclick = keyClick; // click event listener 
getActiveUsers();

// BACKGROUND PROCESS - IS OFF UNLESS USER IS LOGGED IN **********
function backgroundProcess(onOff) {
  let counter = 0;
  if (onOff.toLowerCase() === "on") {
    console.log("background process has started...")
    // do once on init **********
    getActiveUsers(); // do at init (once)
    bpOn = true;
    backgroundProcessID = setInterval(function () {
      counter++
      getActiveUsers();
      if (authState) { // 
        // EXECUTES EVERY INTERVAL **********
        getScores(fbUid);
        // EXECUTES EVERY FIRST COUNTER MOD% INTERVAL = 0, AND EXITS WITHOUT EVALUATING LOWER MOD% BRANCHES  
        if (counter % 13 === 0) { // every 13 iterations
        } else if (counter % 7 === 0) { // every 7 iterations
          wipeExpired();
        } else if (counter % 3 === 0) { // very 3 iterations
          pingRPSUser(); // updates RPSUser timestamps and lifetime score
        }
      } else { // authState = false
        if (counter % 3 === 0) { // every 13 iterations
          getActiveUsers();
        }
      }
      if (activeTS < timeNow(0)) {
        console.log("background process shutting down...")
        bpOn = false;
        counter = 0;
        backgroundProcess("off");
        if (authState) { // logoff if logged on
          logOff();
        }
      }
      if (counter % 50 === 0) {
        console.log("background process thru " + counter + " iterations @ " + (backgroundTimer / 1000) + " seconds each");
      }
    }, backgroundTimer);
  } else {
    bpOn = false;
    clearInterval(backgroundProcessID);
    console.log("background process is stopped...")
  }
}

// FIRES ON ALL CLICK EVENTS **********
function keyClick(e) { // looking for clicks 
  activeTS = timeNow(activeTTL);
  if (!bpOn) {
    backgroundProcess("on");
  }
  e = window.event ? event.srcElement : e.target;
  if (debug) {
    console.log("non-modal click function: " + e.getAttribute('id') + " was processed")
  }
  if (e.getAttribute('id') === 'login') { // login or logout request based on current state
    if (debug) {
      console.log("validated id = login clicked");
    }
    if (document.getElementById("login").value = "Login") {
      showModal();
    }
    if (document.getElementById("login").value = "Logout") { // sign out via top nav
      logOff()
    }
  }

  if (e.getAttribute('id') === 'send') { // send chat on button click
    activeTS = timeNow(activeTTL);
    if (!bpOn) {
      backgroundProcess("on");
    }
    chatGo();
  }

  // ROCK, PAPER, SCISSOR IMAGE CLICKED **********
  if (e.classList.contains('gesture-img')) { // gesture clicked
    if (rpsPick < 0) {
      clearGame();
      activeTS = timeNow(activeTTL);
      if (!bpOn) {
        backgroundProcess("on");
      }
      rpsPick = parseInt(e.id.substring(8));
      botPick = Math.floor(Math.random() * 3); // bot's rock, paper, scissor choice
      localScore[resultMatrix[rpsPick][botPick]]++; // tallies session W/L/T scores via matrix
      updateScore[resultMatrix[rpsPick][botPick]]++; // tallies update W/L/T scores via matrix
      botChatReceive("You've picked: " + pickName[rpsPick] + ", and I picked: " + pickName[botPick] +
        "! So it seems you have " + action[resultMatrix[rpsPick][botPick]] + "! -rpsBot");
      showScores();
      // click image color change and pause for re-click
      var state = $(e).attr("data-state");
      if (state === "blue") {
        $(e).attr("src", $(e).attr("data-red"));
        $(e).attr("data-state", "red");
      } else {
        $(e).attr("src", $(e).attr("data-blue"));
        $(e).attr("data-state", "blue");
      }
      setTimeout(function () { // pause between gesture image clicks 
        queryGames(fbUid, rpsPick);
        clearGame();
      }, gesturePause);

    } else {
      botChatReceive("You've picked " + pickName[rpsPick] + "! NO TAKE-BACKS in rock-paper-scissors! -rpsBot");
    }
  }
  if (e.classList.contains("modal-item")) { // modal item clicked
    activeTS = timeNow(activeTTL);
    modalClick(e);
  }
  return;
}

// RESETS ALL GESTURE IMAGES TO START POSITION
function clearGame() { // resent gesture images to init condition
  activeTS = timeNow(activeTTL);
  rpsPick = (-1);
  for (i = 0; i < 3; i++) {
    $("#gesture-" + i).attr({
      "src": $("#gesture-" + i).attr("data-blue"),
      "data-state": "blue"
    });
  }
}

// SENDS CHAT ON RETURN KEY **********
function handle(e) { // send chat on enter/return key
  if (e.keyCode === 13) {
    activeTS = timeNow(activeTTL);
    e.preventDefault();
    chatGo();
  }
}

// UPDATES HTML ADMIN FIELD WITH PAUSE - READABILITY 
function colorChange(element, show, pcolor, pause) {
  setTimeout(function () {
    document.getElementById(element).style.color = pcolor;
    document.getElementById(element).textContent = show;
  }, pause);
}
// TEMPORARILY CHANGES COLOR OF CHANGED HTML DATA
function showScores() {
  if (debug) {
    console.log("showscores() executed");
  }
  let totalGames = arrSum(localScore);
  if (parseInt(showHTML01.textContent) != localScore[0]) {
    colorChange("showHTML01", localScore[0], "RED", 0)
    colorChange("showHTML01", localScore[0], "BLACK", 1000)
  }
  if (parseInt(showHTML02.textContent) != localScore[1]) {
    colorChange("showHTML02", localScore[1], "RED", 0)
    colorChange("showHTML02", localScore[1], "BLACK", 1000)
  }
  if (parseInt(showHTML03.textContent) != localScore[2]) {
    colorChange("showHTML03", localScore[2], "RED", 0)
    colorChange("showHTML03", localScore[2], "BLACK", 1000)
  }
  if (totalGames > 0) {
    if (parseInt(showHTML03.textContent) != Math.round((localScore[0] / totalGames * 100)) + "%") {
      colorChange("showHTML04", Math.round((localScore[0] / totalGames * 100)) + "%", "RED", 0)
      colorChange("showHTML04", Math.round((localScore[0] / totalGames * 100)) + "%", "BLACK", 1000)
    }
    if (parseInt(showHTML03.textContent) != Math.round((localScore[1] / totalGames * 100)) + "%") {
      colorChange("showHTML05", Math.round((localScore[1] / totalGames * 100)) + "%", "RED", 0)
      colorChange("showHTML05", Math.round((localScore[1] / totalGames * 100)) + "%", "BLACK", 1000)
    }

  }
}