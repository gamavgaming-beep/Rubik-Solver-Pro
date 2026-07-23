// Sequence definition: Right -> Up -> Right -> Right -> Up
const sequenceSteps = ['RIGHT', 'UP', 'RIGHT', 'RIGHT', 'UP'];

// Current step tracker and history stack for reverse tracking
let currentStepIndex = 0;
let rotationHistory = [];

/**
 * Perform Rotation based on Direction ('NEXT' or 'PREVIOUS')
 */
function handleCubeStep(direction) {
  if (!rubiksCubeGroup || !camera) return;

  if (direction === 'NEXT') {
    if (currentStepIndex < sequenceSteps.length) {
      const action = sequenceSteps[currentStepIndex];
      
      // Save current orientation before applying new rotation (For smooth undo/reverse)
      rotationHistory.push(targetQuaternion.clone());
      
      // Execute the rotation
      applyRelativeRotation(action);
      currentStepIndex++;
    }
  } 
  else if (direction === 'PREVIOUS') {
    if (rotationHistory.length > 0) {
      // Pop previous quaternion state and restore it
      const prevQuaternion = rotationHistory.pop();
      targetQuaternion.copy(prevQuaternion);
      isCubeRotating = true;
      
      if (currentStepIndex > 0) {
        currentStepIndex--;
      }
    }
  }
}

/**
 * Camera-relative screen rotation engine
 */
function applyRelativeRotation(action) {
  const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

  const qDelta = new THREE.Quaternion();
  const angle = Math.PI / 2; // 90 degrees

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

  targetQuaternion.premultiply(qDelta);
  isCubeRotating = true;
}
