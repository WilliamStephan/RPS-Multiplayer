if (debug) { // logs linked scripts if debug set to true
    console.log("modal.js linked");
}

function modalClick(e) { // click events for login modal
    if (debug) {
        console.log("modalClick function: " + e.getAttribute('id') + " was processed")
    }

    if (e.getAttribute('id') === 'new-account') { // new account clicked
        if (e.checked) { // toggles modal box labeling new/login
            modalMode = "new";
            document.getElementById("dialog-title").textContent = "New User";
            document.getElementById("goLogin").textContent = "Create New User";
            document.getElementById("login-reset").style.display = "none";
        } else {
            modalMode = "login";
            document.getElementById("dialog-title").textContent = "RPS Login";
            document.getElementById("goLogin").textContent = "Login";
            document.getElementById("login-reset").style.display = "block";
        }
    }

    if (e.getAttribute('id') === 'reset-account') { // reset account clicked
        if (e.checked) { // toggles modal box labeling reset/login
            modalMode = "reset";
            document.getElementById("dialog-title").textContent = "Reset Password";
            document.getElementById("goLogin").textContent = "Send Reset Email";
            document.getElementById("login-checkbox").style.display = "none";
            document.getElementById("password-block").style.display = "none";
        } else {
            modalMode = "login";
            document.getElementById("dialog-title").textContent = "RPS Login";
            document.getElementById("goLogin").textContent = "Login";
            document.getElementById("login-checkbox").style.display = "block";
            document.getElementById("password-block").style.display = "block";
        }
    }

    if (e.getAttribute('id') === 'goLogin') { // go button clicked
        let rv;
        email = document.getElementById("user-name").value;
        password = document.getElementById("current-password").value;
        if (modalMode === "reset") {
            if (validateEmail(email)) {
                // password reset here
                console.log("about to reset");
                firebase.auth().sendPasswordResetEmail(email).then(function () {
                    if (debug) {
                        console.log("Reset email to to: " + email)
                    }
                    hideModal();
                }).catch(function (error) {
                    if (debug) { // An error happened.
                        console.log(errorCode);
                        console.log(errorMessage);
                    }
                });
            } else {
                alert(email + " is not a valid email address!")
            }
        }
        if (modalMode === "new") {
            if (validateEmail(email) && password.length >= 6) {
                // new account here
                firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
                    if (debug) {
                        console.log(errorCode)
                        console.log(errorMessage)
                    }
                });
                // verify new email address
                setTimeout(function () { // need a few seconds for new doc to set
                    user = firebase.auth().currentUser;
                    user.sendEmailVerification().then(function () {
                        // Email sent.
                        hideModal()
                    }).catch(function (error) {
                        if (debug) {
                            console.log(errorCode)
                            console.log(errorMessage)
                        }
                        // An error happened.
                    });
                }, 3000);
            } else {
                alert(email + " is not a valid or password is less than 6 characters.");
            }
        }
        if (modalMode === "login") {
            if (validateEmail(email) && password.length >= 6) {
                // Login here
                firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    if (debug) {
                        console.log("error code is: " + errorCode)
                        console.log("error message is: " + errorMessage)
                    }
                });
                if (debug) {
                    console.log("user is: " + firebase.auth().currentUser);
                }
            } else {
                alert(email + " is not a valid or password is less than 6 characters.");
            }
        }
    }
}

function showModal() { // resets and displays modal 
    modalMode = "login";
    document.getElementById("dialog-title").textContent = "RPS Login";
    document.getElementById("goLogin").textContent = "Login";
    document.getElementById("new-account").checked = false;
    document.getElementById("reset-account").checked = false;
    document.getElementById("login-checkbox").style.display = "block";
    document.getElementById("password-block").style.display = "block";
    document.getElementById("login-reset").style.display = "block";
    // document.getElementById("goLogin").disabled = true;
    $('#myLogin').modal('show');
};

function hideModal() { // hides modal
    $('#myLogin').modal('hide');
};