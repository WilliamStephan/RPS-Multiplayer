if (debug) { // logs linked scripts if debug set to true
    console.log("app.js linked");
}

// USER AUTHENTICATION - USER LISTENER ********** 
firebase.auth().onAuthStateChanged(function (user) { //  Firebase user listener
    console.log("authentication listener started...")
    if (user) { // user logged in
        hideModal();
        activeTS = timeNow(activeTTL);
        authState = true;
        newbie = true;
        email = user.email;
        fbUid = user.uid;
        chatName = email.substring(0, email.indexOf("@"));
        localScore = [0, 0, 0];
        updateScore = [0, 0, 0];
        colorChange("showHTML00", chatName, "BLUE", 0);
        colorChange("showHTML00", chatName, "BLACK", 1000);
        colorChange("showHTML09", "ONLINE", "BLUE", 0);
        colorChange("showHTML09", "ONLINE", "BLACK", 1000);
        document.getElementById("login").value = "Logout";
        if (!locationLogged) {
            getLocation();
        }
        setTimeout(function () { // delay to let firebase authenticate
            if (debug) {
                console.log("user has logged-in: ", fbUid);
            }
            logActivity("in");
            pingUser();
            getActiveUsers();
            pingRPSUser()
            if (!bpOn) {
                backgroundProcess("on");
            }
            showScores();
        }, 1000);

    } else { // user is logged out
        locationLogged = false;
        if (bpOn) {
            backgroundProcess("off");
        }
        email = "initialize@no-email.given";
        document.getElementById("login").value = "Login";
        if (!locationLogged) {
            getLocation();
        }
        setTimeout(function () { // Log activity
            logActivity("out");
            if (debug) {
                console.log("user has logged-out: ", user);
            }
        }, 1000);
        authState = false;
        localScore = [0, 0, 0];
        updateScore = [0, 0, 0];
        email = "initialize@no-email.given";
        fbUid = "";
        chatName = ipAddress;
        showScores();
        colorChange("showHTML00", chatName, "RED", 0);
        colorChange("showHTML00", chatName, "BLACK", 1000);
        colorChange("showHTML09", "OFFLINE", "RED", 0);
        colorChange("showHTML09", "OFFLINE", "BLACK", 1000);
        showModal();
        // No user is signed in.
    }
});

// CHAT LISTENER **********
var now = firebase.firestore.Timestamp.now(); // chat document start point
console.log("chat listener started...");
db.collection("chatLog").where("timestamp", ">=", now) // snapshot for collecting new chat items
    .onSnapshot(function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
            if (change.type === "added") {
                if (change.doc.data().fileUid === fbUid) {
                    chatSend(change.doc.data().chatData)
                    if (debug) {
                        console.log("chat data sent");
                    }
                } else {
                    chatReceive(change.doc.data().chatData)
                    if (debug) {
                        console.log("chat data received");
                    }
                }

            }
        });
    });

// CHAT LOGGING ON SERVER **********
function logChat(chatData) { // creates chat docs on server
    if (debug) {
        console.log("logChat(chatData) executed");
    }
    const refChatLog = db.collection('chatLog')
    refChatLog.add({
            fileUid: fbUid,
            chatData: chatData,
            timestamp: firebase.firestore.Timestamp.now(),
        })
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });
}

// GET ACTIVE USER COUNT **********
function getActiveUsers() {
    if (debug) {
        console.log("getActiveUsers() executed");
    }
    colorChange("showHTML07", "FETCHING", "BLUE", 0)
    db.collection('activeUser').get().then(snap => {
            usersOnline = snap.size // returns the collection size 
        })
        .then(function (docRef) {
            colorChange("showHTML07", usersOnline.toString(), "BLACK", 1000)
        });
}

// USER LOGOUT **********
function logOff() {
    if (authState) { // removes activeUser doc
        if (debug) {
            console.log("logOff() executed");
        }
        colorChange("showHTML11", "REMOVING", "RED", 0)
        db.collection('activeUser').doc(fbUid).get()
            .then(doc => {
                doc.ref.delete().then(function () {
                    console.log("activeUser doc successfully deleted!");
                    password = "";
                    firebase.auth().signOut().then(function () {
                        document.getElementById("login").value = "Login";
                        chatName = ipAddress
                        colorChange("showHTML00", chatName, "RED", 0);
                        colorChange("showHTML00", chatName, "BLACK", 1000);
                        authState = false;
                        email = "initialize@no-email.given";
                        fbUid = "";
                        if (debug) {
                            console.log("Sign-out successful.");
                        }
                    }).catch(function (error) {
                        console.log("Sign-out error");
                    });
                }).catch(function (error) {
                    console.error("Error removing document: ", error);
                });
            })
        colorChange("showHTML11", "LISTENING", "BLACK", 1000)
    }
}

// CREATE AND/OR UPDATE ACTIVITY DOCUMENT ********** 
function logActivity(inOut) {
    if (debug) {
        console.log("logActivity(" + inOut + ") executed");
    }
    const refActivityDoc = db.collection('activity').doc(ipAddress);
    const refActivityEmail = db.collection('activity').doc(ipAddress);
    let pInc = 1;
    if (inOut === "out") { // wont increment if logging out
        pInc = 0;
    }
    refActivityDoc.get()
        .then(doc => {
            if (doc.exists) { // activity doc for IP address exists (update)
                refActivityDoc.update({
                        tsUpdated: firebase.firestore.Timestamp.now().toMillis(),
                        timestamp: firebase.firestore.Timestamp.now(),
                        accessCount: firebase.firestore.FieldValue.increment(pInc),
                    })
                    .then(function () { // success logging

                        if (email !== "initialize@no-email.given") {
                            refActivityEmail.get()
                                .then(doc => {
                                    refActivityEmail.update({
                                        emailUsed: firebase.firestore.FieldValue.arrayUnion(email)
                                    })
                                })
                        }
                        if (debug) {
                            console.log("Activity document updated for IP: " + ipAddress);
                        }
                    })
                    .catch(function (error) { // error logging
                        console.error("Error updating activity document: ", error);
                    });
            } else { // activity doc for IP address does NOT exists (create)
                refActivityDoc.set(activityData) // creates document
                    .then(function () { // success logging
                        if (debug) {
                            console.log("Activity document written with IP: " + ipAddress);
                        }
                    })
                    .catch(function (error) { // error logging
                        console.error("Error adding activity document: ", error);
                    });
            }
        })
}

// RPS ACTIVE USER DOC CREATION AND UPDATE ********** 
function pingUser() { // creates and/or updates user activity timestamp
    if (authState) {
        const refActiveUser = db.collection('activeUser').doc(fbUid);
        refActiveUser.get()
            .then(doc => {
                if (doc.exists) { // doc exists (update)
                    refActiveUser.update({
                            lastActive: firebase.firestore.Timestamp.now().toMillis(),
                            timestamp: firebase.firestore.Timestamp.now(),
                        })
                        .then(function () { // success logging
                        })
                        .catch(function (error) { // error logging
                            console.error("Error updating activeUser document: ", error);
                        });
                } else { // activity doc for IP address does NOT exists (create)
                    let pingObj = {
                        ipAddress: ipAddress,
                        email: email,
                        lastActive: firebase.firestore.Timestamp.now().toMillis(),
                        timestamp: firebase.firestore.Timestamp.now()
                    }
                    refActiveUser.set(pingObj) // creates activeUser document
                        .then(function () {})
                        .catch(function (error) { // error logging
                            console.error("Error adding activeUser document: ", error);
                        });
                }
            });
    }
}

// RPS PERMANENT USER DOC CREATION AND UPDATE ********** 
function pingRPSUser() {
    if (authState) {
        if (debug) {
            console.log("pingRSPUser() executed");
        }
        const refRPSUser = db.collection('rpsUser').doc(fbUid);
        refRPSUser.get()
            .then(doc => {
                if (doc.exists) { // doc exists (update)
                    if (newbie) {
                        newbie = false;
                        for (i = 0; i < 3; i++) {
                            localScore[i] = localScore[i] + doc.data().record[i];
                            updateScore[i] = localScore[i];
                        }
                        showScores();
                    }
                    refRPSUser.update({
                            lastActive: firebase.firestore.Timestamp.now().toMillis(),
                            timestamp: firebase.firestore.Timestamp.now(),
                            record: updateScore,
                            accessCount: firebase.firestore.FieldValue.increment(1)
                        })
                        .then(function () {
                            updateScore[0, 0, 0]; // zeros update score holder
                        })
                        .catch(function (error) { // error logging
                            console.error("Error updating RPSUser document: ", error);
                        });
                } else { //  doc for IP address does NOT exists (create)
                    let rpsObj = {
                        email: email,
                        record: [0, 0, 0],
                        winRatio: 0,
                        accountOpen: firebase.firestore.Timestamp.now().toMillis(),
                        lastActive: firebase.firestore.Timestamp.now().toMillis(),
                        timestamp: firebase.firestore.Timestamp.now(),
                        accessCount: 1
                    }
                    refRPSUser.set(rpsObj) // creates activeUser document
                        .then(function () {})
                        .catch(function (error) { // error logging
                            console.error("Error adding RPSUser document: ", error);
                        });
                }
            });
    }
}

// CREATE A COLLECTION OF ACTIVE RPS GAME DOCUMENT - BRANCH NEW/UPDATE ********** 
function queryGames(pUid, pPick) {
    if (authState) {
        if (debug) {
            console.log("queryGames(" + pUid + ", " + pPick + ") executed");
        }
        let compArr = [];
        let compPick = [];
        let compRead = [];
        let gameNew = true;
        let stopProcess = false;
        let pDocId = "";

        db.collection("game").where("expires", ">", Date.now()).get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    if (stopProcess === false) {
                        compArr = doc.data().players;
                        compPick = doc.data().playersPick;
                        compRead = doc.data().playersRead;

                        if (compArr.includes(fbUid) === false) {
                            stopProcess = true;
                            gameNew = false;
                            pDocId = doc.id;
                        }
                    }
                })
                if (gameNew) {
                    compArr = [pUid];
                    compPick = [pPick];
                    if (debug) {
                        console.log("launching makeGame for uid: " + pUid)
                    }
                    makeGame(compArr, compPick); // no match with valid TTL
                } else {
                    compArr.push(pUid);
                    compPick.push(pPick);
                    compRead.push(false);
                    updateGame(pDocId, compArr, compPick, compRead); // match with TTL 
                }
            })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });
    }
}

// CREATE A RPS GAME FILE ********** 
function makeGame(compArr, compPick) { // create Game
    if (authState) {
        if (debug) {
            console.log("compArr[], compPick[]) executed");
        }
        const refGame = db.collection("game");
        let pRid;

        let gameObj = {
            expires: firebase.firestore.Timestamp.now().toMillis() + TTL,
            ttl: TTL,
            dead: false,
            players: compArr,
            playersPick: compPick,
            playersRead: [false]
        }
        refGame.add(gameObj) // creates activeUser document
            .then(function (docRef) { // success logging
                if (debug) {
                    console.log("makeGame complete with ID: " + compArr);
                }
            })
            .catch(function (error) { // error logging
                console.error("Error new game document: ", error);
            });
    }
}

// UPDATE AN EXISTING RPS GAME FILE ********** 
function updateGame(pRid, compArr, compPick, compRead) { // create Game
    if (authState) {
        if (debug) {
            console.log("updateGame(" + pRid + ", compArr[], compPick[], compRead[]) executed");
        }
        const refGame = db.collection("game").doc(pRid);
        refGame.get()
            .then(doc => {
                if (doc.exists) { // doc exists (update)
                    refGame.update({
                            players: compArr,
                            playersPick: compPick,
                            playersRead: compRead
                        })
                        .then(function (docRef) {
                            if (debug) {
                                console.log("updateGame complete with ID: ", doc.id);
                            }
                        })
                        .catch(function (error) {
                            console.error("Error update game document: ", error);
                        });
                } else { // activity doc for IP address does NOT exists (create)
                    if (debug) {
                        console.log("doc deleted by other process");
                    }
                }
            });
    }
}

// UPDATE AN EXISTING RPS GAME READ ARR ********** 
function updateRead(pRid, compRead) { // create Game
    if (authState) {
        if (debug) {
            console.log("updateRead(" + pRid + ", compRead[]) executed");
        }
        const refGame = db.collection("game").doc(pRid);
        refGame.get()
            .then(doc => {
                if (doc.exists) { // doc exists (update)
                    refGame.update({
                            playersRead: compRead,
                        })
                        .then(function (docRef) {
                            if (debug) {
                                console.log("updateRead complete with ID: ", doc.id);
                            }
                        })
                        .catch(function (error) {
                            console.error("Error update read document: ", error);
                        });
                } else {
                    if (debug) {
                        console.log("doc deleted by other process");
                    }
                }
            });
    }
}

// REMOVE COMPLETE GAME DOCS - DISTRIBUTED SERVER FUNCTION ON FRONT END
function markDead(pRid) { // create Game
    if (authState) {
        if (debug) {
            console.log("markDead(" + pRid + ") executed");
        }
        colorChange("showHTML11", "DELETING", "RED", 0);
        const refGame = db.collection("game").doc(pRid);
        refGame.get()
            .then(doc => {
                if (doc.exists) { // doc exists (update)
                    refGame.delete().then(function () {
                        console.log("Document successfully deleted!");
                    }).catch(function (error) {
                        console.error("Error removing document: ", error);
                    });
                } else { // game doc does NOT exists 
                    if (debug) {
                        console.log("doc deleted by other process");
                    }
                }
            });
        colorChange("showHTML11", "LISTENING", "BLACK", 2000);
    }
}

// REMOVE EXPIRED TTL DOCS - DISTRIBUTED SERVER FUNCTION ON FRONT END
function wipeExpired() {
    if (authState) {
        if (debug) {
            console.log("wipeExpired() executed");
        }
        colorChange("showHTML11", "PURGING EXPIRED", "RED", 0);
        db.collection("game").where("expires", "<", (timeNow((-1) * archiveTTL))).get() // delete older than +10 min TTL
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    doc.ref.delete().then(function () {
                        console.log("orphaned games successfully deleted!");
                    }).catch(function (error) {
                        console.error("Error removing document: ", error);
                    });
                })
            })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });
        db.collection("activeUser").where("lastActive", "<", (timeNow((-1) * archiveTTL))).get() // delete older than +10 min TTL
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    console.log("IM HERE!")
                    doc.ref.delete().then(function () {
                        console.log("orphaned activeusers successfully deleted!");
                    }).catch(function (error) {
                        console.error("Error removing document: ", error);
                    });
                })
            })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });
        colorChange("showHTML11", "LISTENING", "BLACK", 2000);
    }
}

// COLLECT GAME RESULTS (LOCAL USER) AND PURGE COMPLETED AND COLLECTED GAMES (BACKEND DISTRIBUTED)
function getScores(pUid) {
    if (authState & usersOnline > 1) {
        if (debug) {
            console.log("getScore(" + pUid + ") executed");
        }
        let compArr = []; // working array for player[] in game document
        let compPick = []; // working array for playerPick[] in game document
        let compRead = []; // working array for playerRead[] in game document
        let playerIndex; // player index for arrays
        let playerGesture; // player pick
        let isDead; // flag for complete/incomplete game doc
        let beenRead; // flag for player collecting results from game

        db.collection("game") // queries completed games that contain player id in players array
            .where("expires", "<", timeNow(0))
            .where("players", "array-contains", pUid)
            .get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    compArr = doc.data().players;
                    compPick = doc.data().playersPick;
                    compRead = doc.data().playersRead;
                    chatStuff = ""; // **********************************************
                    isDead = true; // set complete flag to true
                    beenRead = false; // set read before flag to false

                    if (compArr.length != 1) { // not a single player game  
                        for (i = 0; i < compArr.length; i++) {
                            if (fbUid === compArr[i]) { // array element is players element
                                if (doc.data().playersRead[i] === true) {
                                    beenRead = true; // set been read before by player flag to true
                                }
                                playerIndex = i;
                                playerGesture = compPick[i];
                                compRead[i] = true; // mark update array as read
                            }
                            if (doc.data().playersRead[i] === false) { // if at least 1 other player has not read, dead = false
                                isDead = false;
                            }
                        }
                        if (beenRead === false) { // had not been read before
                            for (i = 0; i < compArr.length; i++) {
                                if (playerIndex != i) {
                                    localScore[resultMatrix[playerGesture][compPick[i]]]++; // tallies session W/L/T scores via matrix - session score
                                    updateScore[resultMatrix[playerGesture][compPick[i]]]++; // tallies update W/L/T scores via matrix - resets on user file update 
                                    chatStuff += "You picked: " + pickName[playerGesture] + ", Online Player-" + (i + 1) + ": picked " +
                                        pickName[compPick[i]] + "! You " + action[resultMatrix[playerGesture][compPick[i]]];
                                    if (i > 0) {
                                        chatStuff += "<br />"
                                    }
                                    if (debug) {
                                        console.log("player pick: " + pickName[playerGesture] + " " + action[resultMatrix[playerGesture][compPick[i]]] + " OtherPlayer pick: " + pickName[compPick[i]]);
                                    }
                                }
                            }
                            gameChatReceive(chatStuff);
                            updateRead(doc.id, compRead)
                            if (isDead = true) {
                                markDead(doc.id) // deletes completed games
                            }
                            showScores();
                        }
                    } else {
                        markDead(doc.id) // deletes completed games
                    }
                })
            })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });
    }
}