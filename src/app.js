import * as THREE from "three";
import * as CANNON from "cannon";
import { BasicLights } from "lights";
import { updateCellsForParticle, resetRender } from "./updateRender.js";
// import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Virus } from "virus";
import { Boss } from "boss";
import * as MENU from "menu";
import { Health } from "health";
import { Progress } from "progress";
import ORGAN from "../assets/organ.jpg";
import BACKGROUND from "../assets/bg.jpg";
import ROUNDSHADOW from "../assets/roundshadow.png";

import WHITECELLOBJ from "../glbs/1408 White Blood Cell.glb";
// import VIRUSOBJ from "../glbs/1409 Virus.glb";
// import VIRUSOBJ from "../glbs/1409 Virus.obj";
// import WHITECELLOBJ from "../glbs/1408 White Blood Cell.obj";
// export const VIRUS = VIRUSOBJ;

import menuCSS from "./css/menu.css";
import healthCSS from "./css/health.css";
import progressCSS from "./css/progress.css";
import winCSS from "./css/win.css";
import gameoverCSS from "./css/gameover.css";

const loader = new THREE.TextureLoader();
const bgTexture = loader.load(BACKGROUND);
import "bootstrap/dist/css/bootstrap.min.css";
require("typeface-sigmar-one");
const organTexture = new THREE.TextureLoader().load(ORGAN);

/***************************************************************************/
/* CONSTANTS AND VARIABLES */

export const EPS = 0.05;
const impact = 10 ** -3;
const objScale = 0.05;
export const width = 20;
export const height = 1000;
export const planeRad = 1;
export const virusMass = 1;
export const bossMass = 20;
export const planeColor = new THREE.Color(0x75100e);
export var scene;
export var damageSound;
export var shrekSound;
export const sphereRestHeight = 0.5;
export const bossRestHeight = 2.5;
var shadowMesh;
const zeroShadowHeight = 8;
var boss;
export let LEVEL = 1;
const dt = 1 / 60;
const camDistXZ = 5;
const camHeightAbove = 3;
const angle = (3 * Math.PI) / 180;
var world;
var controls, renderer, scene, camera;
export var sphereBody;
var planeMeshes = [],
  sphereMesh,
  sphereRad,
  sphereDir,
  state,
  viruses = [],
  bosses = [],
  menu,
  health,
  progress;
var keys = [0, 0, 0, 0, 0]; // Up, Down, Left, Right, Jump!

/***************************************************************************/
/* INITIALIZATION */

initCannon();
init();
animate();

/***************************************************************************/
/* INITIALIZATION FUNCTIONS */

// Initialize our CANNON physics engine.
function initCannon() {
  world = new CANNON.World();
  world.gravity.set(0, -20, 0);
  world.broadphase = new CANNON.NaiveBroadphase();

  // Create a plane (invisible, the blocks sit on this).
  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.Body({ mass: 0, linearDamping: 0 });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(1, 0, 0),
    -Math.PI / 2
  );
  world.addBody(groundBody);
}

function init() {
  // Create various GUI elements.
  progress = new Progress();

  // Initialize core ThreeJS components
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera();
  renderer = new THREE.WebGLRenderer({ antialias: true });

  // Add some sound.
  // addSounds();

  // Set up camera
  camera.position.set(-camDistXZ, camHeightAbove, 0);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // Set up renderer, canvas, and minor CSS adjustments
  renderer.setPixelRatio(window.devicePixelRatio);
  const canvas = renderer.domElement;
  canvas.style.display = "block"; // Removes padding below canvas
  document.body.style.margin = 0; // Removes margin around page
  document.body.style.overflow = "hidden"; // Fix scrolling
  document.body.appendChild(canvas);

  // Add some lights.
  const lights = new BasicLights();
  scene.add(lights);
  //   scene.background = new THREE.Color(0x7ec0ee);
  scene.background = bgTexture;

  // Add event listeners.
  registerListeners();

  // Resize Handler
  const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  };
  windowResizeHandler();
  window.addEventListener("resize", windowResizeHandler, false);

  // Specify the slipperiness of surfaces.
  let groundMaterial = new CANNON.Material("groundMaterial");
  let slipperyMaterial = new CANNON.Material("slipperyMaterial");
  let ground_slippery_cm = new CANNON.ContactMaterial(
    groundMaterial,
    slipperyMaterial,
    {
      friction: 0.0,
      restitution: 1,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3,
      frictionEquationStiffness: 1e8,
      frictionEquationRegularizationTime: 3,
    }
  );
  let ground_ground_cm = new CANNON.ContactMaterial(
    groundMaterial,
    groundMaterial,
    {
      friction: 0,
      restitution: 1,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3,
      frictionEquationStiffness: 1e8,
      frictionEquationRegularizationTime: 3,
    }
  );
  world.addContactMaterial(ground_slippery_cm);
  world.addContactMaterial(ground_ground_cm);

  // Add boxes on top of the plane.
  for (let i = 0; i < width; i += planeRad * 2) {
    for (let j = 0; j < height; j += planeRad * 2) {
      let x = i;
      let y = 0;
      let z = j;
      let planeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(planeRad * 2, planeRad * 2, 1),
        new THREE.MeshLambertMaterial({
          side: THREE.DoubleSide,
          color: planeColor,
          opacity: 0.8,
          map: organTexture,
          transparent: false,
          emissive: 0x321616,
        })
      );
      scene.add(planeMesh);
      planeMesh.position.set(x, y, z);
      planeMesh.rotation.x = Math.PI / 2;
      planeMeshes.push(planeMesh);
    }
  }

  // Load the shadow texture.
  let shadowLoader = new THREE.TextureLoader();
  let shadowTexture = shadowLoader.load(ROUNDSHADOW);
  shadowMesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(sphereRad * 10, sphereRad * 10),
    new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    })
  );
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y += 2 * EPS;
  scene.add(shadowMesh);

  // Create 4 walls.
  createWall(height, new CANNON.Vec3(width, 1, height / 2 - planeRad));
  createWall(
    height,
    new CANNON.Vec3(0 - planeRad * 2, 1, height / 2 - planeRad)
  );
  createWall(width, new CANNON.Vec3(width / 2 - planeRad, 1, height), true);
  createWall(
    width,
    new CANNON.Vec3(width / 2 - planeRad, 1, -planeRad * 2),
    true
  );

  // Create a sphere.
  sphereRad = 0.5;
  sphereDir = new THREE.Vector3(1, 0, 0);
  let sphereShape = new CANNON.Sphere(sphereRad);
  sphereBody = new CANNON.Body({
    mass: 1,
    linearDamping: 0.5,
    angularDamping: 0.5,
    material: groundMaterial,
  });
  sphereBody.addShape(sphereShape);
  world.add(sphereBody);
  sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(sphereRad, 100, 100),
    new THREE.MeshPhongMaterial({ color: 0x000000 })
  );
  scene.add(sphereMesh);
  sphereBody.position.set(0, sphereRestHeight + EPS, 0);
  sphereMesh.position.set(0, sphereRestHeight + EPS, 0);

  // let loader = new OBJLoader();
  let loader = new GLTFLoader();
  // console.log("before callback");
  loader.load(WHITECELLOBJ, function (object) {
    scene.remove(sphereMesh);
    sphereMesh = object.scene.children[0].children[0].clone();
    sphereMesh.geometry.scale(objScale, objScale, objScale);
    sphereMesh.geometry.center();
    sphereMesh.position.set(0, sphereRestHeight + EPS, 0);
    sphereMesh.material = new THREE.MeshLambertMaterial({ color: 0xccd4a1 });
    scene.add(sphereMesh);
  });

  // Add event listeners for health damage.
  sphereBody.addEventListener("collide", function (e) {
    if (e.body.mass == virusMass && health != null) {
      health.takeDamage(30);
    } else if (e.body.mass == virusMass && health != null) {
      health.takeDamage(60);
    }
  });

  // Create a virus.
  for (let i = 0; i < 100; i++) {
    let virus = new Virus(
      // new THREE.Color(0x95db4f),
      new THREE.Vector3(
        10 + Math.floor(i * Math.random() * 5),
        sphereRestHeight,
        10 + i * 10
      ),
      slipperyMaterial,
      world
    );
    viruses.push(virus);
    scene.add(virus.mesh);
  }

  // Go to menu
  state = "menu";
}

// Main animation loop.
function animate() {
  switch (state) {
    case "menu": {
      menu = new MENU.Menu();
      if (menu.newState == "play") {
        state = menu.newState;
      }
      break;
    }

    case "play": {
      // initialize Health if starting game
      if (health == null) health = new Health();

      // Player wins!
      if (progress.r > 99 && progress.state != "gameover") {
        menu.showWin();
        progress.state = "win";
      }

      // Game over ! :(
      if (health.curHealth == 0 && progress.state != "win") {
        progress.state = "gameover";
        menu.showGameover();
      }

      // update Cannon world
      world.step(dt);

      // Check for user input.
      applyImpulses();

      // Update the camera position.
      focusCamera();

      // Handle wall collisions and update sphere positions.
      handleWallCollisions();
      sphereMesh.position.copy(sphereBody.position);
      sphereMesh.quaternion.copy(sphereBody.quaternion);

      // Update shadow of the sphere.
      shadowMesh.position.x = sphereMesh.position.x;
      shadowMesh.position.z = sphereMesh.position.z;
      shadowMesh.material.opacity = Math.max(
        0,
        1 - (sphereMesh.position.y - sphereRad) / zeroShadowHeight
      );

      // Check if sphere touches a viral tile
      updateCellsForParticle(sphereMesh);

      // Update progress bar for sphere
      progress.updateBar(sphereMesh.position.z);

      // Update grid cells and virus positions.
      for (let i = 0; i < viruses.length; i++) {
        let virus = viruses[i];
        virus.handleWallCollisions();
        virus.mesh.position.copy(virus.body.position);
        virus.mesh.quaternion.copy(virus.body.quaternion);
        updateCellsForParticle(virus.mesh);
      }

      // Update grid cells and boss positions.
      if (bosses.length) {
        for (let i = 0; i < bosses.length; i++) {
          let boss = bosses[i];
          boss.handleWallCollisions();
          boss.mesh.position.copy(boss.body.position);
          boss.mesh.quaternion.copy(boss.body.quaternion);
          updateCellsForParticle(boss.mesh);
        }
      }

      renderer.render(scene, camera);
      break;
    }

    case "reset": {
      // Clear current display screen
      menu.clearWin();
      menu.clearGameover();

      // Reset physics of sphere
      sphereBody.position.set(0, sphereRestHeight + EPS, 0);
      sphereBody.velocity = new CANNON.Vec3(0, 0, 0);
      // Reset rendering of sphere
      sphereMesh.position.set(0, sphereRestHeight + EPS, 0);

      // Reset health and progress
      health = new Health();
      health.applyChange();
      progress = new Progress();
      progress.updateBar();

      // Reset each virus
      for (let i = 0; i < viruses.length; i++) {
        var newVirusPos = new THREE.Vector3(
          10 + Math.floor(i * Math.random() * 5),
          sphereRestHeight,
          10 + i * 10
        );
        // Reset physics
        viruses[i].body.position.set(
          newVirusPos.x,
          newVirusPos.y,
          newVirusPos.z
        );
        viruses[i].body.velocity = new CANNON.Vec3(0, 0, 0);

        // Reset rendering
        viruses[i].mesh.position.set(
          newVirusPos.x,
          newVirusPos.y,
          newVirusPos.z
        );

        // More random walking !
        viruses[i].randomWalk();
      }

      if (LEVEL == 2) {
        // add more viruses
        let slipperyMaterial = new CANNON.Material("slipperyMaterial");
        for (let i = 0; i < 10; i++) {
          // Create a boss virus.
          boss = new Boss(
            new THREE.Vector3(
              10 + Math.floor(i * Math.random() * 5),
              bossRestHeight,
              10 + i * 100
            ),
            slipperyMaterial,
            world
          );
          bosses.push(boss);
          scene.add(boss.mesh);
        }
      }

      if (LEVEL == 3) {
        // add more viruses
        let slipperyMaterial = new CANNON.Material("slipperyMaterial");
        for (let i = 0; i < 50; i++) {
          let virus = new Virus(
            new THREE.Color("blue"),
            new THREE.Vector3(
              10 + Math.floor(i * Math.random() * 5),
              sphereRestHeight,
              10 + i * 10
            ),
            slipperyMaterial,
            world
          );
          viruses.push(virus);
          scene.add(virus.mesh);
        }
      }

      state = "menu";
    }
  }
  window.requestAnimationFrame(animate);
}

/***************************************************************************/
/* HELPER FUNCTIONS */

/* 
    Create a wall at the specified position. 
    There is no corresponding CANNON object for the wall
    as we handle collisions manually. 
*/
function createWall(length, position, rotate) {
  let wallGeometry = new THREE.BoxGeometry(planeRad * 2, planeRad * 2, length);
  let wallMesh = new THREE.Mesh(
    wallGeometry,
    new THREE.MeshLambertMaterial({
      color: 0x75100e,
      opacity: 0.5,
      transparent: true,
    })
  );
  scene.add(wallMesh);
  wallMesh.position.set(position.x, position.y, position.z);
  if (rotate) {
    wallMesh.rotation.y = Math.PI / 2;
  }
}

// Ensure the camera is aligned with the sphere's direction of travel.
function focusCamera() {
  let negDirection = sphereDir.clone().normalize().negate();
  negDirection = negDirection.multiplyScalar(camDistXZ);
  let destination = sphereMesh.position.clone().add(negDirection);
  camera.position.set(
    destination.x,
    sphereMesh.position.y + camHeightAbove,
    destination.z
  );
  camera.lookAt(sphereMesh.position);
}

function handleWallCollisions() {
  let velocity = sphereBody.velocity.clone();
  // console.log(velocity);
  // +x wall
  if (sphereBody.position.x > width - planeRad - sphereRad) {
    sphereBody.position.x = width - planeRad - sphereRad - EPS;
    sphereBody.velocity = calculateVelocity(new CANNON.Vec3(1, 0, 0), velocity);
  }
  // -x wall
  if (sphereBody.position.x < EPS) {
    sphereBody.position.x = EPS;
    sphereBody.velocity = calculateVelocity(new CANNON.Vec3(1, 0, 0), velocity);
  }
  // +z wall
  if (sphereBody.position.z >= height - planeRad - sphereRad) {
    sphereBody.position.z = height - planeRad - sphereRad - EPS;
    sphereBody.velocity = calculateVelocity(new CANNON.Vec3(0, 0, 1), velocity);
  }
  // -z wall
  if (sphereBody.position.z < EPS) {
    sphereBody.position.z = EPS;
    sphereBody.velocity = calculateVelocity(
      new CANNON.Vec3(0, 0, -1),
      velocity
    );
  }
}

// Calculate the rebound velocity upon collision with a wall.
function calculateVelocity(normal, velocity) {
  var maxVelocity = 60.0;
  let dot = normal.dot(velocity.clone());
  let c = normal.clone().scale(3 * dot);
  let newVelocity = velocity.clone().vsub(c).scale(0.8);
  newVelocity.x = Math.min(maxVelocity, newVelocity.x);
  newVelocity.y = Math.min(maxVelocity, newVelocity.y);
  newVelocity.z = Math.min(maxVelocity, newVelocity.z);
  return newVelocity;
}

function applyImpulses() {
  let impulseVec = new CANNON.Vec3(sphereDir.x, 0, sphereDir.z);
  impulseVec.scale(impact);

  for (let i = 0; i < keys.length; i++) {
    if (keys[i] == 1) {
      switch (i) {
        case 0: // Apply forward impulse if ArrowUp
          sphereBody.applyImpulse(impulseVec, sphereBody.position);
          break;
        case 1: // Apply backward impulse if ArrowDown
          sphereBody.applyImpulse(impulseVec.negate(), sphereBody.position);
          break;
        case 2: // Change the ball's direction, update camera if ArrowRight
          sphereDir.applyEuler(new THREE.Euler(0, -angle, 0));
          focusCamera();
          break;
        case 3: // Change the ball's direction; update camera if ArrowLeft
          sphereDir.applyEuler(new THREE.Euler(0, angle, 0));
          focusCamera();
          break;
        case 4: // Jump! (only if not in the air) if Spacebar
          if (sphereBody.position.y <= sphereRestHeight + EPS) {
            // console.log("JUMPING!");
            sphereBody.applyImpulse(
              new CANNON.Vec3(0, 5, 0),
              sphereBody.position
            );
          }
          break;
      }
    }
  }
}

function registerListeners() {
  // Register event listeners.
  (function addKeyDownHandler() {
    window.addEventListener(
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
        if (e.key === " ") {
          keys[4] = 1;
        }
        if (
          e.key === "r" &&
          (progress.state == "win" || progress.state == "gameover")
        ) {
          // reset the game
          state = "reset";
        }
        // enter game on menu with "enter"
        if (e.key === "Enter" && state == "menu") {
          menu.startGame();
        }
        //
        if (e.key === "l" && progress.state == "win") {
          LEVEL++;
          state = "reset";
        }
      },
      false
    );
  })();
  (function addKeyUpHandler() {
    window.addEventListener(
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
        if (e.key === " ") {
          keys[4] = 0;
        }
      },
      false
    );
  })();
}

function addSounds() {
  let audioListener = new THREE.AudioListener();
  camera.add(audioListener);

  damageSound = new THREE.Audio(audioListener);
  let soundLoader1 = new THREE.AudioLoader();
  soundLoader1.load("audio/damage.mp3", function (audioBuffer) {
    damageSound.setBuffer(audioBuffer);
  });

  let soundLoader2 = new THREE.AudioLoader();
  shrekSound = new THREE.Audio(audioListener);
  soundLoader2.load("audio/shreksophone.mp3", function (audioBuffer) {
    shrekSound.setBuffer(audioBuffer);
    shrekSound.setLoop(true);
    shrekSound.setVolume(0.5);
    shrekSound.play();
  });
}

export function getFloor() {
  return planeMeshes;
}

export function getSphereMesh() {
  return sphereMesh;
}

export function getHealth() {
  return health;
}

export function getState() {
  return state;
}
