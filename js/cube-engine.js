/**
 * Rubik Solver Pro - 3D Cube Engine
 * Powered by Three.js (r179)
 * * Production-ready implementation managing a 3×3×3 Rubik's Cube,
 * handling high-performance rendering, mouse/touch raycast interactions,
 * and smooth mechanical animations.
 */

class CubeEngine {
    constructor() {
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cubeGroup = null;
        this.cubies = [];

        // Interaction state
        this.raycaster = new THREE.Raycaster();
        this.isPointerDown = false;
        this.isRotatingCubeView = false;
        this.hasDraggedLayer = false;
        this.pointerStart = { x: 0, y: 0, px: 0, py: 0 };
        this.pointerLast = { x: 0, y: 0, px: 0, py: 0 };
        this.clickedCubie = null;
        this.clickedNormal = null;

        // Animation Queue Configuration
        this.moveQueue = [];
        this.currentMove = null;
        this.moveProgress = 0;
        this.moveDuration = 250; // ms per 90-degree turn
        this.lastTime = 0;

        // Color definitions
        this.COLORS = {
            U: 0xffffff, // White
            D: 0xffd700, // Yellow
            R: 0xb80a31, // Red
            L: 0xff5800, // Orange
            F: 0x009b48, // Green
            B: 0x0045ad, // Blue
            X: 0x111111  // Black Plastic Body
        };

        // Map characters to hex colors
        this.CHAR_TO_HEX = {
            'U': this.COLORS.U,
            'D': this.COLORS.D,
            'R': this.COLORS.R,
            'L': this.COLORS.L,
            'F': this.COLORS.F,
            'B': this.COLORS.B
        };

        // Reverse map hex to characters
        this.HEX_TO_CHAR = {
            0xffffff: 'U',
            0xffd700: 'D',
            0xb80a31: 'R',
            0xff5800: 'L',
            0x009b48: 'F',
            0x0045ad: 'B'
        };

        // Handle window resizing
        this.resizeHandler = this.handleResize.bind(this);
    }

    /**
     * Initializes the 3D scene environment, lighting, camera, and cube architecture inside the target element.
     * @param {HTMLElement} containerElement - The parent container element for the WebGL canvas.
     */
    initialize(containerElement) {
        if (!containerElement) {
            console.error("CubeEngine Initialization Error: Target container is invalid.");
            return;
        }
        this.container = containerElement;

        // Create Scene
        this.scene = new THREE.Scene();

        // Create Camera
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(5.5, 5.5, 7.5);
        this.camera.lookAt(0, 0, 0);

        // Create Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Setup Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight1.position.set(10, 20, 15);
        this.scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        dirLight2.position.set(-10, -20, -15);
        this.scene.add(dirLight2);

        // Core Cube Setup Group
        this.cubeGroup = new THREE.Group();
        // Set standard isometric viewing angle
        this.cubeGroup.rotation.x = 0.45;
        this.cubeGroup.rotation.y = -0.75;
        this.scene.add(this.cubeGroup);

        // Build 27 physical Cubies
        this.buildCubeStructure();

        // Attach input listeners
        this.setupInputListeners();

        // Start animation loop
        this.lastTime = performance.now();
        this.animate(this.lastTime);
    }

    /**
     * Generates the 3D grid layout of the 27 component cubies with exactly 54 outer stickers.
     */
    buildCubeStructure() {
        const geom = new THREE.BoxGeometry(0.96, 0.96, 0.96);

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const materials = [];

                    // Material ordering: Right (+X), Left (-X), Up (+Y), Down (-Y), Front (+Z), Back (-Z)
                    materials.push(new THREE.MeshStandardMaterial({ color: x === 1 ? this.COLORS.R : this.COLORS.X, roughness: x === 1 ? 0.1 : 0.7, metalness: 0.1 }));
                    materials.push(new THREE.MeshStandardMaterial({ color: x === -1 ? this.COLORS.L : this.COLORS.X, roughness: x === -1 ? 0.1 : 0.7, metalness: 0.1 }));
                    materials.push(new THREE.MeshStandardMaterial({ color: y === 1 ? this.COLORS.U : this.COLORS.X, roughness: y === 1 ? 0.1 : 0.7, metalness: 0.1 }));
                    materials.push(new THREE.MeshStandardMaterial({ color: y === -1 ? this.COLORS.D : this.COLORS.X, roughness: y === -1 ? 0.1 : 0.7, metalness: 0.1 }));
                    materials.push(new THREE.MeshStandardMaterial({ color: z === 1 ? this.COLORS.F : this.COLORS.X, roughness: z === 1 ? 0.1 : 0.7, metalness: 0.1 }));
                    materials.push(new THREE.MeshStandardMaterial({ color: z === -1 ? this.COLORS.B : this.COLORS.X, roughness: z === -1 ? 0.1 : 0.7, metalness: 0.1 }));

                    const cubie = new THREE.Mesh(geom, materials);
                    cubie.position.set(x, y, z);
                    // Retain initial configuration attributes
                    cubie.userData = { initialX: x, initialY: y, initialZ: z };

                    this.cubeGroup.add(cubie);
                    this.cubies.push(cubie);
                }
            }
        }
    }

    /**
     * Resets the entire Rubik's cube to its perfectly solved configuration state.
     */
    reset() {
        this.moveQueue = [];
        this.currentMove = null;
        
        // Remove all current cubies from the group
        this.cubies.forEach(cubie => this.cubeGroup.remove(cubie));
        this.cubies = [];

        // Rebuild clean configuration layout
        this.buildCubeStructure();

        // Reset group view rotations to default
        this.cubeGroup.rotation.set(0.45, -0.75, 0);
    }

    /**
     * Loads a standard Kociemba solver facelet string (54 characters in U-R-F-D-L-B format) onto the cube view.
     * @param {string} stateString - The 54 character state definition string.
     */
    load(stateString) {
        if (!stateString || stateString.length !== 54) {
            console.error("CubeEngine Load Error: Invalid state string length.");
            return;
        }

        // Reset orientations completely to basic state prior to re-coloring faces
        this.reset();

        const mapping = this.getFaceletLayoutMapping();

        for (let i = 0; i < 54; i++) {
            const char = stateString[i].toUpperCase();
            const hexColor = this.CHAR_TO_HEX[char] || this.COLORS.X;
            const target = mapping[i];

            // Search matching cubie at the pristine base coordinate location
            const cubie = this.cubies.find(c => 
                c.userData.initialX === target.x && 
                c.userData.initialY === target.y && 
                c.userData.initialZ === target.z
            );

            if (cubie) {
                cubie.material[target.faceIndex].color.setHex(hexColor);
                cubie.material[target.faceIndex].roughness = 0.1;
            }
        }
    }

    /**
     * Calculates and returns the clean Kociemba 54-character state representation mapping of the current live cube faces.
     * @returns {string} The formatted 54 character state string.
     */
    getStateString() {
        const mapping = this.getFaceletLayoutMapping();
        let stateStr = "";

        for (let i = 0; i < 54; i++) {
            const target = mapping[i];
            
            // Find cubie occupying target position coordinate space right now
            const cubie = this.cubies.find(c => 
                Math.abs(c.position.x - target.x) < 0.1 &&
                Math.abs(c.position.y - target.y) < 0.1 &&
                Math.abs(c.position.z - target.z) < 0.1
            );

            if (cubie) {
                // Find out which actual structural physical material face is pointing toward the target world direction vector
                const localNormals = [
                    new THREE.Vector3(1, 0, 0),  // 0: +X
                    new THREE.Vector3(-1, 0, 0), // 1: -X
                    new THREE.Vector3(0, 1, 0),  // 2: +Y
                    new THREE.Vector3(0, -1, 0), // 3: -Y
                    new THREE.Vector3(0, 0, 1),  // 4: +Z
                    new THREE.Vector3(0, 0, -1)  // 5: -Z
                ];

                const targetWorldNormal = localNormals[target.faceIndex];
                let matchedFaceIdx = 2; // Default fallback to U

                for (let f = 0; f < 6; f++) {
                    const dynamicWorldNormal = localNormals[f].clone().applyQuaternion(cubie.quaternion);
                    if (dynamicWorldNormal.dot(targetWorldNormal) > 0.8) {
                        matchedFaceIdx = f;
                        break;
                    }
                }

                const currentHex = cubie.material[matchedFaceIdx].color.getHex();
                stateStr += this.HEX_TO_CHAR[currentHex] || 'X';
            } else {
                stateStr += 'X';
            }
        }
        return stateStr;
    }

    /**
     * Internal geometry mapper mapping array element slots to explicit grid components.
     * Maps the 54 facelet cells exactly to their corresponding coordinates and faces in standard solved orientation.
     */
    getFaceletLayoutMapping() {
        const map = new Array(54);

        // U Face: Top (y = 1), Face index = 2 (+Y)
        let idx = 0;
        for (let z = -1; z <= 1; z++) {
            for (let x = -1; x <= 1; x++) {
                map[idx++] = { x, y: 1, z, faceIndex: 2 };
            }
        }
        // R Face: Right (x = 1), Face index = 0 (+X)
        for (let y = 1; y >= -1; y--) {
            for (let z = 1; z >= -1; z--) {
                map[idx++] = { x: 1, y, z, faceIndex: 0 };
            }
        }
        // F Face: Front (z = 1), Face index = 4 (+Z)
        for (let y = 1; y >= -1; y--) {
            for (let x = -1; x <= 1; x++) {
                map[idx++] = { x, y, z: 1, faceIndex: 4 };
            }
        }
        // D Face: Bottom (y = -1), Face index = 3 (-Y)
        for (let z = 1; z >= -1; z--) {
            for (let x = -1; x <= 1; x++) {
                map[idx++] = { x, y: -1, z, faceIndex: 3 };
            }
        }
        // L Face: Left (x = -1), Face index = 1 (-X)
        for (let y = 1; y >= -1; y--) {
            for (let z = -1; z <= 1; z++) {
                map[idx++] = { x: -1, y, z, faceIndex: 1 };
            }
        }
        // B Face: Back (z = -1), Face index = 5 (-Z)
        for (let y = 1; y >= -1; y--) {
            for (let x = 1; x >= -1; x--) {
                map[idx++] = { x, y, z: -1, faceIndex: 5 };
            }
        }
        return map;
    }

    /**
     * Interprets and appends a space-delimited standard notation algorithm string to the operational execution queue.
     * @param {string} movesString - Sequence string (e.g., "R U R' U2 F'").
     */
    applyMoves(movesString) {
        if (!movesString) return;
        const tokens = movesString.trim().split(/\s+/);
        tokens.forEach(token => {
            const step = this.parseMoveToken(token);
            if (step) this.moveQueue.push(step);
        });
    }

    /**
     * Translates a singular move token into target structural turning parameters.
     */
    parseMoveToken(token) {
        if (!token) return null;
        const base = token[0].toUpperCase();
        const modifier = token.substring(1);

        let axis, layer, dirSign;

        switch (base) {
            case 'R': axis = 'x'; layer = 1;  dirSign = -1; break;
            case 'L': axis = 'x'; layer = -1; dirSign = 1;  break;
            case 'U': axis = 'y'; layer = 1;  dirSign = -1; break;
            case 'D': axis = 'y'; layer = -1; dirSign = 1;  break;
            case 'F': axis = 'z'; layer = 1;  dirSign = -1; break;
            case 'B': axis = 'z'; layer = -1; dirSign = 1;  break;
            case 'M': axis = 'x'; layer = 0;  dirSign = 1;  break;
            case 'E': axis = 'y'; layer = 0;  dirSign = 1;  break;
            case 'S': axis = 'z'; layer = 0;  dirSign = -1; break;
            default: return null;
        }

        let angle = (Math.PI / 2) * dirSign;
        if (modifier === "'") {
            angle = -angle;
        } else if (modifier === '2') {
            angle = Math.PI * dirSign;
        }

        return { axis, layer, angle };
    }

    /**
     * Triggers operational activation sequence for a specific transformation step.
     */
    startLayerRotation(moveData) {
        const rotationGroup = new THREE.Group();
        this.cubeGroup.add(rotationGroup);

        const movingCubies = [];
        this.cubies.forEach(cubie => {
            if (Math.abs(cubie.position[moveData.axis] - moveData.layer) < 0.1) {
                movingCubies.push(cubie);
            }
        });

        // Attach elements to rotation control group container safely preserving world matrix transformations
        movingCubies.forEach(cubie => rotationGroup.attach(cubie));

        this.currentMove = {
            group: rotationGroup,
            axis: moveData.axis,
            targetAngle: moveData.angle,
            cubies: movingCubies
        };
        this.moveProgress = 0;
    }

    /**
     * Tears down active group structure and aligns positions precisely to nearest right angle space upon mechanical turn completion.
     */
    finalizeCurrentMove() {
        const move = this.currentMove;
        if (!move) return;

        // Force matrix transformations to capture precise terminal values before detachment
        move.group.updateMatrixWorld(true);

        const targetElements = [...move.cubies];
        targetElements.forEach(cubie => {
            this.cubeGroup.attach(cubie);
            
            // Clean up float error rounding inconsistencies out of alignment metrics
            cubie.position.x = Math.round(cubie.position.x);
            cubie.position.y = Math.round(cubie.position.y);
            cubie.position.z = Math.round(cubie.position.z);

            cubie.rotation.x = Math.round(cubie.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
            cubie.rotation.y = Math.round(cubie.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
            cubie.rotation.z = Math.round(cubie.rotation.z / (Math.PI / 2)) * (Math.PI / 2);
        });

        this.cubeGroup.remove(move.group);
        this.currentMove = null;
    }

    /**
     * Mouse / Touch Interaction normalizer processing engine.
     */
    setupInputListeners() {
        const dom = this.renderer.domElement;

        dom.addEventListener('mousedown', e => this.onPointerStart(e), { passive: false });
        window.addEventListener('mousemove', e => this.onPointerMove(e), { passive: false });
        window.addEventListener('mouseup', () => this.onPointerEnd(), { passive: false });

        dom.addEventListener('touchstart', e => this.onPointerStart(e), { passive: false });
        window.addEventListener('touchmove', e => this.onPointerMove(e), { passive: false });
        window.addEventListener('touchend', () => this.onPointerEnd(), { passive: false });

        window.addEventListener('resize', this.resizeHandler);
    }

    getPointerCoordinates(e) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        return {
            x: ((clientX - rect.left) / rect.width) * 2 - 1,
            y: -((clientY - rect.top) / rect.height) * 2 + 1,
            px: clientX,
            py: clientY
        };
    }

    onPointerStart(e) {
        if (this.currentMove || this.moveQueue.length > 0) return; // Prevent user injection during automated turns
        
        const coords = this.getPointerCoordinates(e);
        this.pointerStart = coords;
        this.pointerLast = coords;
        this.isPointerDown = true;
        this.hasDraggedLayer = false;

        this.raycaster.setFromCamera(new THREE.Vector2(coords.x, coords.y), this.camera);
        const intersects = this.raycaster.intersectObjects(this.cubies);

        if (intersects.length > 0) {
            this.clickedCubie = intersects[0].object;
            const rawFaceNormal = intersects[0].face.normal.clone();
            // Transform face normal vector dynamically into global runtime spatial reference coordinates
            this.clickedNormal = rawFaceNormal.applyQuaternion(this.clickedCubie.quaternion).round();
            this.isRotatingCubeView = false;
        } else {
            this.clickedCubie = null;
            this.clickedNormal = null;
            this.isRotatingCubeView = true;
        }
    }

    onPointerMove(e) {
        if (!this.isPointerDown) return;

        const coords = this.getPointerCoordinates(e);
        const deltaXPixels = coords.px - this.pointerStart.px;
        const deltaYPixels = coords.py - this.pointerStart.py;

        if (this.isRotatingCubeView) {
            const sensitivity = 0.005;
            this.cubeGroup.rotation.y += (coords.px - this.pointerLast.px) * sensitivity;
            this.cubeGroup.rotation.x += (coords.py - this.pointerLast.py) * sensitivity;
            this.pointerLast = coords;
        } else if (!this.hasDraggedLayer && this.clickedCubie && this.clickedNormal) {
            const dragThresholdPixels = 12;
            if (Math.sqrt(deltaXPixels * deltaXPixels + deltaYPixels * deltaYPixels) > dragThresholdPixels) {
                this.hasDraggedLayer = true;
                this.isPointerDown = false; // Intentionally terminate touch stream parsing immediately upon turn confirmation

                const verifiedMove = this.calculateDragTurnDirection(deltaXPixels, deltaYPixels);
                if (verifiedMove) {
                    this.startLayerRotation(verifiedMove);
                }
            }
        }
    }

    onPointerEnd() {
        this.isPointerDown = false;
        this.isRotatingCubeView = false;
        this.clickedCubie = null;
        this.clickedNormal = null;
    }

    /**
     * Resolves exact logical axis/layer turn intended by directional dragging actions across distinct face planes.
     */
    calculateDragTurnDirection(dx, dy) {
        const normal = this.clickedNormal;
        const pos = this.clickedCubie.position;
        let axis, layer, angle;

        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (Math.abs(normal.z) > 0.5) { // Front Face (+Z) / Back Face (-Z)
            const sideFactor = normal.z > 0 ? 1 : -1;
            if (absDx > absDy) {
                axis = 'y';
                layer = pos.y;
                angle = dx > 0 ? -Math.PI / 2 * sideFactor : Math.PI / 2 * sideFactor;
            } else {
                axis = 'x';
                layer = pos.x;
                angle = dy > 0 ? Math.PI / 2 : -Math.PI / 2;
            }
        } else if (Math.abs(normal.x) > 0.5) { // Right Face (+X) / Left Face (-X)
            const sideFactor = normal.x > 0 ? 1 : -1;
            if (absDx > absDy) {
                axis = 'y';
                layer = pos.y;
                angle = dx > 0 ? -Math.PI / 2 * sideFactor : Math.PI / 2 * sideFactor;
            } else {
                axis = 'z';
                layer = pos.z;
                angle = dy > 0 ? -Math.PI / 2 : Math.PI / 2;
            }
        } else if (Math.abs(normal.y) > 0.5) { // Up Face (+Y) / Down Face (-Y)
            const sideFactor = normal.y > 0 ? 1 : -1;
            if (absDx > absDy) {
                axis = 'z';
                layer = pos.z;
                angle = dx > 0 ? -Math.PI / 2 * sideFactor : Math.PI / 2 * sideFactor;
            } else {
                axis = 'x';
                layer = pos.x;
                angle = dy > 0 ? Math.PI / 2 : -Math.PI / 2;
            }
        }

        if (axis !== undefined) {
            return { axis, layer: Math.round(layer), angle };
        }
        return null;
    }

    /**
     * Keeps camera dimensions inline with resizing parent workspace layouts.
     */
    handleResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /**
     * Centralized execution loop update engine logic.
     */
    animate(timestamp) {
        requestAnimationFrame((t) => this.animate(t));

        const delta = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (this.currentMove) {
            this.moveProgress += delta / this.moveDuration;
            
            if (this.moveProgress >= 1) {
                this.currentMove.group.rotation[this.currentMove.axis] = this.currentMove.targetAngle;
                this.finalizeCurrentMove();
            } else {
                // Ease rotation progression sequentially
                this.currentMove.group.rotation[this.currentMove.axis] = this.currentMove.targetAngle * this.moveProgress;
            }
        } else if (this.moveQueue.length > 0) {
            // Unpack next rotation parameter structural data block
            const nextAction = this.moveQueue.shift();
            this.startLayerRotation(nextAction);
        }

        this.render();
    }

    /**
     * Primary isolated manual render output frame step.
     */
    render() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Expose instantiated application engine platform capability globally
window.CubeEngine = new CubeEngine();

