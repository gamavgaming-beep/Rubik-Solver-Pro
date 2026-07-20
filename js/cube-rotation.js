import * as THREE from "three";

export class CubeRotation {

    constructor(rubiksCube) {

        this.cube = rubiksCube;

        this.animating = false;

        this.targetQuaternion = new THREE.Quaternion();

        this.targetQuaternion.copy(this.cube.quaternion);

        this.rotationAngle = Math.PI / 2;

        this.rotationSpeed = 0.12;

    }

}
