/* ==========================================
   Rubik Solver Pro v3.0
   cube-engine.js
   Part 1 - Engine Core
========================================== */

"use strict";

/* ==========================================
   Global Engine
========================================== */

let scene = null;
let camera = null;
let renderer = null;

let cubeGroup = null;

let animationClock = null;

let canvas = null;

let engineReady = false;

/* ==========================================
   Cube Constants
========================================== */

const CUBE_SIZE = 3;

const CUBIE_SIZE = 0.95;

const GAP = 0.05;

/* Face Colors */

const FACE_COLOR = {

    U: 0xffffff,
    D: 0xffd500,
    R: 0xff3b30,
    L: 0xff9500,
    F: 0x22c55e,
    B: 0x2196f3,

    INSIDE: 0x111111

};

/* ==========================================
   Scene
========================================== */

function createScene(){

    scene = new THREE.Scene();

    scene.background = null;

}

/* ==========================================
   Camera
========================================== */

function createCamera(){

    camera = new THREE.PerspectiveCamera(

        45,

        1,

        0.1,

        1000

    );

    camera.position.set(

        6,

        6,

        6

    );

    camera.lookAt(

        0,

        0,

        0

    );

}

/* ==========================================
   Renderer
========================================== */

function createRenderer(){

    canvas = document.getElementById("cubeCanvas");

    renderer = new THREE.WebGLRenderer({

        canvas,

        antialias:true,

        alpha:true

    });

    renderer.setPixelRatio(

        window.devicePixelRatio

    );

    renderer.outputColorSpace =

    THREE.SRGBColorSpace;

}

/* ==========================================
   Resize
========================================== */

function resizeRenderer(){

    const container =

    document.getElementById(

        "cubeContainer"

    );

    if(!container) return;

    const width =

    container.clientWidth;

    const height =

    container.clientHeight;

    renderer.setSize(

        width,

        height,

        false

    );

    camera.aspect =

    width / height;

    camera.updateProjectionMatrix();

}

window.addEventListener(

    "resize",

    resizeRenderer

);

/* ==========================================
   Rubik Solver Pro v3.0
   cube-engine.js
   Part 2 - Lights & Cube Group
========================================== */

/* ==========================================
   Lights
========================================== */

function createLights(){

    const ambientLight =

    new THREE.AmbientLight(

        0xffffff,

        1.4

    );

    scene.add(

        ambientLight

    );

    const light1 =

    new THREE.DirectionalLight(

        0xffffff,

        2

    );

    light1.position.set(

        8,

        10,

        8

    );

    scene.add(

        light1

    );

    const light2 =

    new THREE.DirectionalLight(

        0xffffff,

        1.2

    );

    light2.position.set(

        -8,

        -6,

        -8

    );

    scene.add(

        light2

    );

}

/* ==========================================
   Cube Group
========================================== */

function createCubeGroup(){

    cubeGroup =

    new THREE.Group();

    scene.add(

        cubeGroup

    );

}

/* ==========================================
   Cubie Material
========================================== */

function createMaterial(color){

    return new THREE.MeshStandardMaterial({

        color,

        roughness:0.35,

        metalness:0.08

    });

}

/* ==========================================
   Geometry
========================================== */

const cubieGeometry =

new THREE.BoxGeometry(

    CUBIE_SIZE,

    CUBIE_SIZE,

    CUBIE_SIZE

);

/* ==========================================
   Cubie Factory
========================================== */

function createCubie(x,y,z){

    const materials=[

        createMaterial(FACE_COLOR.R),

        createMaterial(FACE_COLOR.L),

        createMaterial(FACE_COLOR.U),

        createMaterial(FACE_COLOR.D),

        createMaterial(FACE_COLOR.F),

        createMaterial(FACE_COLOR.B)

    ];

    const cubie =

    new THREE.Mesh(

        cubieGeometry,

        materials

    );

    cubie.position.set(

        x,

        y,

        z

    );

    cubeGroup.add(

        cubie

    );

}

/* ==========================================
   Rubik Solver Pro v3.0
   cube-engine.js
   Part 3 - Build Cube
========================================== */

/* ==========================================
   Build 3×3 Cube
========================================== */

function buildCube(){

    if(!cubeGroup){

        createCubeGroup();

    }

    while(cubeGroup.children.length){

        cubeGroup.remove(

            cubeGroup.children[0]

        );

    }

    const offset =

    CUBE_SIZE - 1;

    for(

        let x=0;

        x<CUBE_SIZE;

        x++

    ){

        for(

            let y=0;

            y<CUBE_SIZE;

            y++

        ){

            for(

                let z=0;

                z<CUBE_SIZE;

                z++

            ){

                createCubie(

                    (x-offset)*

                    (CUBIE_SIZE+GAP),

                    (offset-y)*

                    (CUBIE_SIZE+GAP),

                    (offset-z)*

                    (CUBIE_SIZE+GAP)

                );

            }

        }

    }

}

/* ==========================================
   Animation Loop
========================================== */

function animate(){

    requestAnimationFrame(

        animate

    );

    if(cubeGroup){

        cubeGroup.rotation.y += 0.003;

    }

    renderer.render(

        scene,

        camera

    );

}

/* ==========================================
   Engine Start
========================================== */

function startEngine(){

    createScene();

    createCamera();

    createRenderer();

    createLights();

    createCubeGroup();

    buildCube();

    resizeRenderer();

    animate();

    engineReady = true;

}

/* ==========================================
   Startup
========================================== */

window.addEventListener(

    "DOMContentLoaded",

    ()=>{

        startEngine();

    }

);

