import * as THREE from "three";
import * as CANNON from "cannon";
import * as APP from "../../app.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import VIRUSOBJ from "../../../glbs/1409 Virus2.glb";


const directions = {
  0: new CANNON.Vec3(1, 0, 0),
  1: new CANNON.Vec3(-1, 0, 0),
  2: new CANNON.Vec3(0, 0, 1),
  3: new CANNON.Vec3(0, 0, -1),
  4: new CANNON.Vec3(1, 0, 1),
  5: new CANNON.Vec3(-1, 0, 1),
  6: new CANNON.Vec3(1, 0, -1),
  7: new CANNON.Vec3(-1, 0, -1),
};

class Virus {
  constructor(
    radius,
    color,
    velocity,
    impact,
    mass,
    position,
    material,
    world
  ) {
    this.name = "virus";
    this.radius = radius;
    this.impact = impact;
    this.mass = mass;
    const scale = radius * 0.1;
    const segments = 50;
    this.maxVelocity = velocity;

    // Create the THREE mesh.
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius, segments),
      new THREE.MeshPhongMaterial({ color: color })
    );
    this.mesh.position.set(position.x, position.y, position.z);

    var self = this;
    let loader = new GLTFLoader();
    loader.load(VIRUSOBJ, function (object) {
      APP.scene.remove(self.mesh);
      self.mesh = object.scene.children[0].children[0].clone();
      self.mesh.geometry.scale(scale, scale, scale);
      self.mesh.geometry.center();
      self.mesh.position.set(position.x, position.y, position.z);
      self.mesh.material = new THREE.MeshPhongMaterial({ color: color });
      self.mesh.castShadow = true;
      APP.scene.add(self.mesh);
    });

    // Create the CANNON body.
    let shape = new CANNON.Sphere(this.radius);
    this.body = new CANNON.Body({
      mass: this.mass,
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
    if (this.body.position.x < APP.EPS) {
      this.body.position.x = APP.EPS;
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
    if (this.body.position.z < APP.EPS) {
      this.body.position.z = APP.EPS;
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
      this.maxVelocity > Math.abs(newVelocity.x)
        ? this.maxVelocity
        : newVelocity.x;
    newVelocity.y =
      this.maxVelocity > Math.abs(newVelocity.y)
        ? this.maxVelocity
        : newVelocity.y;
    newVelocity.z =
      this.maxVelocity > Math.abs(newVelocity.z)
        ? this.maxVelocity
        : newVelocity.z;
    return newVelocity;
  }

  randomWalk() {
    var state = APP.getState();
    if (state == "play") {
      let index = Math.floor(8 * Math.random());
      directions[index].normalize();
      directions[index] = directions[index].scale(this.impact);
      this.body.applyImpulse(directions[index], this.body.position);
    }
    let me = this;
    setTimeout(function () {
      me.randomWalk();
    }, 1000);
  }
}

export default Virus;
