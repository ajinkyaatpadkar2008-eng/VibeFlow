/* =========================================
   VIBEFLOW AUTHENTICATION
   LocalStorage demo authentication
========================================= */


/* =========================================
   STORAGE KEYS
========================================= */

const USERS_KEY = "vibeflowUsers";
const CURRENT_USER_KEY = "vibeflowCurrentUser";


/* =========================================
   GET USERS
========================================= */

function getUsers() {

    try {

        const users =
            localStorage.getItem(
                USERS_KEY
            );

        return users
            ? JSON.parse(users)
            : [];

    } catch (error) {

        console.error(
            "Unable to read users:",
            error
        );

        return [];

    }

}


/* =========================================
   SAVE USERS
========================================= */

function saveUsers(users) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );

}


/* =========================================
   CURRENT USER
========================================= */

function getCurrentUser() {

    try {

        const user =
            localStorage.getItem(
                CURRENT_USER_KEY
            );

        return user
            ? JSON.parse(user)
            : null;

    } catch {

        return null;

    }

}


/* =========================================
   SHOW MESSAGE
========================================= */

function showMessage(
    message,
    type = "error"
) {

    const messageBox =
        document.getElementById(
            "authMessage"
        );

    if (!messageBox) return;

    messageBox.textContent =
        message;

    messageBox.className =
        `auth-message show ${type}`;

}


/* =========================================
   CLEAR MESSAGE
========================================= */

function clearMessage() {

    const messageBox =
        document.getElementById(
            "authMessage"
        );

    if (!messageBox) return;

    messageBox.textContent = "";

    messageBox.className =
        "auth-message";

}


/* =========================================
   EMAIL VALIDATION
========================================= */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


/* =========================================
   PASSWORD STRENGTH
========================================= */

function getPasswordStrength(password) {

    if (!password) {

        return {
            score: 0,
            text: "Use at least 6 characters"
        };

    }


    let score = 0;


    if (password.length >= 6) {
        score++;
    }

    if (password.length >= 10) {
        score++;
    }

    if (/[A-Z]/.test(password)) {
        score++;
    }

    if (/[0-9]/.test(password)) {
        score++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        score++;
    }


    let text = "Weak";


    if (score >= 4) {

        text = "Strong";

    } else if (score >= 2) {

        text = "Good";

    }


    return {
        score,
        text
    };

}


/* =========================================
   PASSWORD STRENGTH UI
========================================= */

const signupPassword =
    document.getElementById(
        "signupPassword"
    );

const strengthBar =
    document.getElementById(
        "strengthBar"
    );

const strengthText =
    document.getElementById(
        "strengthText"
    );


if (
    signupPassword &&
    strengthBar &&
    strengthText
) {

    signupPassword.addEventListener(
        "input",
        () => {

            const result =
                getPasswordStrength(
                    signupPassword.value
                );


            const percentage =
                Math.min(
                    result.score * 20,
                    100
                );


            strengthBar.style.width =
                `${percentage}%`;


            strengthText.textContent =
                result.text;


            if (
                !signupPassword.value
            ) {

                strengthText.textContent =
                    "Use at least 6 characters";

            }

        }
    );

}


/* =========================================
   SHOW / HIDE PASSWORD
========================================= */

document
    .querySelectorAll(
        ".password-toggle"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const targetId =
                        button.dataset.target;


                    const input =
                        document.getElementById(
                            targetId
                        );


                    if (!input) return;


                    const icon =
                        button.querySelector(
                            "i"
                        );


                    if (
                        input.type ===
                        "password"
                    ) {

                        input.type =
                            "text";


                        icon.className =
                            "fa-regular fa-eye-slash";


                        button.setAttribute(
                            "aria-label",
                            "Hide password"
                        );

                    } else {

                        input.type =
                            "password";


                        icon.className =
                            "fa-regular fa-eye";


                        button.setAttribute(
                            "aria-label",
                            "Show password"
                        );

                    }

                }
            );

        }
    );


/* =========================================
   SIGNUP
========================================= */

const signupForm =
    document.getElementById(
        "signupForm"
    );


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            clearMessage();


            const name =
                document
                    .getElementById(
                        "signupName"
                    )
                    .value
                    .trim();


            const email =
                document
                    .getElementById(
                        "signupEmail"
                    )
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById(
                        "signupPassword"
                    )
                    .value;


            const confirmPassword =
                document
                    .getElementById(
                        "confirmPassword"
                    )
                    .value;


            const terms =
                document
                    .getElementById(
                        "terms"
                    )
                    .checked;


            /* NAME */

            if (
                name.length < 2
            ) {

                showMessage(
                    "Please enter your name."
                );

                return;

            }


            /* EMAIL */

            if (
                !isValidEmail(email)
            ) {

                showMessage(
                    "Please enter a valid email address."
                );

                return;

            }


            /* PASSWORD */

            if (
                password.length < 6
            ) {

                showMessage(
                    "Password must contain at least 6 characters."
                );

                return;

            }


            /* CONFIRM PASSWORD */

            if (
                password !==
                confirmPassword
            ) {

                showMessage(
                    "Passwords do not match."
                );

                return;

            }


            /* TERMS */

            if (!terms) {

                showMessage(
                    "Please confirm that you understand how this demo stores account data."
                );

                return;

            }


            /* EXISTING USERS */

            const users =
                getUsers();


            const alreadyExists =
                users.some(
                    user =>
                        user.email ===
                        email
                );


            if (alreadyExists) {

                showMessage(
                    "An account with this email already exists. Please sign in."
                );

                return;

            }


            /* CREATE USER */

            const newUser = {

                id:
                    generateUserId(),

                name,

                email,

                password,

                createdAt:
                    new Date().toISOString()

            };


            users.push(
                newUser
            );


            saveUsers(
                users
            );


            /* LOG USER IN */

            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify({
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email
                })
            );


            showMessage(
                "Account created successfully! Opening VibeFlow...",
                "success"
            );


            const signupButton =
                document.getElementById(
                    "signupButton"
                );


            signupButton.disabled =
                true;


            setTimeout(
                () => {

                    window.location.href =
                        "index.html";

                },
                900
            );

        }
    );

}


/* =========================================
   LOGIN
========================================= */

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            clearMessage();


            const email =
                document
                    .getElementById(
                        "loginEmail"
                    )
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById(
                        "loginPassword"
                    )
                    .value;


            const rememberMe =
                document
                    .getElementById(
                        "rememberMe"
                    )
                    .checked;


            /* VALIDATE */

            if (
                !isValidEmail(email)
            ) {

                showMessage(
                    "Please enter a valid email address."
                );

                return;

            }


            if (!password) {

                showMessage(
                    "Please enter your password."
                );

                return;

            }


            /* FIND USER */

            const users =
                getUsers();


            const user =
                users.find(
                    item =>
                        item.email ===
                        email
                );


            if (!user) {

                showMessage(
                    "No account was found with that email address."
                );

                return;

            }


            /* CHECK PASSWORD */

            if (
                user.password !==
                password
            ) {

                showMessage(
                    "Incorrect password. Please try again."
                );

                return;

            }


            /* SAVE CURRENT USER */

            const session = {

                id: user.id,

                name: user.name,

                email: user.email

            };


            /*
                For this localStorage version,
                both options use localStorage.

                "Remember me" is kept in the UI
                for future authentication upgrades.
            */

            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(
                    session
                )
            );


            showMessage(
                `Welcome back, ${user.name}! Opening VibeFlow...`,
                "success"
            );


            const loginButton =
                document.getElementById(
                    "loginButton"
                );


            loginButton.disabled =
                true;


            setTimeout(
                () => {

                    window.location.href =
                        "index.html";

                },
                700
            );

        }
    );

}


/* =========================================
   USER ID
========================================= */

function generateUserId() {

    return (
        "vf_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}