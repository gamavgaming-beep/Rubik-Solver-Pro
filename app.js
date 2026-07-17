"use strict";

/* ==========================================
   Rubik Solver Pro
   App Initialization
========================================== */

// ---------- DOM Elements ----------

const splashScreen = document.getElementById("splash-screen");
const mainApp = document.getElementById("main-app");
const loadingProgress = document.getElementById("loading-progress");

const editorPage = document.getElementById("editor-page");
const loadingPage = document.getElementById("loading-page");
const solverPage = document.getElementById("solver-page");
const finishPage = document.getElementById("finish-page");

const toast = document.getElementById("toast");

// ---------- App State ----------

const appState = {

    currentFace: 0,

    totalFaces: 6,

    selectedColor: "white",

    filledStickers: 0,

    cubeValidated: false,

    cubeSolved: false,

    solving: false

};

// ---------- Utility ----------

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------- Toast ----------

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}

// ---------- Splash Loading ----------

async function startSplash() {

    let progress = 0;

    while (progress <= 100) {

        loadingProgress.style.width = progress + "%";

        await sleep(25);

        progress++;

    }

    splashScreen.classList.add("hidden");

    mainApp.classList.remove("hidden");

    showToast("Welcome to Rubik Solver Pro");

}

// ---------- Start App ----------

window.addEventListener("load", () => {

    startSplash();

});
/* ==========================================
   Theme System
========================================== */

const themeBtn = document.getElementById("theme-btn");

let currentTheme = localStorage.getItem("theme") || "dark";

applyTheme(currentTheme);

themeBtn.addEventListener("click", () => {

    currentTheme =
        currentTheme === "dark"
            ? "light"
            : "dark";

    applyTheme(currentTheme);

});

function applyTheme(theme) {

    document.body.setAttribute(
        "data-theme",
        theme
    );

    localStorage.setItem(
        "theme",
        theme
    );

    themeBtn.textContent =
        theme === "dark"
            ? "🌙"
            : "☀️";

}

/* ==========================================
   Settings Button
========================================== */

const settingsBtn =
document.getElementById("settings-btn");

settingsBtn.addEventListener("click", () => {

    showToast(
        "Settings coming soon..."
    );

});

/* ==========================================
   Install PWA
========================================== */

const installBtn =
document.getElementById("install-btn");

let deferredPrompt = null;

window.addEventListener(
    "beforeinstallprompt",
    (event) => {

        event.preventDefault();

        deferredPrompt = event;

        installBtn.style.display = "inline-flex";

    }
);

installBtn.addEventListener(
    "click",
    async () => {

        if (!deferredPrompt) {

            showToast(
                "Install not available."
            );

            return;

        }

        deferredPrompt.prompt();

        await deferredPrompt.userChoice;

        deferredPrompt = null;

        installBtn.style.display = "none";

    }
);

window.addEventListener(
    "appinstalled",
    () => {

        showToast(
            "Rubik Solver installed!"
        );

        installBtn.style.display = "none";

    }
);
/* ==========================================
   Color Picker
========================================== */

const colorButtons = document.querySelectorAll(".color-btn");

const colorCounters = {
    white: document.getElementById("count-white"),
    yellow: document.getElementById("count-yellow"),
    red: document.getElementById("count-red"),
    orange: document.getElementById("count-orange"),
    blue: document.getElementById("count-blue"),
    green: document.getElementById("count-green")
};

const colorUsage = {
    white: 0,
    yellow: 0,
    red: 0,
    orange: 0,
    blue: 0,
    green: 0
};

// Default selected color
setActiveColor("white");

colorButtons.forEach(button => {

    button.addEventListener("click", () => {

        const color = button.dataset.color;

        setActiveColor(color);

    });

});

function setActiveColor(color) {

    appState.selectedColor = color;

    colorButtons.forEach(btn => {

        btn.classList.remove("active");

    });

    document
        .querySelector(`[data-color="${color}"]`)
        .classList.add("active");

}

function updateColorCounters() {

    Object.keys(colorUsage).forEach(color => {

        colorCounters[color].textContent =
            `${colorUsage[color]} / 9`;

    });

}
/* ==========================================
   Cube Data
========================================== */

const FACE_NAMES = [
    "U",
    "R",
    "F",
    "D",
    "L",
    "B"
];

const cubeState = {

    U: Array(9).fill(null),
    R: Array(9).fill(null),
    F: Array(9).fill(null),
    D: Array(9).fill(null),
    L: Array(9).fill(null),
    B: Array(9).fill(null)

};

const filledCount =
document.getElementById("filled-count");

const validateBtn =
document.getElementById("validate-btn");

const solveBtn =
document.getElementById("solve-btn");

/* ==========================================
   Face Counter
========================================== */

function updateFaceCounter() {

    document.getElementById("face-counter").textContent =
        `${appState.currentFace + 1} / ${appState.totalFaces}`;

    document.getElementById("face-progress").value =
        appState.currentFace + 1;

}

/* ==========================================
   Filled Counter
========================================== */

function updateFilledCounter() {

    let total = 0;

    Object.values(cubeState).forEach(face => {

        face.forEach(sticker => {

            if (sticker !== null) {

                total++;

            }

        });

    });

    appState.filledStickers = total;

    filledCount.textContent =
        `${total} / 54`;

}

/* ==========================================
   Validate Button
========================================== */

function updateValidateButton() {

    if (appState.filledStickers === 54) {

        validateBtn.disabled = false;

    } else {

        validateBtn.disabled = true;

    }

}

/* ==========================================
   Refresh UI
========================================== */

function refreshEditor() {

    updateFaceCounter();

    updateFilledCounter();

    updateValidateButton();

    updateColorCounters();

}

refreshEditor();
