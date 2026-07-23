/**
 * Cube Rotation Engine with Sequential Screen-Relative Step Tracking
 */

// Sequence: RIGHT -> UP -> RIGHT -> RIGHT -> UP
const customSequence = ['RIGHT', 'UP', 'RIGHT', 'RIGHT', 'UP'];

let currentSeqIndex = 0;
let rotationHistoryStack = [];

/**
 * Handle Next and Previous step triggers
 */
function handleCubeStep(direction) {
  if (typeof rubiksCubeGroup === 'undefined' || !rubiksCubeGroup || typeof camera === 'undefined' || !camera) {
    return;
  }

  if (direction === 'NEXT') {
    if (currentSeqIndex < customSequence.length) {
      const action = customSequence[currentSeqIndex];

      // Save previous quaternion state for smooth reverse
      if (typeof targetQuaternion !== 'undefined') {
        rotationHistoryStack.push(targetQuaternion.clone());
      } else {
        rotationHistoryStack.push(rubiksCubeGroup.quaternion.clone());
      }

      applyScreenRelativeRotation(action);
      currentSeqIndex++;
    }
  } else if (direction === 'PREVIOUS') {
    if (rotationHistoryStack.length > 0) {
      const prevQuat = rotationHistoryStack.pop();
      if (typeof targetQuaternion !== 'undefined') {
        targetQuaternion.copy(prevQuat);
      } else {
        rubiksCubeGroup.quaternion.copy(prevQuat);
      }
      
      if (typeof isCubeRotating !== 'undefined') {
        isCubeRotating = true;
      }

      if (currentSeqIndex > 0) {
        currentSeqIndex--;
      }
    }
  }
}

/**
 * Apply rotation based on Camera Screen-Relative Axis
 */
function applyScreenRelativeRotation(action) {
  const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

  const qDelta = new THREE.Quaternion();
  const angle = Math.PI / 2; // 90 deg

  switch (action) {
    case 'RIGHT':
      qDelta.setFromAxisAngle(cameraUp, -angle);
      break;
    case 'LEFT':
      qDelta.setFromAxisAngle(cameraUp, angle);
      break;
    case 'UP':
      qDelta.setFromAxisAngle(cameraRight, angle);
      break;
    case 'DOWN':
      qDelta.setFromAxisAngle(cameraRight, -angle);
      break;
  }

  if (typeof targetQuaternion !== 'undefined') {
    targetQuaternion.premultiply(qDelta);
  } else {
    rubiksCubeGroup.quaternion.premultiply(qDelta);
  }

  if (typeof isCubeRotating !== 'undefined') {
    isCubeRotating = true;
  }
}

// Global Exports
window.handleCubeStep = handleCubeStep;
window.applyScreenRelativeRotation = applyScreenRelativeRotation;
