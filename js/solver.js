// =======================================
// Rubik Solver Pro
// js/solver.js
// =======================================

let solutionMoves = [];
let solverReady = false;

/**
 * Initialize solver (Run only once)
 */
function initializeSolver() {

    if (solverReady) return;

    Cube.initSolver();

    solverReady = true;

    console.log("Solver Initialized");

}

/**
 * Convert cubeState object to solver string
 * Order: U R F D L B
 */
function cubeStateToSolverString(cubeState) {

    return (
        cubeState.U.join("") +
        cubeState.R.join("") +
        cubeState.F.join("") +
        cubeState.D.join("") +
        cubeState.L.join("") +
        cubeState.B.join("")
    );

}

/**
 * Solve cube
 */
function solveCube(cubeState) {

    initializeSolver();

    const cubeString = cubeStateToSolverString(cubeState);

    const cube = Cube.fromString(cubeString);

    const solution = cube.solve();

    if (!solution) {

        console.error("Unable to solve cube");

        return [];

    }

    solutionMoves = solution.trim().split(/\s+/);

    loadSolution(solutionMoves);

    return solutionMoves;

}

/**
 * Get solution array
 */
function getSolutionMoves() {

    return solutionMoves;

}

/**
 * Reset solver
 */
function resetSolver() {

    solutionMoves = [];

    resetPlayer();

}
