import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

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
            `${colorUsage[color]}/9`;

        const button =
            document.querySelector(`[data-color="${color}"]`);

        button.disabled =
            colorUsage[color] >= 9;

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
/* ==========================================
   Three.js Scene Setup
========================================== */

const viewer = document.getElementById("viewer");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101826);

const camera = new THREE.PerspectiveCamera(
    45,
    viewer.clientWidth / viewer.clientHeight,
    0.1,
    1000
);

camera.position.set(6, 6, 6);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(window.devicePixelRatio);

renderer.setSize(
    viewer.clientWidth,
    viewer.clientHeight
);

viewer.appendChild(renderer.domElement);

/* ==========================================
   Lights
========================================== */

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    2
);

scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    3
);

directionalLight.position.set(5, 10, 7);

scene.add(directionalLight);

/* ==========================================
   Orbit Controls
========================================== */

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.dampingFactor = 0.08;

controls.enablePan = false;

controls.minDistance = 5;
controls.maxDistance = 12;


/* ==========================================
   Rubik's Cube (27 Cubies)
========================================== */

const rubiksCube = new THREE.Group();

const cubieSize = 0.95;
const gap = 0.05;

const faceColors = {
    U: 0xffffff, // White
    D: 0xffff00, // Yellow
    F: 0x00aa00, // Green
    B: 0x0000ff, // Blue
    R: 0xff0000, // Red
    L: 0xff8800  // Orange
};

for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {

            const materials = [

                new THREE.MeshStandardMaterial({
                    color: x === 1 ? faceColors.R : 0x222222
                }),

                new THREE.MeshStandardMaterial({
                    color: x === -1 ? faceColors.L : 0x222222
                }),

                new THREE.MeshStandardMaterial({
                    color: y === 1 ? faceColors.U : 0x222222
                }),

                new THREE.MeshStandardMaterial({
                    color: y === -1 ? faceColors.D : 0x222222
                }),

                new THREE.MeshStandardMaterial({
                    color: z === 1 ? faceColors.F : 0x222222
                }),

                new THREE.MeshStandardMaterial({
                    color: z === -1 ? faceColors.B : 0x222222
                })

            ];

            const cubie = new THREE.Mesh(
                new THREE.BoxGeometry(
                    cubieSize,
                    cubieSize,
                    cubieSize
                ),
                materials
            );

            cubie.position.set(
                x * (cubieSize + gap),
                y * (cubieSize + gap),
                z * (cubieSize + gap)
            );

            rubiksCube.add(cubie);

        }
    }
}

scene.add(rubiksCube);

/* ==========================================
   Raycaster
========================================== */

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener(
    "pointerdown",
    onPointerDown
);

function onPointerDown(event) {

    const rect =
        renderer.domElement.getBoundingClientRect();

    mouse.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1;

    mouse.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(
        mouse,
        camera
    );

    const intersects =
        raycaster.intersectObjects(
            rubiksCube.children
        );

    if (intersects.length === 0) return;

    const clickedCubie =
        intersects[0].object;

    console.log(
        "Cubie Clicked:",
        clickedCubie
    );

    showToast("Cubie Selected");

}

/* ==========================================
   Animation Loop
========================================== */

function animate() {

    requestAnimationFrame(animate);

    controls.update();

    renderer.render(
        scene,
        camera
    );

}

animate();

/* ==========================================
   Window Resize
========================================== */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            viewer.clientWidth /
            viewer.clientHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            viewer.clientWidth,
            viewer.clientHeight
        );

    }
);
