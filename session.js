/* =====================================================
   VIBEFLOW SESSION
===================================================== */

const SESSION_KEY =
    "vibeflowCurrentUser";


/* =====================================================
   CHECK LOGIN
===================================================== */

const currentUser =
    sessionStorage.getItem(SESSION_KEY);


if (!currentUser) {

    window.location.replace(
        "login.html"
    );

}


/* =====================================================
   USERNAME
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const usernameDisplay =
            document.getElementById(
                "usernameDisplay"
            );


        const userAvatar =
            document.getElementById(
                "userAvatar"
            );


        if (currentUser) {

            if (usernameDisplay) {

                usernameDisplay.textContent =
                    currentUser;

            }


            if (userAvatar) {

                userAvatar.textContent =
                    currentUser
                        .charAt(0)
                        .toUpperCase();

            }

        }


        /* ---------------------------------------------
           LOGOUT
        --------------------------------------------- */

        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );


        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                () => {

                    sessionStorage.removeItem(
                        SESSION_KEY
                    );


                    window.location.replace(
                        "login.html"
                    );

                }
            );

        }

    }
);
