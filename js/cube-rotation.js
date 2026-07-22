import * as THREE from "three";

export class CubeRotation {

    constructor(rubiksCube) {

        this.cube = rubiksCube;

        this.animating = false;

        this.rotationSpeed = 0.12;

        this.currentQuaternion = this.cube.quaternion.clone();

        this.targetQuaternion = this.cube.quaternion.clone();

        this.currentView = 0;
        
        this.views = [];

        this.sequence = [
            "right",
            "up",
            "right",
            "right",
            "up"
        ];

    }
    
    rotate(direction) {

    if (this.animating) return;

    this.animating = true;

    this.currentQuaternion.copy(this.cube.quaternion);

    const axis = new THREE.Vector3();

    switch (direction) {

        case "right":
            axis.set(0, 1, 0);
            break;

        case "left":
            axis.set(0, -1, 0);
            break;

        case "up":
            axis.set(1, 0, 0);
            break;

        case "down":
            axis.set(-1, 0, 0);
            break;

        default:
            this.animating = false;
            return;

    }

    // Rotate using current cube orientation
    axis.applyQuaternion(this.currentQuaternion);

    const rotation = new THREE.Quaternion();

    rotation.setFromAxisAngle(axis.normalize(), Math.PI / 2);

    this.targetQuaternion.copy(this.currentQuaternion);

    this.targetQuaternion.premultiply(rotation);

    this.targetQuaternion.normalize();

}
    
    update() {

        if (!this.animating) return;

        this.cube.quaternion.slerp(
            this.targetQuaternion,
            this.rotationSpeed
        );

        if (
            this.cube.quaternion.angleTo(
                this.targetQuaternion
            ) < 0.01
        ) {

            this.cube.quaternion.copy(
                this.targetQuaternion
            );

            this.animating = false;

        }

    }

    isAnimating() {

        return this.animating;

    }

}
