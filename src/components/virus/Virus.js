import * as THREE from "three";
import * as CANNON from "cannon";
import * as APP from "../../app.js";

class Virus {
    constructor(position, material, world) {
        this.radius = 0.5;
        const segments = 50;
        const color = new THREE.Color('blue');

        this.name = "virus";

        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.radius, segments),
            new THREE.MeshPhongMaterial({ color: color })
        );
        this.mesh.position.set(position.x, position.y, position.z);

        let shape = new CANNON.Sphere(this.radius);
        this.body = new CANNON.Body({
            mass: 1,
            linearDamping: 0,
            angularDamping: 0,
            material: material,
        });
        this.body.addShape(shape);
        this.body.position.set(position.x, position.y, position.z);
        world.add(this.body);
    }

    handleWallCollisions() {
        let velocity = this.body.velocity.clone();
        console.log(this.mesh.position)
        console.log(APP.width - APP.planeRad - this.radius);

        // +x wall
        if (this.body.position.x >= APP.width - APP.planeRad - this.radius) {
            console.log("+x intersection");
            this.body.position.x = APP.width - APP.planeRad - this.radius;
            this.body.velocity = this.calculateVelocity(
                new CANNON.Vec3(1, 0, 0),
                velocity
            );
        }
        // -x wall
        if (this.body.position.x <= APP.EPS) {
            this.body.position.x = APP.EPS;
            this.body.velocity = this.calculateVelocity(
                new CANNON.Vec3(1, 0, 0),
                velocity
            );
        }
        // +z wall
        if (this.body.position.z >= APP.height - APP.planeRad - this.radius) {
            this.body.position.z = APP.height - APP.planeRad - this.radius;
            this.body.velocity = this.calculateVelocity(
                new CANNON.Vec3(0, 0, 1),
                velocity
            );
        }
        // -z wall
        if (this.body.position.z <= APP.EPS) {
            this.body.position.z = APP.EPS;
            this.body.velocity = this.calculateVelocity(
                new CANNON.Vec3(0, 0, -1),
                velocity
            );
        }
    }

    calculateVelocity(normal, velocity) {
        let dot = normal.dot(velocity.clone());
        let c = normal.clone().scale(2 * dot);
        return velocity.clone().vsub(c).scale(0.8);
    }   
}

export default Virus;
