/* =========================================================
   VIBEFLOW AUTH
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const USERS_KEY =
    "vibeFlowUsers";

const CURRENT_USER_KEY =
    "vibeFlowCurrentUser";


/* =========================================================
   HELPERS
========================================================= */

function getUsers() {

    return JSON.parse(
        localStorage.getItem(
            USERS_KEY
        ) || "[]"
    );

}


function saveUsers(
    users
) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );

}


function setMessage(
    element,
    message,
    type
) {

    if (!element) {
        return;
    }


    element.textContent =
        message;

    element.className =
        "auth-message " +
        type;

}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

document
    .querySelectorAll(
        ".password-toggle"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const input =
                    document.getElementById(
                        button.dataset.target
                    );


                if (!input) {
                    return;
                }


                const showing =
                    input.type ===
                    "text";


                input.type =
                    showing
                        ? "password"
                        : "text";


                button.innerHTML =
                    showing

                        ? '<i class="fa-solid fa-eye"></i>'

                        : '<i class="fa-solid fa-eye-slash"></i>';

            }
        );

    });


/* =========================================================
   SIGNUP
========================================================= */

const signupForm =
    document.getElementById(
        "signupForm"
    );


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


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


            const confirm =
                document
                    .getElementById(
                        "signupConfirm"
                    )
                    .value;


            const message =
                document.getElementById(
                    "signupMessage"
                );


            if (
                name.length < 2
            ) {

                setMessage(
                    message,
                    "Please enter your name.",
                    "error"
                );

                return;

            }


            if (
                password.length < 6
            ) {

                setMessage(
                    message,
                    "Password must be at least 6 characters.",
                    "error"
                );

                return;

            }


            if (
                password !== confirm
            ) {

                setMessage(
                    message,
                    "Passwords do not match.",
                    "error"
                );

                return;

            }


            const users =
                getUsers();


            const exists =
                users.some(
                    user =>
                        user.email ===
                        email
                );


            if (exists) {

                setMessage(
                    message,
                    "An account with this email already exists.",
                    "error"
                );

                return;

            }


            const newUser = {

                id:
                    Date.now()
                    .toString(),

                name,

                email,

                password

            };


            users.push(
                newUser
            );


            saveUsers(
                users
            );


            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify({
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email
                })
            );


            setMessage(
                message,
                "Account created! Redirecting...",
                "success"
            );


            setTimeout(
                () => {

                    window.location.href =
                        "index.html";

                },
                800
            );

        }
    );

}


/* =========================================================
   LOGIN
========================================================= */

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


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


            const message =
                document.getElementById(
                    "loginMessage"
                );


            const users =
                getUsers();


            const user =
                users.find(
                    item =>
                        item.email === email &&
                        item.password === password
                );


            if (!user) {

                setMessage(
                    message,
                    "Incorrect email or password.",
                    "error"
                );

                return;

            }


            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify({
                    id: user.id,
                    name: user.name,
                    email: user.email
                })
            );


            setMessage(
                message,
                "Login successful! Redirecting...",
                "success"
            );


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
