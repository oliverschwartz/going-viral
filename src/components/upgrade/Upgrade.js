import * as THREE from "three";
import * as CANNON from "cannon";
import * as APP from "../../app.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import SPRAY from "../../../glbs/spray.glb";

const EPS = 0.5;

class Upgrade {
  constructor(position, type) {

    this.position = position.clone();
    this.consumed = false;
    let me = this;

    let loader = new GLTFLoader();
    if (type == "spray") {
      loader.load(SPRAY, function (object) {
        let mesh = object.scene.children[0].children[0].children[0].children[0].clone(); 
        mesh.position.x = position.x; 
        mesh.position.y = position.y;
        mesh.position.z = position.z;
        mesh.scale.x = 0.5;
        mesh.scale.y = 0.5;
        mesh.scale.z = 0.5;
        mesh.geometry.center();
        me.mesh = mesh
        APP.scene.add(mesh);
      });
    }
  }

  reset() {
    this.consumed = false; 
    this.mesh.visible = true; 
  }

  handleCollisions(spherePosition) {
    if (spherePosition.y > 3 || this.consumed == true) {
      return;
    }

    // Check if the sphere is on the mesh. 
    let dist = Math.sqrt((spherePosition.x - this.position.x) ** 2 + (spherePosition.z - this.position.z) ** 2)
    if (dist < EPS && APP.health.curHealth < APP.health.maxHealth) {
      this.mesh.visible = false;
      APP.health.addHealth(100);
      APP.healSound.play();
      this.consumed = true;
    }
  }
}

export default Upgrade;
