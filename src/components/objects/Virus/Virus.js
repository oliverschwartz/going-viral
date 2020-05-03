import {
  Group,
  Vector3,
  DoubleSide,
  Mesh,
  SphereGeometry,
  MeshPhongMaterial,
  Color,
  Euler,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import MODEL from "./virus.gltf";

class Virus extends Group {
  constructor(parent, position, direction) {
    // Call parent Group() constructor
    super();
    this.name = "virus";

    // Init state
    this.state = {
      gui: parent.state.gui,
      rotate: true,
      position: position,
      prevPosition: position.clone(),
      direction: direction,
      score: 0, // number of tiles colored
      // Define a boolean array to determine where the virus should go.
      // Each key corresponds to Left,Up,Right,Down.
      keys: [0, 0, 0, 0],
      mesh: undefined,
      physical: undefined,
      canMove: true,
      freeze: undefined,
    };

    // Define the sphere.
    const geo = new SphereGeometry(1, 32, 32);
    const mat = new MeshPhongMaterial({
      color: new Color(0xffffff * Math.random()),
      flatShading: false,
      wireframe: true,
    });
    this.state.mesh = new Mesh(geo, mat);
    this.add(this.state.mesh);
    this.state.mesh.position.set(
      this.state.position.x,
      this.state.position.y,
      this.state.position.z
    );

    // Register event listeners.
    function addKeyDownHandler(elem, keys) {
      // If a key is released.
      elem.addEventListener(
        "keydown",
        function (e) {
          if (e.key === "ArrowUp") {
            keys[0] = 1;
          }
          if (e.key === "ArrowDown") {
            keys[1] = 1;
          }
          if (e.key === "ArrowRight") {
            keys[2] = 1;
          }
          if (e.key === "ArrowLeft") {
            keys[3] = 1;
          }
        },
        false
      );
    }
    function addKeyUpHandler(elem, keys) {
      // If a key is pressed.
      elem.addEventListener(
        "keyup",
        function (e) {
          if (e.key === "ArrowUp") {
            keys[0] = 0;
          }
          if (e.key === "ArrowDown") {
            keys[1] = 0;
          }
          if (e.key === "ArrowRight") {
            keys[2] = 0;
          }
          if (e.key === "ArrowLeft") {
            keys[3] = 0;
          }
        },
        false
      );
    }
    addKeyDownHandler(window, this.state.keys);
    addKeyUpHandler(window, this.state.keys);

    // Add self to parent's update list
    parent.addToUpdateList(this);
  }

  update(timeStamp) {
    if (this.state.rotate) {
      this.children[0].rotation.x += 0.01;
      this.children[0].rotation.y += 0.01;
    }

    let mesh = this.children[0];

    // Define some movement constants.
    const speed = 0.5;
    const angle = (3 * Math.PI) / 180;

    // Iterate over the arrow keys. If any are pressed, either rotate the camera or move the virus.
    for (let i = 0; i < this.state.keys.length; i++) {
      if (this.state.keys[i] === 1) {
        let translation, x, z;
        switch (i) {
          case 0: // Forward - move the object.
            mesh.position.add(
              this.state.direction.clone().multiplyScalar(speed)
            );
            this.parent.camera.position.add(
              this.state.direction.clone().multiplyScalar(speed)
            );
            break;
          case 1: // Backward - move the object.
            mesh.position.add(
              this.state.direction.clone().multiplyScalar(-speed)
            );
            this.parent.camera.position.add(
              this.state.direction.clone().multiplyScalar(-speed)
            );
            break;
          case 2: // Right - rotate the camera.
            this.state.direction.applyEuler(new Euler(0, -angle, 0));
            x = this.parent.camera.position.x - mesh.position.x;
            z = this.parent.camera.position.z - mesh.position.z;
            this.parent.camera.position.x =
              x * Math.cos(angle) - z * Math.sin(angle) + mesh.position.x;
            this.parent.camera.position.z =
              z * Math.cos(angle) + x * Math.sin(angle) + mesh.position.z;
            break;
          case 3: // Left - rotate the camera.
            this.state.direction.applyEuler(new Euler(0, angle, 0));
            x = this.parent.camera.position.x - mesh.position.x;
            z = this.parent.camera.position.z - mesh.position.z;
            this.parent.camera.position.x =
              x * Math.cos(-angle) - z * Math.sin(-angle) + mesh.position.x;
            this.parent.camera.position.z =
              z * Math.cos(-angle) + x * Math.sin(-angle) + mesh.position.z;
            break;
        }

        // Update the position of the camera.
        // Update where the camera is looking.
        this.parent.camera.lookAt(mesh.position.clone());

        // Update the position of the virus
        // this.state.mesh.position = mesh.position;
      }
    }
  }
}

export default Virus;
