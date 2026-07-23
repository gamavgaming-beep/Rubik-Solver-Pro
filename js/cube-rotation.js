import * as THREE from "three";

export class CubeRotation {

    constructor(rubiksCube) {

        this.cube = rubiksCube;

        this.animating = false;

        this.rotationSpeed = 0.12;

        this.currentQuaternion = this.cube.quaternion.clone();

        this.targetQuaternion = this.cube.quaternion.clone();

        this.currentView = 0;

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

    const rotation = new THREE.Quaternion();

    switch (direction) {

        case "right":
            rotation.setFromAxisAngle(
                new THREE.Vector3(0, 1, 0),
                -Math.PI / 2
            );
            break;

        case "left":
            rotation.setFromAxisAngle(
                new THREE.Vector3(0, 1, 0),
                Math.PI / 2
            );
            break;

        case "up":
            rotation.setFromAxisAngle(
                new THREE.Vector3(1, 0, 0),
                Math.PI / 2
            );
            break;

        case "down":
            rotation.setFromAxisAngle(
                new THREE.Vector3(1, 0, 0),
                -Math.PI / 2
            );
            break;

        default:
            this.animating = false;
            return;

    }

    this.targetQuaternion.copy(this.currentQuaternion);
    this.targetQuaternion.multiply(rotation);
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
