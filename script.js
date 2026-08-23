/* =========================================================
   VIBEFLOW - DUAL MUSIC ENGINE
   ---------------------------------------------------------
   iTunes  -> 30-second previews
   Jamendo -> full tracks (where available)
   ========================================================= */


/* =========================================================
   1. API CONFIGURATION
   ========================================================= */

// iTunes does NOT require an API key.
const ITUNES_API =
    "https://itunes.apple.com/search";


// ---------------------------------------------------------
// JAMENDO
// ---------------------------------------------------------
// IMPORTANT:
// Put your Jamendo Client ID here.
//
// Example:
// const JAMENDO_CLIENT_ID = "123456789";
//
// If you don't have one yet, leave it empty.
// iTunes will continue working.
// ---------------------------------------------------------

const JAMENDO_CLIENT_ID = "";


const JAMENDO_API =
    "https://api.jamendo.com/v3.0/tracks/";


/* =========================================================
   2. GLOBAL STATE
   ========================================================= */

let songs = [];

let currentIndex = -1;

let shuffle = false;

let repeat = false;

let previousVolume = 0.8;


/* =========================================================
   3. LOCAL STORAGE
   ========================================================= */

let favorites =
    JSON.parse(
        localStorage.getItem(
            "vibeflowFavorites"
        ) || "[]"
    );


let recent =
    JSON.parse(
        localStorage.getItem(
            "vibeflowRecent"
        ) || "[]"
    );


/* =========================================================
   4. HTML ELEMENTS
   ========================================================= */

const audio =
    document.getElementById("audio");

const songGrid =
    document.getElementById("songGrid");

const searchInput =
    document.getElementById("searchInput");

const clearSearch =
    document.getElementById("clearSearch");

const status =
    document.getElementById("status");

const sectionTitle =
    document.getElementById("sectionTitle");

const playerCover =
    document.getElementById("playerCover");

const playerTitle =
    document.getElementById("playerTitle");

const playerArtist =
    document.getElementById("playerArtist");

const playerFavorite =
    document.getElementById(
        "playerFavorite"
    );

const playBtn =
    document.getElementById("playBtn");

const previousBtn =
    document.getElementById(
        "previousBtn"
    );

const nextBtn =
    document.getElementById("nextBtn");

const shuffleBtn =
    document.getElementById(
        "shuffleBtn"
    );

const repeatBtn =
    document.getElementById(
        "repeatBtn"
    );

const progress =
    document.getElementById("progress");

const currentTime =
    document.getElementById(
        "currentTime"
    );

const duration =
    document.getElementById(
        "duration"
    );

const volume =
    document.getElementById("volume");

const muteBtn =
    document.getElementById(
        "muteBtn"
    );

const recentList =
    document.getElementById(
        "recentList"
    );


/* =========================================================
   5. STATUS MESSAGE
   ========================================================= */

function setStatus(
    message,
    type = ""
) {

    if (!status) return;

    status.className =
        "status " + type;

    if (type === "loading") {

        status.innerHTML =
            `
            <i class="fa-solid fa-circle-notch fa-spin"></i>
            ${escapeHTML(message)}
            `;

    } else {

        status.textContent =
            message;

    }

}


/* =========================================================
   6. SEARCH BOTH APIs
   ========================================================= */

async function searchMusic(
    term = "top hits"
) {

    term =
        term.trim();


    if (!term) {

        term = "top hits";

    }


    setStatus(
        `Searching for "${term}"...`,
        "loading"
    );


    songGrid.innerHTML = "";


    try {

        /*
         * Run both searches at the
         * same time.
         */

        const results =
            await Promise.allSettled([

                searchITunes(term),

                searchJamendo(term)

            ]);


        let itunesSongs = [];

        let jamendoSongs = [];


        if (
            results[0].status ===
            "fulfilled"
        ) {

            itunesSongs =
                results[0].value;

        }


        if (
            results[1].status ===
            "fulfilled"
        ) {

            jamendoSongs =
                results[1].value;

        }


        /*
         * Full tracks first.
         * Preview tracks after.
         */

        songs = [

            ...jamendoSongs,

            ...itunesSongs

        ];


        /*
         * Remove duplicates.
         */

        songs =
            removeDuplicates(
                songs
            );


        if (!songs.length) {

            showEmpty(
                `No music found for "${term}".`
            );


            setStatus(
                "No music found",
                "error"
            );


            return;

        }


        displaySongs();


        /*
         * Load first song into player,
         * but don't automatically play.
         */

        loadSong(
            0,
            false
        );


        let fullCount =
            songs.filter(
                song =>
                    song.type ===
                    "full"
            ).length;


        let previewCount =
            songs.filter(
                song =>
                    song.type ===
                    "preview"
            ).length;


        setStatus(
            `${songs.length} songs • ${fullCount} full tracks • ${previewCount} previews`,
            "success"
        );


    } catch (error) {

        console.error(error);


        showEmpty(
            "Unable to load music. Check your internet connection."
        );


        setStatus(
            "Music service unavailable",
            "error"
        );

    }

}


/* =========================================================
   7. ITUNES SEARCH
   ========================================================= */

async function searchITunes(
    term
) {

    const url =
        new URL(
            ITUNES_API
        );


    url.searchParams.set(
        "term",
        term
    );


    url.searchParams.set(
        "media",
        "music"
    );


    url.searchParams.set(
        "entity",
        "song"
    );


    url.searchParams.set(
        "limit",
        "30"
    );


    const response =
        await fetch(
            url.toString()
        );


    if (!response.ok) {

        throw new Error(
            "iTunes request failed"
        );

    }


    const data =
        await response.json();


    return data.results

        .filter(
            song =>
                song.previewUrl
        )

        .map(
            song => {

                let cover =
                    song.artworkUrl100 ||
                    "";


                cover =
                    cover.replace(
                        "100x100",
                        "600x600"
                    );


                return {

                    id:
                        "itunes-" +
                        song.trackId,

                    source:
                        "iTunes",

                    type:
                        "preview",

                    title:
                        song.trackName,

                    artist:
                        song.artistName,

                    album:
                        song.collectionName,

                    cover:
                        cover,

                    audio:
                        song.previewUrl,

                    duration:
                        song.trackTimeMillis ||
                        0

                };

            }

        );

}


/* =========================================================
   8. JAMENDO SEARCH
   ========================================================= */

async function searchJamendo(
    term
) {

    /*
     * If there is no Client ID,
     * don't break the entire application.
     */

    if (
        !JAMENDO_CLIENT_ID
    ) {

        return [];

    }


    const url =
        new URL(
            JAMENDO_API
        );


    url.searchParams.set(
        "client_id",
        JAMENDO_CLIENT_ID
    );


    url.searchParams.set(
        "format",
        "json"
    );


    url.searchParams.set(
        "namesearch",
        term
    );


    url.searchParams.set(
        "limit",
        "30"
    );


    url.searchParams.set(
        "include",
        "musicinfo"
    );


    url.searchParams.set(
        "audioformat",
        "mp32"
    );


    const response =
        await fetch(
            url.toString()
        );


    if (!response.ok) {

        throw new Error(
            "Jamendo request failed"
        );

    }


    const data =
        await response.json();


    if (
        !data.results
    ) {

        return [];

    }


    return data.results

        .filter(
            track =>
                track.audio
        )

        .map(
            track => {

                return {

                    id:
                        "jamendo-" +
                        track.id,

                    source:
                        "Jamendo",

                    type:
                        "full",

                    title:
                        track.name,

                    artist:
                        track.artist_name,

                    album:
                        track.album_name ||
                        "Jamendo",

                    cover:
                        track.album_image ||
                        track.image ||
                        "",

                    audio:
                        track.audio,

                    duration:
                        track.duration ||
                        0

                };

            }

        );

}


/* =========================================================
   9. REMOVE DUPLICATES
   ========================================================= */

function removeDuplicates(
    list
) {

    const seen =
        new Set();


    return list.filter(
        song => {

            const key =
                (
                    song.title +
                    "-" +
                    song.artist
                )
                .toLowerCase();


            if (
                seen.has(key)
            ) {

                return false;

            }


            seen.add(key);

            return true;

        }
    );

}


/* =========================================================
   10. DISPLAY SONGS
   ========================================================= */

function displaySongs() {

    songGrid.innerHTML = "";


    songs.forEach(
        (
            song,
            index
        ) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "song-card";


            const liked =
                favorites.includes(
                    song.id
                );


            const badge =
                song.type ===
                "full"

                ? `
                    <span class="music-badge full">
                        FULL
                    </span>
                  `

                : `
                    <span class="music-badge preview">
                        30 SEC
                    </span>
                  `;


            card.innerHTML = `

                <div class="song-image">

                    <img
                        src="${escapeHTML(
                            song.cover
                        )}"
                        alt="${escapeHTML(
                            song.title
                        )}"
                        loading="lazy"
                    >

                    ${badge}

                    <button
                        class="song-play"
                    >

                        <i
                            class="fa-solid fa-play"
                        ></i>

                    </button>

                </div>


                <div class="song-info">

                    <h3>
                        ${escapeHTML(
                            song.title
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            song.artist
                        )}
                    </p>

                </div>


                <button
                    class="card-heart ${
                        liked
                        ? "liked"
                        : ""
                    }"
                >

                    <i
                        class="${
                            liked
                            ? "fa-solid"
                            : "fa-regular"
                        } fa-heart"
                    ></i>

                </button>

            `;


            const play =
                card.querySelector(
                    ".song-play"
                );


            play.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    loadSong(
                        index,
                        true
                    );

                }
            );


            const heart =
                card.querySelector(
                    ".card-heart"
                );


            heart.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    toggleFavorite(
                        song
                    );

                }
            );


            card.addEventListener(
                "click",
                () => {

                    loadSong(
                        index,
                        true
                    );

                }
            );


            songGrid.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   11. LOAD SONG
   ========================================================= */

function loadSong(
    index,
    autoplay = false
) {

    if (
        !songs[index]
    ) {

        return;

    }


    currentIndex =
        index;


    const song =
        songs[index];


    audio.pause();


    audio.src =
        song.audio;


    audio.load();


    playerCover.src =
        song.cover;


    playerTitle.textContent =
        song.title;


    playerArtist.textContent =
        `${song.artist} • ${song.type === "full" ? "Full Track" : "30-sec Preview"}`;


    progress.value =
        0;


    currentTime.textContent =
        "0:00";


    duration.textContent =
        "0:00";


    updateFavoriteButton();


    if (autoplay) {

        audio.play()
            .catch(
                error => {

                    console.log(
                        "Playback waiting for user interaction"
                    );

                }
            );

    }

}


/* =========================================================
   12. PLAY / PAUSE
   ========================================================= */

playBtn.addEventListener(
    "click",
    () => {

        if (
            !audio.src
        ) {

            if (
                songs.length
            ) {

                loadSong(
                    0,
                    true
                );

            }

            return;

        }


        if (
            audio.paused
        ) {

            audio.play();

        } else {

            audio.pause();

        }

    }
);


/* =========================================================
   13. AUDIO PLAY
   ========================================================= */

audio.addEventListener(
    "play",
    () => {

        playBtn.innerHTML =
            `
            <i class="fa-solid fa-pause"></i>
            `;


        addRecent();

    }
);


/* =========================================================
   14. AUDIO PAUSE
   ========================================================= */

audio.addEventListener(
    "pause",
    () => {

        playBtn.innerHTML =
            `
            <i class="fa-solid fa-play"></i>
            `;

    }
);


/* =========================================================
   15. NEXT
   ========================================================= */

nextBtn.addEventListener(
    "click",
    nextSong
);


function nextSong() {

    if (
        !songs.length
    ) {

        return;

    }


    let nextIndex;


    if (shuffle) {

        nextIndex =
            Math.floor(
                Math.random() *
                songs.length
            );

    } else {

        nextIndex =
            currentIndex + 1;


        if (
            nextIndex >=
            songs.length
        ) {

            nextIndex = 0;

        }

    }


    loadSong(
        nextIndex,
        true
    );

}


/* =========================================================
   16. PREVIOUS
   ========================================================= */

previousBtn.addEventListener(
    "click",
    () => {

        if (
            audio.currentTime >
            3
        ) {

            audio.currentTime =
                0;

            return;

        }


        let index =
            currentIndex - 1;


        if (
            index < 0
        ) {

            index =
                songs.length - 1;

        }


        loadSong(
            index,
            true
        );

    }
);


/* =========================================================
   17. SONG ENDED
   ========================================================= */

audio.addEventListener(
    "ended",
    () => {

        if (repeat) {

            audio.currentTime =
                0;

            audio.play();

        } else {

            nextSong();

        }

    }
);


/* =========================================================
   18. SHUFFLE
   ========================================================= */

shuffleBtn.addEventListener(
    "click",
    () => {

        shuffle =
            !shuffle;


        shuffleBtn.classList.toggle(
            "active",
            shuffle
        );

    }
);


/* =========================================================
   19. REPEAT
   ========================================================= */

repeatBtn.addEventListener(
    "click",
    () => {

        repeat =
            !repeat;


        repeatBtn.classList.toggle(
            "active",
            repeat
        );

    }
);


/* =========================================================
   20. PROGRESS
   ========================================================= */

audio.addEventListener(
    "timeupdate",
    () => {

        if (
            !audio.duration
        ) {

            return;

        }


        progress.value =
            (
                audio.currentTime /
                audio.duration
            ) * 100;


        currentTime.textContent =
            formatTime(
                audio.currentTime
            );

    }
);


audio.addEventListener(
    "loadedmetadata",
    () => {

        duration.textContent =
            formatTime(
                audio.duration
            );

    }
);


progress.addEventListener(
    "input",
    () => {

        if (
            !audio.duration
        ) {

            return;

        }


        audio.currentTime =
            (
                Number(
                    progress.value
                ) / 100
            ) *
            audio.duration;

    }
);


/* =========================================================
   21. VOLUME
   ========================================================= */

audio.volume =
    0.8;


volume.value =
    0.8;


volume.addEventListener(
    "input",
    () => {

        audio.volume =
            Number(
                volume.value
            );


        if (
            audio.volume >
            0
        ) {

            previousVolume =
                audio.volume;

        }


        updateVolumeIcon();

    }
);


/* =========================================================
   22. MUTE
   ========================================================= */

muteBtn.addEventListener(
    "click",
    () => {

        if (
            audio.volume > 0
        ) {

            previousVolume =
                audio.volume;

            audio.volume =
                0;

            volume.value =
                0;

        } else {

            audio.volume =
                previousVolume ||
                0.8;

            volume.value =
                audio.volume;

        }


        updateVolumeIcon();

    }
);


function updateVolumeIcon() {

    if (
        audio.volume === 0
    ) {

        muteBtn.innerHTML =
            `
            <i class="fa-solid fa-volume-xmark"></i>
            `;

    } else {

        muteBtn.innerHTML =
            `
            <i class="fa-solid fa-volume-high"></i>
            `;

    }

}


/* =========================================================
   23. SEARCH
   ========================================================= */

let searchTimer;


searchInput.addEventListener(
    "input",
    () => {

        clearTimeout(
            searchTimer
        );


        const term =
            searchInput.value.trim();


        clearSearch.style.display =
            term
            ? "block"
            : "none";


        searchTimer =
            setTimeout(
                () => {

                    if (term) {

                        sectionTitle.textContent =
                            `Results for "${term}"`;

                        searchMusic(
                            term
                        );

                    } else {

                        sectionTitle.textContent =
                            "Quick Picks";

                        searchMusic(
                            "top hits"
                        );

                    }

                },
                500
            );

    }
);


searchInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            clearTimeout(
                searchTimer
            );


            searchMusic(
                searchInput.value
            );

        }

    }
);


/* =========================================================
   24. CLEAR SEARCH
   ========================================================= */

clearSearch.addEventListener(
    "click",
    () => {

        searchInput.value =
            "";


        clearSearch.style.display =
            "none";


        sectionTitle.textContent =
            "Quick Picks";


        searchMusic(
            "top hits"
        );

    }
);


/* =========================================================
   25. GENRES
   ========================================================= */

document
    .querySelectorAll(
        "[data-search]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const term =
                        button.dataset.search;


                    searchInput.value =
                        term;


                    clearSearch.style.display =
                        "block";


                    sectionTitle.textContent =
                        term;


                    searchMusic(
                        term
                    );

                }
            );

        }
    );


/* =========================================================
   26. HERO PLAY
   ========================================================= */

const heroPlay =
    document.getElementById(
        "heroPlay"
    );


if (heroPlay) {

    heroPlay.addEventListener(
        "click",
        () => {

            if (
                currentIndex === -1
            ) {

                loadSong(
                    0,
                    true
                );

            } else {

                audio.play();

            }

        }
    );

}


/* =========================================================
   27. HERO SHUFFLE
   ========================================================= */

const heroShuffle =
    document.getElementById(
        "heroShuffle"
    );


if (heroShuffle) {

    heroShuffle.addEventListener(
        "click",
        () => {

            shuffle =
                true;


            shuffleBtn.classList.add(
                "active"
            );


            nextSong();

        }
    );

}


/* =========================================================
   28. FAVORITES
   ========================================================= */

function toggleFavorite(
    song
) {

    const exists =
        favorites.includes(
            song.id
        );


    if (exists) {

        favorites =
            favorites.filter(
                id =>
                    id !== song.id
            );

    } else {

        favorites.push(
            song.id
        );

    }


    localStorage.setItem(
        "vibeflowFavorites",
        JSON.stringify(
            favorites
        )
    );


    displaySongs();


    updateFavoriteButton();

}


/* =========================================================
   29. PLAYER FAVORITE
   ========================================================= */

playerFavorite.addEventListener(
    "click",
    () => {

        if (
            songs[currentIndex]
        ) {

            toggleFavorite(
                songs[currentIndex]
            );

        }

    }
);


function updateFavoriteButton() {

    if (
        !songs[currentIndex]
    ) {

        return;

    }


    const liked =
        favorites.includes(
            songs[currentIndex].id
        );


    playerFavorite.innerHTML =
        liked

        ? `
            <i class="fa-solid fa-heart"></i>
          `

        : `
            <i class="fa-regular fa-heart"></i>
          `;

}


/* =========================================================
   30. RECENTLY PLAYED
   ========================================================= */

function addRecent() {

    const song =
        songs[currentIndex];


    if (!song) {

        return;

    }


    recent =
        recent.filter(
            item =>
                item.id !==
                song.id
        );


    recent.unshift(
        song
    );


    recent =
        recent.slice(
            0,
            10
        );


    localStorage.setItem(
        "vibeflowRecent",
        JSON.stringify(
            recent
        )
    );


    displayRecent();

}


function displayRecent() {

    if (
        !recent.length
    ) {

        recentList.innerHTML =
            `
            <p style="
                color:#777;
                padding:20px 0;
            ">
                Play some music and it will
                appear here.
            </p>
            `;

        return;

    }


    recentList.innerHTML =
        "";


    recent.forEach(
        song => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "recent-item";


            item.innerHTML =
                `

                <img
                    src="${escapeHTML(
                        song.cover
                    )}"
                    alt=""
                >

                <div class="recent-info">

                    <strong>
                        ${escapeHTML(
                            song.title
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            song.artist
                        )}
                    </span>

                </div>

                <button>

                    <i
                        class="fa-solid fa-play"
                    ></i>

                </button>

                `;


            item.addEventListener(
                "click",
                () => {

                    const index =
                        songs.findIndex(
                            current =>
                                current.id ===
                                song.id
                        );


                    if (
                        index !== -1
                    ) {

                        loadSong(
                            index,
                            true
                        );

                    }

                }
            );


            recentList.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   31. NAVIGATION
   ========================================================= */

document
    .querySelectorAll(
        ".nav-item"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".nav-item"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );


                    const page =
                        button.dataset.page;


                    if (
                        page === "home"
                    ) {

                        sectionTitle.textContent =
                            "Quick Picks";


                        searchMusic(
                            "top hits"
                        );

                    }


                    if (
                        page === "discover"
                    ) {

                        sectionTitle.textContent =
                            "Discover";


                        searchMusic(
                            "new music"
                        );

                    }


                    if (
                        page === "favorites"
                    ) {

                        showFavorites();

                    }


                    if (
                        page === "recent"
                    ) {

                        showRecentPage();

                    }


                    if (
                        page === "playlist"
                    ) {

                        showPlaylist();

                    }

                }
            );

        }
    );


/* =========================================================
   32. FAVORITES PAGE
   ========================================================= */

function showFavorites() {

    sectionTitle.textContent =
        "Your Favorites";


    const list =
        songs.filter(
            song =>
                favorites.includes(
                    song.id
                )
        );


    if (
        !list.length
    ) {

        showEmpty(
            "You haven't added any favorites yet."
        );

        return;

    }


    const oldSongs =
        songs;


    songs =
        list;


    displaySongs();


    songs =
        oldSongs;

}


/* =========================================================
   33. RECENT PAGE
   ========================================================= */

function showRecentPage() {

    sectionTitle.textContent =
        "Recently Played";


    if (
        !recent.length
    ) {

        showEmpty(
            "Nothing has been played yet."
        );

        return;

    }


    const oldSongs =
        songs;


    songs =
        recent;


    displaySongs();


    songs =
        oldSongs;

}


/* =========================================================
   34. PLAYLIST
   ========================================================= */

function showPlaylist() {

    sectionTitle.textContent =
        "My Playlist";


    /*
     * For this $0 version we use
     * recently played as the first
     * playlist implementation.
     */

    if (
        !recent.length
    ) {

        showEmpty(
            "Your playlist is empty."
        );

        return;

    }


    const oldSongs =
        songs;


    songs =
        recent;


    displaySongs();


    songs =
        oldSongs;

}


/* =========================================================
   35. MOBILE MENU
   ========================================================= */

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );


if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        () => {

            document
                .querySelector(
                    ".sidebar"
                )
                .classList.toggle(
                    "open"
                );

        }
    );

}


/* =========================================================
   36. EMPTY STATE
   ========================================================= */

function showEmpty(
    message
) {

    songGrid.innerHTML =
        `

        <div style="
            grid-column:1/-1;
            text-align:center;
            padding:60px 20px;
            color:#777783;
        ">

            <i
                class="fa-solid fa-music"
                style="
                    font-size:35px;
                    margin-bottom:15px;
                "
            ></i>

            <p>
                ${escapeHTML(
                    message
                )}
            </p>

        </div>

        `;

}


/* =========================================================
   37. FORMAT TIME
   ========================================================= */

function formatTime(
    seconds
) {

    if (
        !seconds ||
        isNaN(seconds)
    ) {

        return "0:00";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const secs =
        Math.floor(
            seconds % 60
        )
        .toString()
        .padStart(
            2,
            "0"
        );


    return (
        minutes +
        ":" +
        secs
    );

}


/* =========================================================
   38. HTML ESCAPE
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   39. START VIBEFLOW
   ========================================================= */

displayRecent();


searchMusic(
    "top hits"
);