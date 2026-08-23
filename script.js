/* =========================================================
   VIBEFLOW SCRIPT
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const API_URL =
    "https://itunes.apple.com/search";


const API_COUNTRY =
    "us";


const SEARCH_LIMIT =
    30;


/* =========================================================
   DOM
========================================================= */

const audio =
    document.getElementById("audio");

const songGrid =
    document.getElementById("songGrid");

const recentList =
    document.getElementById("recentList");

const favoritesList =
    document.getElementById("favoritesList");

const playlistList =
    document.getElementById("playlistList");

const searchInput =
    document.getElementById("searchInput");

const clearSearch =
    document.getElementById("clearSearch");

const status =
    document.getElementById("status");

const sectionTitle =
    document.getElementById("sectionTitle");

const playerTitle =
    document.getElementById("playerTitle");

const playerArtist =
    document.getElementById("playerArtist");

const playerCover =
    document.getElementById("playerCover");

const playBtn =
    document.getElementById("playBtn");

const previousBtn =
    document.getElementById("previousBtn");

const nextBtn =
    document.getElementById("nextBtn");

const shuffleBtn =
    document.getElementById("shuffleBtn");

const repeatBtn =
    document.getElementById("repeatBtn");

const muteBtn =
    document.getElementById("muteBtn");

const volume =
    document.getElementById("volume");

const progress =
    document.getElementById("progress");

const currentTime =
    document.getElementById("currentTime");

const duration =
    document.getElementById("duration");

const playerFavorite =
    document.getElementById("playerFavorite");

const heroPlay =
    document.getElementById("heroPlay");

const heroShuffle =
    document.getElementById("heroShuffle");

const viewAll =
    document.getElementById("viewAll");

const mobileMenu =
    document.getElementById("mobileMenu");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


/* =========================================================
   STATE
========================================================= */

let songs = [];

let currentIndex = -1;

let currentSong = null;

let isShuffle =
    JSON.parse(
        localStorage.getItem(
            "vibeFlowShuffle"
        ) || "false"
    );

let isRepeat =
    JSON.parse(
        localStorage.getItem(
            "vibeFlowRepeat"
        ) || "false"
    );

let recentSongs =
    JSON.parse(
        localStorage.getItem(
            "vibeFlowRecentSongs"
        ) || "[]"
    );

let favoriteSongs =
    JSON.parse(
        localStorage.getItem(
            "vibeFlowFavorites"
        ) || "[]"
    );

let playlistSongs =
    JSON.parse(
        localStorage.getItem(
            "vibeFlowPlaylist"
        ) || "[]"
    );


/* =========================================================
   LOCAL STORAGE HELPERS
========================================================= */

function saveData() {

    localStorage.setItem(
        "vibeFlowRecentSongs",
        JSON.stringify(recentSongs)
    );

    localStorage.setItem(
        "vibeFlowFavorites",
        JSON.stringify(favoriteSongs)
    );

    localStorage.setItem(
        "vibeFlowPlaylist",
        JSON.stringify(playlistSongs)
    );

    localStorage.setItem(
        "vibeFlowShuffle",
        JSON.stringify(isShuffle)
    );

    localStorage.setItem(
        "vibeFlowRepeat",
        JSON.stringify(isRepeat)
    );
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


/* =========================================================
   IMAGE URL
========================================================= */

function artwork(song) {

    if (!song) {
        return "";
    }

    return (
        song.artworkUrl600 ||
        song.artworkUrl100 ||
        song.artworkUrl60 ||
        ""
    );
}


/* =========================================================
   STATUS
========================================================= */

function setStatus(
    message,
    type = ""
) {

    status.className =
        "status " + type;

    status.innerHTML =
        message;
}


/* =========================================================
   ITUNES JSONP SEARCH
========================================================= */

/*
   JSONP is used here so the website can work
   on GitHub Pages without requiring your own server.
*/

function searchMusic(query) {

    return new Promise(
        (resolve, reject) => {

            const callbackName =
                "vibeFlowCallback_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .substring(2);


            const script =
                document.createElement("script");


            const timeout =
                setTimeout(() => {

                    cleanup();

                    reject(
                        new Error(
                            "Music search timed out."
                        )
                    );

                }, 15000);


            function cleanup() {

                clearTimeout(timeout);

                delete window[callbackName];

                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }

            }


            window[callbackName] =
                data => {

                    cleanup();

                    resolve(
                        data &&
                        Array.isArray(data.results)
                            ? data.results
                            : []
                    );

                };


            script.onerror =
                () => {

                    cleanup();

                    reject(
                        new Error(
                            "Could not connect to music service."
                        )
                    );

                };


            const params =
                new URLSearchParams({

                    term: query,

                    country:
                        API_COUNTRY,

                    media:
                        "music",

                    entity:
                        "song",

                    limit:
                        SEARCH_LIMIT,

                    callback:
                        callbackName

                });


            script.src =
                API_URL +
                "?" +
                params.toString();


            document.body.appendChild(
                script
            );

        }
    );
}


/* =========================================================
   NORMALIZE SONG
========================================================= */

function normalizeSong(item) {

    return {

        id:
            String(
                item.trackId ||
                item.collectionId ||
                Math.random()
            ),

        title:
            item.trackName ||
            "Unknown Song",

        artist:
            item.artistName ||
            "Unknown Artist",

        album:
            item.collectionName ||
            "Unknown Album",

        cover:
            artwork(item),

        preview:
            item.previewUrl ||
            "",

        genre:
            item.primaryGenreName ||
            "Music",

        trackUrl:
            item.trackViewUrl ||
            "",

        artistUrl:
            item.artistViewUrl ||
            "",

        duration:
            item.trackTimeMillis ||
            0

    };
}


/* =========================================================
   FILTER VALID SONGS
========================================================= */

function prepareSongs(results) {

    return results

        .filter(
            item =>
                item.wrapperType === "track"
        )

        .map(normalizeSong)

        .filter(
            song =>
                song.title &&
                song.preview
        );
}


/* =========================================================
   LOAD HOME
========================================================= */

async function loadHome() {

    setStatus(
        '<i class="fa-solid fa-circle-notch fa-spin"></i> Loading music...'
    );


    try {

        const results =
            await searchMusic(
                "pop hits"
            );


        songs =
            prepareSongs(results);


        if (!songs.length) {

            throw new Error(
                "No music previews were found."
            );

        }


        renderSongs(
            songs,
            "Quick Picks"
        );


        setStatus(
            '<i class="fa-solid fa-check"></i> Music ready',
            "success"
        );


        setTimeout(() => {

            if (
                status.classList.contains(
                    "success"
                )
            ) {

                status.innerHTML = "";

            }

        }, 3000);


    } catch (error) {

        console.error(error);

        setStatus(
            '<i class="fa-solid fa-circle-exclamation"></i> Music service could not be reached. Try searching again.',
            "error"
        );


        songGrid.innerHTML = `

            <div class="loading">

                <div>

                    <i class="fa-solid fa-cloud"></i>

                    <p>
                        Music could not be loaded.
                    </p>

                </div>

            </div>

        `;

    }

}


/* =========================================================
   RENDER SONGS
========================================================= */

function renderSongs(
    list,
    title = "Quick Picks"
) {

    sectionTitle.textContent =
        title;


    if (!list.length) {

        songGrid.innerHTML = `

            <div class="loading">

                <div>
                    <i class="fa-solid fa-music"></i>
                    <p>No songs found.</p>
                </div>

            </div>

        `;

        return;
    }


    songGrid.innerHTML =
        list.map(
            (song, index) =>
                createSongCard(
                    song,
                    index
                )
        ).join("");


    attachSongCardEvents(
        songGrid
    );
}


/* =========================================================
   CREATE SONG CARD
========================================================= */

function createSongCard(
    song,
    index
) {

    const isFavorite =
        favoriteSongs.some(
            item =>
                item.id === song.id
        );


    const inPlaylist =
        playlistSongs.some(
            item =>
                item.id === song.id
        );


    return `

        <article
            class="song-card"
            data-index="${index}"
        >

            <div class="cover-wrap">

                <img
                    src="${escapeHTML(song.cover)}"
                    alt="${escapeHTML(song.title)} album cover"
                    loading="lazy"
                    onerror="this.style.display='none'"
                >


                <button
                    class="card-play"
                    data-action="play"
                    aria-label="Play ${escapeHTML(song.title)}"
                >
                    <i class="fa-solid fa-play"></i>
                </button>

            </div>


            <strong class="song-title">
                ${escapeHTML(song.title)}
            </strong>


            <span class="song-artist">
                ${escapeHTML(song.artist)}
            </span>


            <div class="card-actions">

                <button
                    class="card-favorite ${isFavorite ? "active" : ""}"
                    data-action="favorite"
                    aria-label="Favorite"
                >
                    <i class="fa-${isFavorite ? "solid" : "regular"} fa-heart"></i>
                </button>


                <button
                    class="card-add"
                    data-action="playlist"
                    aria-label="Add to playlist"
                    title="${inPlaylist ? "Remove from playlist" : "Add to playlist"}"
                >
                    <i class="fa-solid ${inPlaylist ? "fa-check" : "fa-plus"}"></i>
                </button>

            </div>

        </article>

    `;
}


/* =========================================================
   CARD EVENTS
========================================================= */

function attachSongCardEvents(
    container
) {

    container
        .querySelectorAll(".song-card")
        .forEach(card => {

            const index =
                Number(
                    card.dataset.index
                );


            card
                .querySelector(
                    '[data-action="play"]'
                )
                ?.addEventListener(
                    "click",
                    () => {

                        const song =
                            getRenderedSong(
                                container,
                                index
                            );

                        if (song) {
                            playSong(song);
                        }

                    }
                );


            card
                .querySelector(
                    '[data-action="favorite"]'
                )
                ?.addEventListener(
                    "click",
                    () => {

                        const song =
                            getRenderedSong(
                                container,
                                index
                            );

                        if (song) {

                            toggleFavorite(
                                song
                            );

                            renderCurrentPage();

                        }

                    }
                );


            card
                .querySelector(
                    '[data-action="playlist"]'
                )
                ?.addEventListener(
                    "click",
                    () => {

                        const song =
                            getRenderedSong(
                                container,
                                index
                            );

                        if (song) {

                            togglePlaylist(
                                song
                            );

                            renderCurrentPage();

                        }

                    }
                );

        });
}


/* =========================================================
   GET RENDERED SONG
========================================================= */

function getRenderedSong(
    container,
    index
) {

    if (
        container ===
        songGrid
    ) {

        return songs[index];

    }


    if (
        container ===
        favoritesList
    ) {

        return favoriteSongs[index];

    }


    if (
        container ===
        playlistList
    ) {

        return playlistSongs[index];

    }


    return null;
}


/* =========================================================
   PLAY SONG
========================================================= */

function playSong(song) {

    if (!song) {
        return;
    }


    if (!song.preview) {

        setStatus(
            '<i class="fa-solid fa-circle-exclamation"></i> Preview unavailable for this song.',
            "error"
        );

        return;
    }


    currentSong =
        song;


    const foundIndex =
        songs.findIndex(
            item =>
                item.id === song.id
        );


    if (foundIndex !== -1) {

        currentIndex =
            foundIndex;

    }


    audio.src =
        song.preview;


    audio.load();


    playerTitle.textContent =
        song.title;


    playerArtist.textContent =
        song.artist;


    playerCover.src =
        song.cover || "";


    updateFavoriteButton();


    updateVinyl();


    addToRecentlyPlayed(
        song
    );


    audio.play()
        .then(() => {

            updatePlayButton(
                true
            );

        })
        .catch(() => {

            updatePlayButton(
                false
            );

            setStatus(
                '<i class="fa-solid fa-hand-pointer"></i> Tap play to start the preview.',
                "success"
            );

        });

}


/* =========================================================
   PLAY INDEX
========================================================= */

function playIndex(index) {

    if (
        index < 0 ||
        index >= songs.length
    ) {
        return;
    }


    playSong(
        songs[index]
    );
}


/* =========================================================
   PLAY / PAUSE
========================================================= */

function togglePlay() {

    if (!currentSong) {

        if (songs.length) {
            playIndex(0);
        }

        return;
    }


    if (audio.paused) {

        audio.play()
            .then(() => {

                updatePlayButton(
                    true
                );

            })
            .catch(() => {});


    } else {

        audio.pause();

        updatePlayButton(
            false
        );

    }

}


/* =========================================================
   PLAY BUTTON UI
========================================================= */

function updatePlayButton(
    playing
) {

    playBtn.innerHTML =
        playing

            ? '<i class="fa-solid fa-pause"></i>'

            : '<i class="fa-solid fa-play"></i>';


    playBtn.setAttribute(
        "aria-label",
        playing
            ? "Pause"
            : "Play"
    );


    updateVinyl(
        playing
    );
}


/* =========================================================
   VINYL
========================================================= */

function updateVinyl(
    playing = !audio.paused
) {

    const vinyl =
        document.querySelector(
            ".vinyl"
        );


    if (!vinyl) {
        return;
    }


    vinyl.classList.toggle(
        "playing",
        playing
    );

}


/* =========================================================
   NEXT
========================================================= */

function nextSong() {

    if (!songs.length) {
        return;
    }


    let nextIndex;


    if (isShuffle) {

        nextIndex =
            Math.floor(
                Math.random() *
                songs.length
            );


        if (
            songs.length > 1 &&
            nextIndex === currentIndex
        ) {

            nextIndex =
                (
                    nextIndex + 1
                ) %
                songs.length;

        }

    } else {

        nextIndex =
            currentIndex + 1;


        if (
            nextIndex >= songs.length
        ) {

            nextIndex = 0;

        }

    }


    playIndex(
        nextIndex
    );

}


/* =========================================================
   PREVIOUS
========================================================= */

function previousSong() {

    if (!songs.length) {
        return;
    }


    if (
        audio.currentTime > 3
    ) {

        audio.currentTime = 0;

        return;
    }


    let previousIndex =
        currentIndex - 1;


    if (
        previousIndex < 0
    ) {

        previousIndex =
            songs.length - 1;

    }


    playIndex(
        previousIndex
    );

}


/* =========================================================
   SHUFFLE
========================================================= */

function toggleShuffle() {

    isShuffle =
        !isShuffle;


    shuffleBtn.classList.toggle(
        "active",
        isShuffle
    );


    saveData();

}


/* =========================================================
   REPEAT
========================================================= */

function toggleRepeat() {

    isRepeat =
        !isRepeat;


    repeatBtn.classList.toggle(
        "active",
        isRepeat
    );


    saveData();

}


/* =========================================================
   AUDIO ENDED
========================================================= */

audio.addEventListener(
    "ended",
    () => {

        if (isRepeat) {

            audio.currentTime = 0;

            audio.play();

            return;
        }


        nextSong();

    }
);


/* =========================================================
   AUDIO PLAY
========================================================= */

audio.addEventListener(
    "play",
    () => {

        updatePlayButton(
            true
        );

    }
);


/* =========================================================
   AUDIO PAUSE
========================================================= */

audio.addEventListener(
    "pause",
    () => {

        updatePlayButton(
            false
        );

    }
);


/* =========================================================
   TIME UPDATE
========================================================= */

audio.addEventListener(
    "timeupdate",
    () => {

        if (
            !audio.duration ||
            !Number.isFinite(
                audio.duration
            )
        ) {
            return;
        }


        const percent =
            (
                audio.currentTime /
                audio.duration
            ) * 100;


        progress.value =
            percent;


        currentTime.textContent =
            formatTime(
                audio.currentTime
            );

    }
);


/* =========================================================
   METADATA
========================================================= */

audio.addEventListener(
    "loadedmetadata",
    () => {

        duration.textContent =
            formatTime(
                audio.duration
            );

    }
);


/* =========================================================
   AUDIO ERROR
========================================================= */

audio.addEventListener(
    "error",
    () => {

        setStatus(
            '<i class="fa-solid fa-circle-exclamation"></i> This preview could not be played. Try another song.',
            "error"
        );

        updatePlayButton(
            false
        );

    }
);


/* =========================================================
   PROGRESS
========================================================= */

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
   VOLUME
========================================================= */

audio.volume =
    Number(
        volume.value
    );


volume.addEventListener(
    "input",
    () => {

        audio.volume =
            Number(
                volume.value
            );


        updateVolumeIcon();

    }
);


/* =========================================================
   MUTE
========================================================= */

let previousVolume =
    Number(
        volume.value
    );


muteBtn.addEventListener(
    "click",
    () => {

        if (
            audio.volume > 0
        ) {

            previousVolume =
                audio.volume;

            audio.volume = 0;

            volume.value = 0;

        } else {

            audio.volume =
                previousVolume || 0.8;

            volume.value =
                audio.volume;

        }


        updateVolumeIcon();

    }
);


/* =========================================================
   VOLUME ICON
========================================================= */

function updateVolumeIcon() {

    if (
        audio.volume === 0
    ) {

        muteBtn.innerHTML =
            '<i class="fa-solid fa-volume-xmark"></i>';

    } else if (
        audio.volume < 0.5
    ) {

        muteBtn.innerHTML =
            '<i class="fa-solid fa-volume-low"></i>';

    } else {

        muteBtn.innerHTML =
            '<i class="fa-solid fa-volume-high"></i>';

    }

}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(
    seconds
) {

    if (
        !Number.isFinite(
            seconds
        )
    ) {
        return "0:00";
    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remaining =
        Math.floor(
            seconds % 60
        );


    return (
        minutes +
        ":" +
        String(
            remaining
        ).padStart(
            2,
            "0"
        )
    );

}


/* =========================================================
   RECENTLY PLAYED
========================================================= */

function addToRecentlyPlayed(
    song
) {

    if (!song) {
        return;
    }


    recentSongs =
        recentSongs.filter(
            item =>
                item.id !== song.id
        );


    recentSongs.unshift(
        song
    );


    recentSongs =
        recentSongs.slice(
            0,
            20
        );


    saveData();

    renderRecentlyPlayed();

}


/* =========================================================
   RENDER RECENT
========================================================= */

function renderRecentlyPlayed() {

    if (
        !recentList
    ) {
        return;
    }


    if (
        !recentSongs.length
    ) {

        recentList.innerHTML = `

            <div class="empty-recent">

                <i class="fa-solid fa-clock"></i>

                <p>
                    No recently played songs yet.
                </p>

                <small>
                    Songs you play will appear here.
                </small>

            </div>

        `;

        return;
    }


    recentList.innerHTML =
        recentSongs.map(
            (song, index) => `

                <div
                    class="recent-song"
                    data-recent-index="${index}"
                >

                    <img
                        src="${escapeHTML(song.cover)}"
                        alt="${escapeHTML(song.title)}"
                        loading="lazy"
                    >


                    <div class="recent-info">

                        <strong>
                            ${escapeHTML(song.title)}
                        </strong>

                        <span>
                            ${escapeHTML(song.artist)}
                        </span>

                    </div>


                    <button
                        class="recent-play"
                        data-recent-index="${index}"
                        aria-label="Play song"
                    >
                        <i class="fa-solid fa-play"></i>
                    </button>

                </div>

            `
        ).join("");


    recentList
        .querySelectorAll(
            ".recent-play"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset
                                .recentIndex
                        );


                    playSong(
                        recentSongs[index]
                    );

                }
            );

        });

}


/* =========================================================
   FAVORITES
========================================================= */

function toggleFavorite(
    song
) {

    const exists =
        favoriteSongs.some(
            item =>
                item.id === song.id
        );


    if (exists) {

        favoriteSongs =
            favoriteSongs.filter(
                item =>
                    item.id !== song.id
            );

    } else {

        favoriteSongs.unshift(
            song
        );

    }


    saveData();

    updateFavoriteButton();

}


/* =========================================================
   PLAYER FAVORITE
========================================================= */

function updateFavoriteButton() {

    if (!currentSong) {

        playerFavorite.innerHTML =
            '<i class="fa-regular fa-heart"></i>';

        return;
    }


    const favorite =
        favoriteSongs.some(
            song =>
                song.id ===
                currentSong.id
        );


    playerFavorite.innerHTML =

        favorite

            ? '<i class="fa-solid fa-heart"></i>'

            : '<i class="fa-regular fa-heart"></i>';


    playerFavorite.style.color =
        favorite
            ? "#ff6793"
            : "";

}


/* =========================================================
   PLAYER FAVORITE CLICK
========================================================= */

playerFavorite.addEventListener(
    "click",
    () => {

        if (!currentSong) {
            return;
        }


        toggleFavorite(
            currentSong
        );


        renderFavorites();

    }
);


/* =========================================================
   PLAYLIST
========================================================= */

function togglePlaylist(
    song
) {

    const exists =
        playlistSongs.some(
            item =>
                item.id === song.id
        );


    if (exists) {

        playlistSongs =
            playlistSongs.filter(
                item =>
                    item.id !== song.id
            );

    } else {

        playlistSongs.unshift(
            song
        );

    }


    saveData();

}


/* =========================================================
   RENDER FAVORITES
========================================================= */

function renderFavorites() {

    if (
        !favoriteSongs.length
    ) {

        favoritesList.innerHTML = `

            <div class="empty-recent">

                <i class="fa-regular fa-heart"></i>

                <p>
                    No favorites yet.
                </p>

                <small>
                    Tap the heart on a song to save it.
                </small>

            </div>

        `;

        return;
    }


    favoritesList.innerHTML =
        favoriteSongs.map(
            (song, index) =>
                createSongCard(
                    song,
                    index
                )
        ).join("");


    attachSongCardEvents(
        favoritesList
    );

}


/* =========================================================
   RENDER PLAYLIST
========================================================= */

function renderPlaylist() {

    if (
        !playlistSongs.length
    ) {

        playlistList.innerHTML = `

            <div class="empty-recent">

                <i class="fa-solid fa-list"></i>

                <p>
                    Your playlist is empty.
                </p>

                <small>
                    Press + on a song to add it.
                </small>

            </div>

        `;

        return;
    }


    playlistList.innerHTML =
        playlistSongs.map(
            (song, index) =>
                createSongCard(
                    song,
                    index
                )
        ).join("");


    attachSongCardEvents(
        playlistList
    );

}


/* =========================================================
   SEARCH
========================================================= */

let searchTimer = null;


searchInput.addEventListener(
    "input",
    () => {

        const query =
            searchInput.value.trim();


        clearSearch.classList.toggle(
            "visible",
            query.length > 0
        );


        clearTimeout(
            searchTimer
        );


        if (
            query.length < 2
        ) {

            if (
                query.length === 0
            ) {

                sectionTitle.textContent =
                    "Quick Picks";

                renderSongs(
                    songs,
                    "Quick Picks"
                );

            }

            return;
        }


        searchTimer =
            setTimeout(
                () => {

                    performSearch(
                        query
                    );

                },
                500
            );

    }
);


/* =========================================================
   PERFORM SEARCH
========================================================= */

async function performSearch(
    query
) {

    setStatus(
        '<i class="fa-solid fa-circle-notch fa-spin"></i> Searching...'
    );


    try {

        const results =
            await searchMusic(
                query
            );


        const found =
            prepareSongs(
                results
            );


        songs =
            found;


        renderSongs(
            songs,
            `Results for "${query}"`
        );


        setStatus(
            `<i class="fa-solid fa-music"></i> ${songs.length} previews found`,
            "success"
        );


    } catch (error) {

        console.error(error);

        setStatus(
            '<i class="fa-solid fa-circle-exclamation"></i> Search failed. Please try again.',
            "error"
        );

    }

}


/* =========================================================
   CLEAR SEARCH
========================================================= */

clearSearch.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        clearSearch.classList.remove(
            "visible"
        );

        renderSongs(
            songs,
            "Quick Picks"
        );

        searchInput.focus();

    }
);


/* =========================================================
   GENRES
========================================================= */

document
    .querySelectorAll(
        ".genres button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const query =
                    button.dataset.search;


                searchInput.value =
                    query;


                clearSearch.classList.add(
                    "visible"
                );


                performSearch(
                    query
                );


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    });


/* =========================================================
   HERO PLAY
========================================================= */

heroPlay.addEventListener(
    "click",
    () => {

        if (!songs.length) {
            return;
        }


        playIndex(
            currentIndex >= 0
                ? currentIndex
                : 0
        );

    }
);


/* =========================================================
   HERO SHUFFLE
========================================================= */

heroShuffle.addEventListener(
    "click",
    () => {

        if (!songs.length) {
            return;
        }


        isShuffle = true;

        shuffleBtn.classList.add(
            "active"
        );


        const random =
            Math.floor(
                Math.random() *
                songs.length
            );


        playIndex(
            random
        );


        saveData();

    }
);


/* =========================================================
   PLAYER BUTTONS
========================================================= */

playBtn.addEventListener(
    "click",
    togglePlay
);


nextBtn.addEventListener(
    "click",
    nextSong
);


previousBtn.addEventListener(
    "click",
    previousSong
);


shuffleBtn.addEventListener(
    "click",
    toggleShuffle
);


repeatBtn.addEventListener(
    "click",
    toggleRepeat
);


/* =========================================================
   VIEW ALL
========================================================= */

viewAll.addEventListener(
    "click",
    () => {

        if (!songs.length) {
            return;
        }


        renderSongs(
            songs,
            "All Music"
        );


        document
            .querySelector(
                ".section"
            )
            ?.scrollIntoView({
                behavior: "smooth"
            });

    }
);


/* =========================================================
   NAVIGATION
========================================================= */

document
    .querySelectorAll(
        ".nav-item"
    )
    .forEach(item => {

        item.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".nav-item"
                    )
                    .forEach(
                        nav =>
                            nav.classList.remove(
                                "active"
                            )
                    );


                item.classList.add(
                    "active"
                );


                const page =
                    item.dataset.page;


                showPage(
                    page
                );


                closeSidebar();

            }
        );

    });


/* =========================================================
   SHOW PAGE
========================================================= */

function showPage(
    page
) {

    const sections =
        document.querySelectorAll(
            ".section"
        );


    sections.forEach(
        section =>
            section.classList.remove(
                "hidden-section"
            )
    );


    document
        .getElementById(
            "favoritesSection"
        )
        .classList.add(
            "hidden-section"
        );


    document
        .getElementById(
            "playlistSection"
        )
        .classList.add(
            "hidden-section"
        );


    if (
        page === "favorites"
    ) {

        document
            .getElementById(
                "favoritesSection"
            )
            .classList.remove(
                "hidden-section"
            );


        renderFavorites();


        document
            .getElementById(
                "favoritesSection"
            )
            .scrollIntoView({
                behavior: "smooth"
            });


        return;
    }


    if (
        page === "playlist"
    ) {

        document
            .getElementById(
                "playlistSection"
            )
            .classList.remove(
                "hidden-section"
            );


        renderPlaylist();


        document
            .getElementById(
                "playlistSection"
            )
            .scrollIntoView({
                behavior: "smooth"
            });


        return;
    }


    if (
        page === "recent"
    ) {

        document
            .querySelector(
                ".recent-list"
            )
            .scrollIntoView({
                behavior: "smooth"
            });


        return;
    }


    if (
        page === "discover"
    ) {

        document
            .querySelector(
                ".genres"
            )
            .scrollIntoView({
                behavior: "smooth"
            });


        return;
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function openSidebar() {

    sidebar.classList.add(
        "open"
    );

    sidebarOverlay.classList.add(
        "visible"
    );

    document.body.style.overflow =
        "hidden";

}


function closeSidebar() {

    sidebar.classList.remove(
        "open"
    );

    sidebarOverlay.classList.remove(
        "visible"
    );

    document.body.style.overflow =
        "";

}


mobileMenu.addEventListener(
    "click",
    openSidebar
);


sidebarOverlay.addEventListener(
    "click",
    closeSidebar
);


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeSidebar();

        }

    }
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth > 900
        ) {

            closeSidebar();

        }

    }
);


/* =========================================================
   INITIAL UI
========================================================= */

function initializeUI() {

    shuffleBtn.classList.toggle(
        "active",
        isShuffle
    );


    repeatBtn.classList.toggle(
        "active",
        isRepeat
    );


    updateVolumeIcon();


    renderRecentlyPlayed();


    renderFavorites();


    renderPlaylist();

}


/* =========================================================
   START
========================================================= */

initializeUI();

loadHome();
