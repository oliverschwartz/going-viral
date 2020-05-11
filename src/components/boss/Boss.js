import * as THREE from "three";
import * as CANNON from "cannon";
import * as APP from "../../app.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

const maxVelocity = 2.0;

class Boss {
  constructor(position, material, world) {
    this.name = "virus";
    this.radius = 2;
    const segments = 50;
    this.impact = 200;
    const color = new THREE.Color("red");

    // Create the THREE mesh.
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius, segments),
      new THREE.MeshPhongMaterial({ color: color })
    );
    this.mesh.position.set(position.x, position.y, position.z);

    var self = this;
    let loader = new OBJLoader();
    loader.load("glbs/1409 Virus.obj", function (object) {
      APP.scene.remove(self.mesh);
      self.mesh = object.children[0].clone();
      self.mesh.geometry.scale(0.2, 0.2, 0.2);
      self.mesh.geometry.center();
      self.mesh.position.set(position.x, position.y, position.z);
      let color = new THREE.Color("pink");
      color.g += (Math.random() - 1) * 0.25;
      self.mesh.material.color = color;
      self.mesh.castShadow = true;
      APP.scene.add(self.mesh);
    });

    // Create the CANNON body.
    let shape = new CANNON.Sphere(this.radius);
    this.body = new CANNON.Body({
      mass: APP.bossMass,
      linearDamping: 0.5,
      angularDamping: 0,
      material: material,
    });
    this.body.addShape(shape);
    this.body.position.set(position.x, position.y, position.z);
    world.add(this.body);
    APP.scene.add(this.mesh);

    this.randomWalk();
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
    if (this.body.position.x - this.radius < APP.EPS) {
      this.body.position.x = APP.EPS + this.radius;
      this.body.velocity = this.calculateVelocity(
        new CANNON.Vec3(-1, 0, 0),
        velocity
      );
    }

    // +z wall
    if (this.body.position.z > APP.height - APP.planeRad - this.radius) {
      this.body.position.z = APP.height - APP.planeRad - this.radius - APP.EPS;
      this.body.velocity = this.calculateVelocity(
        new CANNON.Vec3(0, 0, 1),
        velocity
      );
    }
    // -z wall
    if (this.body.position.z - this.radius < APP.EPS) {
      this.body.position.z = APP.EPS + this.radius;
      this.body.velocity = this.calculateVelocity(
        new CANNON.Vec3(0, 0, -1),
        velocity
      );
    }
  }

  // Calculate the rebound velocity upon collision with a wall.
  calculateVelocity(normal, velocity) {
    let dot = normal.dot(velocity.clone());
    let c = normal.clone().scale(3 * dot);
    let newVelocity = velocity.clone().vsub(c).scale(1);
    newVelocity.x =
      maxVelocity > Math.abs(newVelocity.x) ? maxVelocity : newVelocity.x;
    newVelocity.y =
      maxVelocity > Math.abs(newVelocity.y) ? maxVelocity : newVelocity.y;
    newVelocity.z =
      maxVelocity > Math.abs(newVelocity.z) ? maxVelocity : newVelocity.z;
    return newVelocity;
  }

  randomWalk() {
    var state = APP.getState();
    if (state == "play") {
      let direction = APP.sphereBody.position.clone();
      direction = direction.vsub(this.body.position);
      direction.normalize();
      direction = direction.scale(this.impact);
      this.body.applyImpulse(direction, this.body.position);
    }
    let me = this;
    setTimeout(function () {
      me.randomWalk();
    }, 1000);
  }
}

export default Boss;
