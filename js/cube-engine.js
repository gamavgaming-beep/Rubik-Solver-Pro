/**
 * ==========================================================
 * Rubik Solver Pro
 * cube-engine.js
 * Part 1A - Engine Foundation
 * Three.js r179+
 * ==========================================================
 */

class CubeEngine {

    constructor(options = {}) {

        // --------------------------------------------------
        // Version
        // --------------------------------------------------

        this.version = "1.0.0";

        // --------------------------------------------------
        // DOM
        // --------------------------------------------------

        this.container = null;
        this.canvas = null;

        // --------------------------------------------------
        // THREE Core
        // --------------------------------------------------

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // --------------------------------------------------
        // Cube Objects
        // --------------------------------------------------

        this.world = null;
        this.cubeRoot = null;

        this.cubies = [];
        this.stickers = [];

        // --------------------------------------------------
        // Groups
        // --------------------------------------------------

        this.rotationGroup = null;

        // --------------------------------------------------
        // Lights
        // --------------------------------------------------

        this.ambientLight = null;
        this.directionLight = null;
        this.fillLight = null;

        // --------------------------------------------------
        // Raycaster
        // --------------------------------------------------

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // --------------------------------------------------
        // Clock
        // --------------------------------------------------

        this.clock = new THREE.Clock();

        // --------------------------------------------------
        // Animation
        // --------------------------------------------------

        this.animationId = null;
        this.delta = 0;
        this.elapsed = 0;

        // --------------------------------------------------
        // Camera Orbit
        // --------------------------------------------------

        this.cameraDistance = 8;

        this.cameraRotation = {

            x: -0.45,
            y: 0.75

        };

        // --------------------------------------------------
        // Queue
        // --------------------------------------------------

        this.moveQueue = [];

        this.currentMove = null;

        this.isAnimating = false;

        this.isPaused = false;

        // --------------------------------------------------
        // History
        // --------------------------------------------------

        this.undoStack = [];
        this.redoStack = [];

        // --------------------------------------------------
        // Interaction
        // --------------------------------------------------

        this.dragging = false;

        this.rotatingCube = false;

        this.pointerStart = {

            x:0,
            y:0

        };

        this.pointerNow = {

            x:0,
            y:0

        };

        // --------------------------------------------------
        // Theme
        // --------------------------------------------------

        this.colors = {

            U:0xffffff,
            D:0xffd500,
            L:0xff6b00,
            R:0xcc0000,
            F:0x00b050,
            B:0x0066ff,

            BODY:0x111111,
            EDGE:0x303030

        };

        // --------------------------------------------------
        // Cube Size
        // --------------------------------------------------

        this.size = {

            cubie:0.96,

            gap:1.02,

            sticker:0.84,

            stickerOffset:0.02

        };

        // --------------------------------------------------
        // Animation Config
        // --------------------------------------------------

        this.speed = {

            normal:280,

            fast:180,

            faster:120

        };

        this.turnSpeed = this.speed.fast;

        // --------------------------------------------------
        // Options Override
        // --------------------------------------------------

        Object.assign(this, options);

    }

}

// =====================================================
// Part 1B
// Scene Initialization
// =====================================================

initialize(container){

    if(!container){

        throw new Error("CubeEngine : Container not found.");

    }

    this.container = container;

    // -----------------------------------------
    // Scene
    // -----------------------------------------

    this.scene = new THREE.Scene();

    this.scene.background = null;

    // -----------------------------------------
    // Camera
    // -----------------------------------------

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(

        40,
        width / height,
        0.1,
        100

    );

    this.camera.position.set(

        6.5,
        5.5,
        7.5

    );

    this.camera.lookAt(0,0,0);

    // -----------------------------------------
    // Renderer
    // -----------------------------------------

    this.renderer = new THREE.WebGLRenderer({

        antialias:true,

        alpha:true,

        powerPreference:"high-performance"

    });

    this.renderer.setSize(width,height);

    this.renderer.setPixelRatio(

        Math.min(

            window.devicePixelRatio,

            2

        )

    );

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    this.renderer.toneMappingExposure = 1.15;

    this.renderer.shadowMap.enabled = true;

    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.canvas = this.renderer.domElement;

    container.appendChild(this.canvas);

    // -----------------------------------------
    // Root Groups
    // -----------------------------------------

    this.world = new THREE.Group();

    this.scene.add(this.world);

    this.cubeRoot = new THREE.Group();

    this.world.add(this.cubeRoot);

    // -----------------------------------------
    // Lighting
    // -----------------------------------------

    this.createLights();

    // -----------------------------------------
    // Events
    // -----------------------------------------

    window.addEventListener(

        "resize",

        ()=>this.onResize()

    );

    // -----------------------------------------
    // Render Loop
    // -----------------------------------------

    this.clock.start();

    this.animate();

}

createLights(){

    // Ambient

    this.ambientLight = new THREE.AmbientLight(

        0xffffff,

        0.45

    );

    this.scene.add(

        this.ambientLight

    );

    // Main Sun

    this.directionLight = new THREE.DirectionalLight(

        0xffffff,

        1.25

    );

    this.directionLight.position.set(

        5,

        8,

        6

    );

    this.directionLight.castShadow = true;

    this.directionLight.shadow.mapSize.width = 2048;

    this.directionLight.shadow.mapSize.height = 2048;

    this.directionLight.shadow.camera.near = 0.5;

    this.directionLight.shadow.camera.far = 30;

    this.scene.add(

        this.directionLight

    );

    // Fill

    this.fillLight = new THREE.PointLight(

        0x66aaff,

        0.35

    );

    this.fillLight.position.set(

        -6,

        4,

        -5

    );

    this.scene.add(

        this.fillLight

    );

}

onResize(){

    if(!this.renderer) return;

    const w = this.container.clientWidth;

    const h = this.container.clientHeight;

    this.camera.aspect = w / h;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(

        w,

        h

    );

}

render(){

    this.renderer.render(

        this.scene,

        this.camera

    );

}

animate(){

    this.animationId = requestAnimationFrame(

        ()=>this.animate()

    );

    this.delta = this.clock.getDelta();

    this.elapsed = this.clock.elapsedTime;

    if(!this.isPaused){

        this.update();

    }

    this.render();

}

update(){

    // Rotation Animation

    this.processQueue();

}

dispose(){

    cancelAnimationFrame(

        this.animationId

    );

    this.renderer.dispose();

    this.scene.clear();

}

// =====================================================
// Part 2A
// Cube Builder
// =====================================================

// Geometry Cache

createSharedGeometry(){

    this.bodyGeometry = new THREE.BoxGeometry(

        this.size.cubie,
        this.size.cubie,
        this.size.cubie

    );

    this.edgeGeometry = new THREE.EdgesGeometry(

        this.bodyGeometry

    );

}

createSharedMaterials(){

    this.bodyMaterial = new THREE.MeshStandardMaterial({

        color:this.colors.BODY,

        roughness:0.70,

        metalness:0.10

    });

    this.edgeMaterial = new THREE.LineBasicMaterial({

        color:this.colors.EDGE

    });

}

buildCube(){

    this.createSharedGeometry();

    this.createSharedMaterials();

    this.cubies = [];

    const gap = this.size.gap;

    for(let x=-1;x<=1;x++){

        for(let y=-1;y<=1;y++){

            for(let z=-1;z<=1;z++){

                const cubie = this.createCubie(

                    x,
                    y,
                    z
                );

                cubie.position.set(

                    x*gap,
                    y*gap,
                    z*gap

                );

                cubie.userData.grid={

                    x,
                    y,
                    z

                };

                this.cubeRoot.add(cubie);

                this.cubies.push(cubie);

            }

        }

    }

}

createCubie(x,y,z){

    const mesh = new THREE.Mesh(

        this.bodyGeometry,

        this.bodyMaterial.clone()

    );

    mesh.castShadow = true;

    mesh.receiveShadow = true;

    const edges = new THREE.LineSegments(

        this.edgeGeometry,

        this.edgeMaterial

    );

    mesh.add(edges);

    this.attachStickers(

        mesh,

        x,

        y,

        z

    );

    return mesh;

        }

// =====================================================
// Part 2B
// Sticker Builder
// =====================================================

createStickerMaterial(color){

    return new THREE.MeshStandardMaterial({

        color:color,

        roughness:0.35,

        metalness:0.05,

        emissive:color,

        emissiveIntensity:0.18

    });

}

createStickerGeometry(){

    return new THREE.PlaneGeometry(

        this.size.sticker,

        this.size.sticker

    );

}

attachStickers(mesh,x,y,z){

    const offset =
        this.size.cubie/2 +
        this.size.stickerOffset;

    if(x===1){

        this.addSticker(

            mesh,

            "R",

            this.colors.R,

            new THREE.Vector3(offset,0,0),

            new THREE.Euler(0,-Math.PI/2,0),

            x,y,z

        );

    }

    if(x===-1){

        this.addSticker(

            mesh,

            "L",

            this.colors.L,

            new THREE.Vector3(-offset,0,0),

            new THREE.Euler(0,Math.PI/2,0),

            x,y,z

        );

    }

    if(y===1){

        this.addSticker(

            mesh,

            "U",

            this.colors.U,

            new THREE.Vector3(0,offset,0),

            new THREE.Euler(-Math.PI/2,0,0),

            x,y,z

        );

    }

    if(y===-1){

        this.addSticker(

            mesh,

            "D",

            this.colors.D,

            new THREE.Vector3(0,-offset,0),

            new THREE.Euler(Math.PI/2,0,0),

            x,y,z

        );

    }

    if(z===1){

        this.addSticker(

            mesh,

            "F",

            this.colors.F,

            new THREE.Vector3(0,0,offset),

            new THREE.Euler(),

            x,y,z

        );

    }

    if(z===-1){

        this.addSticker(

            mesh,

            "B",

            this.colors.B,

            new THREE.Vector3(0,0,-offset),

            new THREE.Euler(0,Math.PI,0),

            x,y,z

        );

    }

}

addSticker(

    parent,

    face,

    color,

    position,

    rotation,

    gx,

    gy,

    gz

){

    const sticker = new THREE.Mesh(

        this.createStickerGeometry(),

        this.createStickerMaterial(color)

    );

    sticker.position.copy(position);

    sticker.rotation.copy(rotation);

    sticker.userData = {

        face:face,

        color:face,

        grid:{

            x:gx,

            y:gy,

            z:gz

        },

        isCenter:

            Math.abs(gx)+
            Math.abs(gy)+
            Math.abs(gz)===1

    };

    parent.add(sticker);

    this.stickers.push(sticker);

}

this.stickers = [];

this.createSharedGeometry();

this.createSharedMaterials();

this.buildCube();

// =====================================================
// Part 3A
// Rotation Engine
// =====================================================

// Face Axis

this.faceAxis = {

    U:"y",
    D:"y",

    L:"x",
    R:"x",

    F:"z",
    B:"z"

};

// Layer

this.faceLayer = {

    U:1,
    D:-1,

    R:1,
    L:-1,

    F:1,
    B:-1

};

// Clockwise Direction

this.faceDirection = {

    U:-1,
    D:1,

    R:-1,
    L:1,

    F:-1,
    B:1

};

enqueue(move){

    this.moveQueue.push(move);

}

processQueue(){

    if(this.isAnimating) return;

    if(this.moveQueue.length===0) return;

    const move=this.moveQueue.shift();

    this.startMove(move);

}

parseMove(token){

    const face=token[0];

    const axis=this.faceAxis[face];

    const layer=this.faceLayer[face];

    let angle=Math.PI/2;

    if(token.endsWith("'")){

        angle*=-1;

    }

    if(token.endsWith("2")){

        angle*=2;

    }

    angle*=this.faceDirection[face];

    return{

        token,

        face,

        axis,

        layer,

        angle

    };

}

applyAlgorithm(sequence){

    const moves=sequence.trim().split(/\s+/);

    moves.forEach(move=>{

        this.enqueue(

            this.parseMove(move)

        );

    });

}

getLayerCubies(axis,layer){

    const gap=this.size.gap;

    return this.cubies.filter(c=>{

        const value=Math.round(

            c.position[axis]/gap

        );

        return value===layer;

    });

}

createRotationGroup(){

    if(this.rotationGroup){

        this.cubeRoot.remove(

            this.rotationGroup

        );

    }

    this.rotationGroup=new THREE.Group();

    this.cubeRoot.add(

        this.rotationGroup

    );

}

startMove(move){

    this.isAnimating=true;

    this.currentMove=move;

    this.createRotationGroup();

    const cubies=this.getLayerCubies(

        move.axis,

        move.layer

    );

    cubies.forEach(c=>{

        this.rotationGroup.attach(c);

    });

    this.moveProgress=0;

}

