/* =====================================================
   VIBEFLOW AUTHENTICATION
===================================================== */


/* =====================================================
   STORAGE
===================================================== */

const USERS_KEY = "vibeflowUsers";

const SESSION_KEY = "vibeflowCurrentUser";


/* =====================================================
   GET USERS
===================================================== */

function getUsers() {

    try {

        return JSON.parse(
            localStorage.getItem(USERS_KEY) || "[]"
        );

    } catch (error) {

        return [];

    }

}


/* =====================================================
   SAVE USERS
===================================================== */

function saveUsers(users) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );

}


/* =====================================================
   MESSAGE
===================================================== */

function showMessage(message, type = "error") {

    const box =
        document.getElementById("authMessage");

    if (!box) return;

    box.textContent = message;

    box.className =
        "auth-message show " + type;

}


/* =====================================================
   HIDE MESSAGE
===================================================== */

function hideMessage() {

    const box =
        document.getElementById("authMessage");

    if (!box) return;

    box.className =
        "auth-message";

    box.textContent = "";

}


/* =====================================================
   PASSWORD VISIBILITY
===================================================== */

document
    .querySelectorAll(".password-toggle")
    .forEach(button => {

        button.addEventListener("click", () => {

            const targetId =
                button.dataset.target;

            const input =
                document.getElementById(targetId);

            if (!input) return;


            if (input.type === "password") {

                input.type = "text";

                button.innerHTML =
                    '<i class="fa-regular fa-eye-slash"></i>';

            } else {

                input.type = "password";

                button.innerHTML =
                    '<i class="fa-regular fa-eye"></i>';

            }

        });

    });


/* =====================================================
   LOGIN
===================================================== */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            hideMessage();


            const username =
                document
                    .getElementById("loginUsername")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            if (!username || !password) {

                showMessage(
                    "Please enter your username and password."
                );

                return;

            }


            const users = getUsers();


            const user =
                users.find(
                    item =>
                        item.username.toLowerCase() ===
                            username.toLowerCase() &&
                        item.password === password
                );


            if (!user) {

                showMessage(
                    "Incorrect username or password."
                );

                return;

            }


            /* -----------------------------------------
               CREATE SESSION
            ----------------------------------------- */

            sessionStorage.setItem(
                SESSION_KEY,
                user.username
            );


            showMessage(
                "Login successful! Opening VibeFlow...",
                "success"
            );


            setTimeout(() => {

                window.location.replace(
                    "index.html"
                );

            }, 500);

        }
    );

}


/* =====================================================
   SIGNUP
===================================================== */

const signupForm =
    document.getElementById("signupForm");


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            hideMessage();


            const username =
                document
                    .getElementById("signupUsername")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("signupPassword")
                    .value;


            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;


            const terms =
                document
                    .getElementById("terms")
                    .checked;


            /* -----------------------------------------
               USERNAME VALIDATION
            ----------------------------------------- */

            if (username.length < 3) {

                showMessage(
                    "Username must contain at least 3 characters."
                );

                return;

            }


            if (username.length > 20) {

                showMessage(
                    "Username cannot be longer than 20 characters."
                );

                return;

            }


            /* -----------------------------------------
               USERNAME CHARACTERS
            ----------------------------------------- */

            const validUsername =
                /^[a-zA-Z0-9_]+$/;


            if (!validUsername.test(username)) {

                showMessage(
                    "Username can only contain letters, numbers and underscores."
                );

                return;

            }


            /* -----------------------------------------
               PASSWORD
            ----------------------------------------- */

            if (password.length < 6) {

                showMessage(
                    "Password must contain at least 6 characters."
                );

                return;

            }


            /* -----------------------------------------
               CONFIRM PASSWORD
            ----------------------------------------- */

            if (password !== confirmPassword) {

                showMessage(
                    "Passwords do not match."
                );

                return;

            }


            /* -----------------------------------------
               TERMS
            ----------------------------------------- */

            if (!terms) {

                showMessage(
                    "Please accept the terms to continue."
                );

                return;

            }


            /* -----------------------------------------
               CHECK EXISTING USER
            ----------------------------------------- */

            const users = getUsers();


            const exists =
                users.some(
                    user =>
                        user.username.toLowerCase() ===
                        username.toLowerCase()
                );


            if (exists) {

                showMessage(
                    "That username is already taken."
                );

                return;

            }


            /* -----------------------------------------
               CREATE ACCOUNT
            ----------------------------------------- */

            users.push({

                username: username,

                password: password,

                createdAt:
                    new Date().toISOString()

            });


            saveUsers(users);


            /* -----------------------------------------
               SUCCESS
            ----------------------------------------- */

            showMessage(
                "Account created successfully! Redirecting to login...",
                "success"
            );


            signupForm.reset();


            setTimeout(() => {

                window.location.replace(
                    "login.html"
                );

            }, 900);

        }
    );

}
