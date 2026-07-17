// ===============================
// Rubik Solver Pro
// solver.js
// ===============================

// Solution Moves
let solutionMoves = [];

// Current Step
let currentStep = 0;

/**
 * Convert cubeState to solver format
 */
function cubeStateToSolverString(cubeState) {

    // TODO:
    // Convert cubeState into the format required
    // by cube.js / solve.js library

    return "";

}

/**
 * Generate Solution
 */
function solveCube(cubeState) {

    // Convert cube state
    const cubeString = cubeStateToSolverString(cubeState);

    // TODO:
    // Call cube solver library here

    solutionMoves = [];

    currentStep = 0;

    return solutionMoves;

}

/**
 * Get All Moves
 */
function getSolutionMoves() {

    return solutionMoves;

}

/**
 * Get Current Move
 */
function getCurrentMove() {

    if (currentStep >= solutionMoves.length)
        return null;

    return solutionMoves[currentStep];

}

/**
 * Next Move
 */
function nextMove() {

    if (currentStep < solutionMoves.length - 1) {

        currentStep++;

    }

    return getCurrentMove();

}

/**
 * Previous Move
 */
function previousMove() {

    if (currentStep > 0) {

        currentStep--;

    }

    return getCurrentMove();

}

/**
 * Reset Player
 */
function resetSolution() {

    currentStep = 0;

}
