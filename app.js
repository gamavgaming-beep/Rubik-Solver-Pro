/**

==========================================================

Rubik Solver Pro

app.js - Part 1 (Core State & Engine Initialization)

ES Modules & CubeEngine Integration

==========================================================
*/


import CubeEngine from "./cube-engine.js";

// ---------- DOM Elements ----------
const splashScreen = document.getElementById("splash-screen");
const mainApp = document.getElementById("main-app");
const loadingProgress = document.getElementById("loading-progress");

const editorPage = document.getElementById("editor-page");
const loadingPage = document.getElementById("loading-page");
const solverPage = document.getElementById("solver-page");
const finishPage = document.getElementById("finish-page");

const toast = document.getElementById("toast");
const viewer = document.getElementById("viewer");

// ---------- App UI State ----------
const appState = {
currentFace: 0,
totalFaces: 6,
selectedColor: "white",
filledStickers: 0,
cubeValidated: false,
cubeSolved: false,
solving: false
};

// ---------- Cube Engine Global Instance ----------
let engine = null;

// ---------- Utility Helpers ----------
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}

function showToast(message) {
if (!toast) return;
toast.textContent = message;
toast.classList.add("show");

setTimeout(() => {  
    toast.classList.remove("show");  
}, 2500);

}

// ---------- Correct CubeEngine Initialization ----------
function initEngine() {
if (!viewer) {
console.error("Initialization Error: #viewer container element not found.");
return;
}

// Instantiating the engine instance according to its public contract API  
engine = new CubeEngine();  

// Calling the explicit lifecycle initialization method with the DOM element container  
engine.initialize(viewer);  

// Synchronize initial configuration parameters to the active engine state  
if (typeof COLOR_TO_FACE !== "undefined" && COLOR_TO_FACE[appState.selectedColor]) {  
    engine.activeColor = COLOR_TO_FACE[appState.selectedColor];  
} else {  
    engine.activeColor = "U"; // Fallback safe default matching top face  
}  

// Link structural change updates back to interactive state management flows  
engine.onStateChanged = () => {  
    if (typeof syncEngineToCubeState === "function") {  
        syncEngineToCubeState();  
    }  
    if (typeof refreshEditor === "function") {  
        refreshEditor();  
    }  
};  

engine.onStickerTapped = (clickedSticker) => {  
    if (engine && appState.selectedColor && typeof COLOR_TO_FACE !== "undefined") {  
        const targetFaceCode = COLOR_TO_FACE[appState.selectedColor];  
        engine.setStickerColor(clickedSticker, targetFaceCode);  
    }  
};  

// Orient view orientation cleanly to match default state matrix context safely  
if (typeof FACE_NAMES !== "undefined" && typeof engine.navigateToFace === "function") {  
    engine.navigateToFace(FACE_NAMES[appState.currentFace]);  
}

}
/**

==========================================================

Rubik Solver Pro

app.js - Part 2 (Data Synchronization & Mapping Engine)

ES Modules & CubeEngine Interface Alignment

==========================================================
*/


// ---------- Color & Face Structural Mappers ----------
const COLOR_TO_FACE = {
white: "U",
red: "R",
green: "F",
yellow: "D",
orange: "L",
blue: "B"
};

const FACE_TO_COLOR = {
U: "white",
R: "red",
F: "green",
D: "yellow",
L: "orange",
B: "blue"
};

/**

Reads the 3D engine's internal sticker states directly using its native

structural properties and maps them back into the application's verification arrays.
*/
function syncEngineToCubeState() {
// Clear state management registers clean before repopulating
Object.keys(cubeState).forEach(face => {
cubeState[face].fill(null);
});

Object.keys(colorUsage).forEach(color => {
colorUsage[color] = 0;
});

if (!engine || !engine.stickers) return;

engine.stickers.forEach(sticker => {
if (!sticker || !sticker.userData) return;

// Retrieve properties exactly as managed inside cube-engine.js  
 const nativeFaceLetter = sticker.userData.currentFace;   
 const activeColorCode = sticker.userData.color;          

 if (nativeFaceLetter && activeColorCode) {  
     const stickerIndex = getStickerIndex(sticker, nativeFaceLetter);  

     if (stickerIndex >= 0 && stickerIndex < 9) {  
         // Store face code notation into the validation state matrix  
         if (activeColorCode in FACE_TO_COLOR) {  
             cubeState[nativeFaceLetter][stickerIndex] = activeColorCode;  
         } else if (activeColorCode in COLOR_TO_FACE) {  
             cubeState[nativeFaceLetter][stickerIndex] = COLOR_TO_FACE[activeColorCode];  
         }  
     }  

     // Standardize key format to update the active palette limit counters  
     const colorName = FACE_TO_COLOR[activeColorCode] || activeColorCode;  
     if (colorName in colorUsage) {  
         colorUsage[colorName]++;  
     }  
 }

});
}


/**

Extracts the 0-8 facelet positioning index from the engine's

internal data structures without calculating spatial coordinates.

@param {THREE.Mesh} sticker - The target sticker mesh entity from the engine.

@param {string} faceLetter - The shorthand letter notation of the cube face.

@returns {number} The absolute 0 to 8 localized layout index.
*/
function getStickerIndex(sticker, faceLetter) {
if (!sticker || !sticker.userData || sticker.userData.grid === undefined) {
return -1;
}

// Directly access the grid index mapped by the engine's underlying layout
return Number(sticker.userData.grid);
}
/**

==========================================================

Rubik Solver Pro

app.js - Part 3 (Professional Face Navigation Workflow)

ES Modules & Guided Step Architecture

==========================================================
*/


// ---------- Strict Workflow Navigation Sequence ----------
const NAVIGATION_SEQUENCE = ["F", "R", "B", "L", "U", "D"];

const nextFaceBtn = document.getElementById("btn-next-face");
const faceCounterEl = document.getElementById("face-counter");
const faceProgressEl = document.getElementById("face-progress");

/**

Updates the UI elements tracking face progression and manages

the operational lifecycle states of workflow control buttons.
*/
function updateFaceCounter() {
if (faceCounterEl) {
faceCounterEl.textContent = ${appState.currentFace + 1} / ${appState.totalFaces};
}
if (faceProgressEl) {
faceProgressEl.value = appState.currentFace + 1;
}

// Checking if the wizard has arrived at the final face (Down Face)
if (NAVIGATION_SEQUENCE[appState.currentFace] === "D") {
if (nextFaceBtn) {
nextFaceBtn.disabled = true;
}
if (validateBtn) {
validateBtn.disabled = false;
}
} else {
if (nextFaceBtn) {
nextFaceBtn.disabled = false;
}
}
}


// ---------- Next Face Step Event Registration ----------
if (nextFaceBtn) {
nextFaceBtn.addEventListener("click", () => {
// Prevent indexing overflow or rolling back to the starting face
if (appState.currentFace >= NAVIGATION_SEQUENCE.length - 1) {
return;
}

// Forward progress increment along the strict linear sequence  
    appState.currentFace++;  
      
    const targetFaceCode = NAVIGATION_SEQUENCE[appState.currentFace];  
      
    // Command the underlying 3D camera matrices via the engine's navigation interface  
    if (engine && typeof engine.navigateToFace === "function") {  
        engine.navigateToFace(targetFaceCode);  
    }  

    // Repaint component structures and progress bars  
    if (typeof refreshEditor === "function") {  
        refreshEditor();  
    } else {  
        updateFaceCounter();  
    }  

    showToast(`Switched view to ${targetFaceCode} Face`);  
});

}

/**

Global interface manager routing batch state redraw signals across control blocks
*/
function refreshEditor() {
updateFaceCounter();

if (typeof updateFilledCounter === "function") {
updateFilledCounter();
}
if (typeof updateColorCounters === "function") {
updateColorCounters();
}
}
/**

==========================================================

Rubik Solver Pro

app.js - Part 4 (UI Integration & Action Handlers)

ES Modules & Event Binding Completion

==========================================================
*/


// ---------- State Registration for Synchronization ----------
const colorUsage = {
white: 0,
red: 0,
green: 0,
yellow: 0,
orange: 0,
blue: 0
};

const cubeState = {
U: Array(9).fill(null),
R: Array(9).fill(null),
F: Array(9).fill(null),
D: Array(9).fill(null),
L: Array(9).fill(null),
B: Array(9).fill(null)
};

// ---------- UI Element Bindings ----------
const colorButtons = document.querySelectorAll(".color-btn");
const filledCountEl = document.getElementById("filled-count");
const validateBtn = document.getElementById("validate-btn");
const solveBtn = document.getElementById("solve-btn");

const colorCounters = {
white: document.getElementById("count-white"),
yellow: document.getElementById("count-yellow"),
red: document.getElementById("count-red"),
orange: document.getElementById("count-orange"),
blue: document.getElementById("count-blue"),
green: document.getElementById("count-green")
};

// ---------- Color Picker Handling ----------
colorButtons.forEach(button => {
button.addEventListener("click", () => {
const color = button.dataset.color;
if (!color) return;

appState.selectedColor = color;  

    // Repaint active color indicator styling across selection track  
    colorButtons.forEach(btn => btn.classList.remove("active"));  
    button.classList.add("active");  

    // Transmit chosen surface color down into active engine interface  
    if (engine && typeof COLOR_TO_FACE !== "undefined") {  
        engine.activeColor = COLOR_TO_FACE[color];  
    }  
});

});

// ---------- Counter Redraw Functions ----------
function updateColorCounters() {
Object.keys(colorUsage).forEach(color => {
if (colorCounters[color]) {
colorCounters[color].textContent = ${colorUsage[color]}/9;
}
});
}

function updateFilledCounter() {
let total = 0;
Object.keys(cubeState).forEach(face => {
cubeState[face].forEach(sticker => {
if (sticker !== null) {
total++;
}
});
});

appState.filledStickers = total;  
if (filledCountEl) {  
    filledCountEl.textContent = `${total} / 54`;  
}

}

// ---------- Validation Architecture ----------
function validateCube() {
const validationCounts = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 };

for (const face of Object.keys(cubeState)) {  
    for (const sticker of cubeState[face]) {  
        if (!sticker) {  
            showToast("Error: Complete all 54 stickers before validation.");  
            return false;  
        }  
        if (!(sticker in validationCounts)) {  
            showToast("Error: Target face configuration contains structural corruption.");  
            return false;  
        }  
        validationCounts[sticker]++;  
    }  
}  

for (const faceCode of Object.keys(validationCounts)) {  
    if (validationCounts[faceCode] !== 9) {  
        showToast(`Error: ${faceCode} color facelets must appear exactly 9 times.`);  
        return false;  
    }  
}  

appState.cubeValidated = true;  
showToast("Cube verification successful! Ready to solve.");  
return true;

}

if (validateBtn) {
validateBtn.addEventListener("click", () => {
if (validateCube()) {
if (solveBtn) {
solveBtn.disabled = false;
}
}
});
}

// ---------- Solver Algorithm Execution Trigger ----------
if (solveBtn) {
solveBtn.disabled = true; // Lock execution access down tight until verified safe
solveBtn.addEventListener("click", () => {
if (!appState.cubeValidated) {
showToast("Please validate the layout configuration first.");
return;
}

if (typeof window.solveCube === "function") {  
        window.solveCube(cubeState);  
    } else {  
        showToast("Executing solver pipeline... Processing matrix matrix.");  
        document.dispatchEvent(new CustomEvent("cubeReadyForSolver", {  
            detail: { cubeState }  
        }));  
    }  
});

}

// ---------- Direct Application Bootstrap Lifecycle ----------
window.addEventListener("load", () => {
const initialActiveBtn = document.querySelector([data-color="${appState.selectedColor}"]);
if (initialActiveBtn) {
initialActiveBtn.classList.add("active");
}
});
/**

==========================================================

Rubik Solver Pro

app.js - Unified Production Engine (Final Integrated Version)

ES Modules & Seamless Multi-Module Lifecycle Integration

==========================================================
*/


import CubeEngine from "./cube-engine.js";

// =========================================================
// 1. Core Data Structures, Mappers & Configuration Constants
// =========================================================

const NAVIGATION_SEQUENCE = ["F", "R", "B", "L", "U", "D"];

const COLOR_TO_FACE = {
white: "U",
red: "R",
green: "F",
yellow: "D",
orange: "L",
blue: "B"
};

const FACE_TO_COLOR = {
U: "white",
R: "red",
F: "green",
D: "yellow",
L: "orange",
B: "blue"
};

// =========================================================
// 2. Global Application State Trackers
// =========================================================

const appState = {
currentFace: 0,
totalFaces: 6,
selectedColor: "white",
filledStickers: 0,
cubeValidated: false,
cubeSolved: false,
solving: false
};

const colorUsage = {
white: 0,
red: 0,
green: 0,
yellow: 0,
orange: 0,
blue: 0
};

const cubeState = {
U: Array(9).fill(null),
R: Array(9).fill(null),
F: Array(9).fill(null),
D: Array(9).fill(null),
L: Array(9).fill(null),
B: Array(9).fill(null)
};

// Centralized reference to the 3D CubeEngine core instance
let engine = null;

// =========================================================
// 3. DOM Element Bindings
// =========================================================

const splashScreen = document.getElementById("splash-screen");
const mainApp = document.getElementById("main-app");
const loadingProgress = document.getElementById("loading-progress");

const toast = document.getElementById("toast");
const viewer = document.getElementById("viewer");

const nextFaceBtn = document.getElementById("btn-next-face");
const faceCounterEl = document.getElementById("face-counter");
const faceProgressEl = document.getElementById("face-progress");

const colorButtons = document.querySelectorAll(".color-btn");
const filledCountEl = document.getElementById("filled-count");
const validateBtn = document.getElementById("validate-btn");
const solveBtn = document.getElementById("solve-btn");

const themeBtn = document.getElementById("theme-btn");
const settingsBtn = document.getElementById("settings-btn");

const colorCounters = {
white: document.getElementById("count-white"),
yellow: document.getElementById("count-yellow"),
red: document.getElementById("count-red"),
orange: document.getElementById("count-orange"),
blue: document.getElementById("count-blue"),
green: document.getElementById("count-green")
};

// =========================================================
// 4. Utility Handlers & Notifications
// =========================================================

function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}

function showToast(message) {
if (!toast) return;
toast.textContent = message;
toast.classList.add("show");

setTimeout(() => {  
    toast.classList.remove("show");  
}, 2500);

}

// =========================================================
// 5. Data Synchronization & Structural Matrix Mappers
// =========================================================

/**

Reads internal properties directly from the 3D Engine objects

and maps them symmetrically back into state arrays.
*/
function syncEngineToCubeState() {
Object.keys(cubeState).forEach(face => {
cubeState[face].fill(null);
});

Object.keys(colorUsage).forEach(color => {
colorUsage[color] = 0;
});

if (!engine || !engine.stickers) return;

engine.stickers.forEach(sticker => {
if (!sticker || !sticker.userData) return;

const nativeFaceLetter = sticker.userData.currentFace;   
 const activeColorCode = sticker.userData.color;          

 if (nativeFaceLetter && activeColorCode) {  
     const stickerIndex = getStickerIndex(sticker, nativeFaceLetter);  

     if (stickerIndex >= 0 && stickerIndex < 9) {  
         if (activeColorCode in FACE_TO_COLOR) {  
             cubeState[nativeFaceLetter][stickerIndex] = activeColorCode;  
         } else if (activeColorCode in COLOR_TO_FACE) {  
             cubeState[nativeFaceLetter][stickerIndex] = COLOR_TO_FACE[activeColorCode];  
         }  
     }  

     const colorName = FACE_TO_COLOR[activeColorCode] || activeColorCode;  
     if (colorName in colorUsage) {  
         colorUsage[colorName]++;  
     }  
 }

});
}


/**

Pulls zero-indexed positions directly from the engine's data array mapping.
*/
function getStickerIndex(sticker, faceLetter) {
if (!sticker || !sticker.userData || sticker.userData.grid === undefined) {
return -1;
}
return Number(sticker.userData.grid);
}


// =========================================================
// 6. UI Rendering & Component Repaint Controllers
// =========================================================

function updateColorCounters() {
Object.keys(colorUsage).forEach(color => {
if (colorCounters[color]) {
colorCounters[color].textContent = ${colorUsage[color]}/9;
}
});
}

function updateFilledCounter() {
let total = 0;
Object.keys(cubeState).forEach(face => {
cubeState[face].forEach(sticker => {
if (sticker !== null) total++;
});
});

appState.filledStickers = total;  
if (filledCountEl) {  
    filledCountEl.textContent = `${total} / 54`;  
}

}

function updateFaceCounter() {
if (faceCounterEl) {
faceCounterEl.textContent = ${appState.currentFace + 1} / ${appState.totalFaces};
}
if (faceProgressEl) {
faceProgressEl.value = appState.currentFace + 1;
}

if (NAVIGATION_SEQUENCE[appState.currentFace] === "D") {  
    if (nextFaceBtn) nextFaceBtn.disabled = true;  
    if (validateBtn) validateBtn.disabled = false;  
} else {  
    if (nextFaceBtn) nextFaceBtn.disabled = false;  
    if (validateBtn) validateBtn.disabled = true;  
}

}

function refreshEditor() {
updateFaceCounter();
updateFilledCounter();
updateColorCounters();
}

// =========================================================
// 7. Core Verification & Validation Logic
// =========================================================

function validateCube() {
const validationCounts = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 };

for (const face of Object.keys(cubeState)) {  
    for (const sticker of cubeState[face]) {  
        if (!sticker) {  
            showToast("Error: Complete all 54 stickers before validation.");  
            return false;  
        }  
        if (!(sticker in validationCounts)) {  
            showToast("Error: Layout configuration contains structural corruption.");  
            return false;  
        }  
        validationCounts[sticker]++;  
    }  
}  

for (const faceCode of Object.keys(validationCounts)) {  
    if (validationCounts[faceCode] !== 9) {  
        showToast(`Error: ${faceCode} color facelets must appear exactly 9 times.`);  
        return false;  
    }  
}  

appState.cubeValidated = true;  
showToast("Cube verification successful! Ready to solve.");  
return true;

}

// =========================================================
// 8. Event Subscriptions & Interactive Triggers
// =========================================================

if (nextFaceBtn) {
nextFaceBtn.addEventListener("click", () => {
if (appState.currentFace >= NAVIGATION_SEQUENCE.length - 1) return;

appState.currentFace++;  
    const targetFaceCode = NAVIGATION_SEQUENCE[appState.currentFace];  
      
    if (engine && typeof engine.navigateToFace === "function") {  
        engine.navigateToFace(targetFaceCode);  
    }  

    refreshEditor();  
    showToast(`Switched view to ${targetFaceCode} Face`);  
});

}

colorButtons.forEach(button => {
button.addEventListener("click", () => {
const color = button.dataset.color;
if (!color) return;

appState.selectedColor = color;  
    colorButtons.forEach(btn => btn.classList.remove("active"));  
    button.classList.add("active");  

    if (engine) {  
        engine.activeColor = COLOR_TO_FACE[color];  
    }  
});

});

if (validateBtn) {
validateBtn.addEventListener("click", () => {
if (validateCube() && solveBtn) {
solveBtn.disabled = false;
}
});
}

if (solveBtn) {
solveBtn.disabled = true;
solveBtn.addEventListener("click", () => {
if (!appState.cubeValidated) {
showToast("Please validate the layout configuration first.");
return;
}

if (typeof window.solveCube === "function") {  
        window.solveCube(cubeState);  
    } else {  
        showToast("Executing solver pipeline... Dispatching configuration matrix.");  
        document.dispatchEvent(new CustomEvent("cubeReadyForSolver", {  
            detail: { cubeState }  
        }));  
    }  
});

}

// =========================================================
// 9. Theme Management & Personalization Engine
// =========================================================

function applyTheme(theme) {
document.body.setAttribute("data-theme", theme);
localStorage.setItem("theme", theme);
if (themeBtn) {
themeBtn.textContent = theme === "dark" ? "🌙" : "☀️";
}

if (engine && typeof engine.updateBackgroundColor === "function") {  
    engine.updateBackgroundColor(theme === "dark" ? 0x101826 : 0xf5f7fa);  
}

}

if (themeBtn) {
let currentTheme = localStorage.getItem("theme") || "dark";
applyTheme(currentTheme);

themeBtn.addEventListener("click", () => {  
    currentTheme = currentTheme === "dark" ? "light" : "dark";  
    applyTheme(currentTheme);  
});

}

if (settingsBtn) {
settingsBtn.addEventListener("click", () => {
showToast("Settings system optimized. Calibration properties active.");
});
}

// =========================================================
// 10. Lifecycle Initialization & Engine Instantiation
// =========================================================

function initEngine() {
if (!viewer) {
console.error("Initialization Error: Render container element not found.");
return;
}

// Instantiating the engine according to the exact signature API  
engine = new CubeEngine();  
engine.initialize(viewer);  

// Coordinate state settings cleanly down into the 3D space  
engine.activeColor = COLOR_TO_FACE[appState.selectedColor];  

engine.onStateChanged = () => {  
    syncEngineToCubeState();  
    refreshEditor();  
};  

engine.onStickerTapped = (clickedSticker) => {  
    if (engine && appState.selectedColor) {  
        const targetFaceCode = COLOR_TO_FACE[appState.selectedColor];  
        engine.setStickerColor(clickedSticker, targetFaceCode);  
    }  
};  

if (typeof engine.navigateToFace === "function") {  
    engine.navigateToFace(NAVIGATION_SEQUENCE[appState.currentFace]);  
}

}

async function startSplash() {
let progress = 0;
while (progress <= 100) {
if (loadingProgress) {
loadingProgress.style.width = progress + "%";
}
await sleep(15);
progress++;
}

if (splashScreen) splashScreen.classList.add("hidden");  
if (mainApp) mainApp.classList.remove("hidden");  

initEngine();  
refreshEditor();  
showToast("System ready. Welcome to Rubik Solver Pro.");

}

window.addEventListener("DOMContentLoaded", () => {
const initialActiveBtn = document.querySelector([data-color="${appState.selectedColor}"]);
if (initialActiveBtn) {
initialActiveBtn.classList.add("active");
}
startSplash();
});
