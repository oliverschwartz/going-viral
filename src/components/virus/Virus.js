import * as THREE from "three";
import * as CANNON from "cannon";
import * as APP from "../../app.js";

class Virus {
    constructor(position, material, world) {
        this.name = "virus";
        this.radius = 0.5;
        const segments = 50;
        const impact = 20; 
        const color = new THREE.Color('blue');

        // Create the THREE mesh.
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.radius, segments),
            new THREE.MeshPhongMaterial({ color: color })
        );
        this.mesh.position.set(position.x, position.y, position.z);

        // Create the CANNON body.
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

        // Make the virus move back and forth. 
        this.body.applyImpulse(new CANNON.Vec3(impact, 0, 0), this.body.position);
    }

    handleWallCollisions() {
        let velocity = this.body.velocity.clone();

        // +x wall
        if (this.body.position.x >= APP.width - APP.planeRad - this.radius) {
            this.body.position.x = APP.width - APP.planeRad - this.radius - APP.EPS;
            this.body.velocity = this.calculateVelocity(
                new CANNON.Vec3(1, 0, 0),
                velocity
            );
        }
        // -x wall
        if (this.body.position.x < APP.EPS) {
            this.body.position.x = APP.EPS;
            this.body.velocity = this.calculateVelocity(
                new CANNON.Vec3(1, 0, 0),
                velocity
            );
        }
        // +z wall
        if (this.body.position.z > APP.height - APP.planeRad - this.radius) {
            this.body.position.z = APP.height - APP.planeRad - this.radius - EPS;
            this.body.velocity = this.calculateVelocity(
                new CANNON.Vec3(0, 0, 1),
                velocity
            );
        }
        // -z wall
        if (this.body.position.z < APP.EPS) {
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
        return velocity.clone().vsub(c).scale(1);
    }   
}

export default Virus;
