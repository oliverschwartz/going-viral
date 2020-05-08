import * as THREE from "three";
import * as CANNON from "cannon";
import { BasicLights } from "lights";
import { updateCellsForParticle } from "./updateRender.js";
import { Virus } from "virus";
import { Menu } from "menu";
import { Health } from "health";
import { Progress } from "progress";

const loader = new THREE.TextureLoader();
const bgTexture = loader.load("../assets/bg.jpg");
import 'bootstrap/dist/css/bootstrap.min.css';
require('typeface-sigmar-one')
const organTexture = new THREE.TextureLoader().load("../assets/organ.jpg");
const lineTexture = new THREE.TextureLoader().load("../assets/texture.jpg");
const cellTexture = new THREE.TextureLoader().load("../assets/cell.jpg");
const cell2Texture = new THREE.TextureLoader().load("../assets/cell2.jpg");

/***************************************************************************/
/* CONSTANTS AND VARIABLES */

const dt = 1 / 60;
export const EPS = 0.05;
const impact = 10 ** -3;
export const width = 20;
export const height = 1000;
export const planeRad = 1;
export const virusMass = 1; 
const camDistXZ = 5;
const camHeight = 3;
const angle = (3 * Math.PI) / 180;
const sphereRestHeight = 0.5;
var world;
var controls, renderer, scene, camera;
var planeMeshes = [],
  sphereMesh,
  sphereBody,
  sphereRad,
  sphereDir;
var viruses = [];
var health;
var progress;
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
  world.gravity.set(0, -15, 0);
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
  // Create a menu.
  let menu = new Menu(); 

  // Initialize health and progress
  health = new Health();
  progress = new Progress(); 

  // Initialize core ThreeJS components
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera();
  renderer = new THREE.WebGLRenderer({ antialias: true });

  // Set up camera
  camera.position.set(-camDistXZ, camHeight, 0);
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
        // new THREE.MeshBasicMaterial({
        //   map: organTexture,
        // })
        new THREE.MeshLambertMaterial({
          side: THREE.DoubleSide,
          //   color: 0xd88383,
          color: 0x75100e,
          opacity: 0.5,
          map: organTexture,
          transparent: true,
          emissive: 0x321616,
        })
      );
      scene.add(planeMesh);
      planeMesh.position.set(x, y, z);
      planeMesh.castShadow = true;
      planeMesh.receiveShadow = true;
      planeMesh.rotation.x = Math.PI / 2;
      planeMeshes.push(planeMesh);
    }
  }

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
    new THREE.MeshPhongMaterial({ color: 0xffffff })
  );
  scene.add(sphereMesh);
  sphereBody.position.set(0, sphereRestHeight + EPS, 0);
  sphereMesh.position.set(0, sphereRestHeight + EPS, 0);

  // Add event listeners for health damage. 
  sphereBody.addEventListener("collide", function(e) {
    if (e.body.mass == virusMass) {
      health.takeDamage(10);
    }
  })

  // Create a virus.
  for (let i = 0; i < 100; i++) {
    let virus = new Virus(
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

// Main animation loop.
function animate() {
  window.requestAnimationFrame(animate);
  world.step(dt);

  // Check for user input.
  applyImpluses();

  // Update the camera position.
  focusCamera();

  // Handle wall collisions and update sphere positions.
  handleWallCollisions();
  sphereMesh.position.copy(sphereBody.position);
  sphereMesh.quaternion.copy(sphereBody.quaternion);

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

  renderer.render(scene, camera);
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
    })
    // new THREE.MeshLambertMaterial({
    //   side: THREE.DoubleSide,
    //   //   color: 0xd88383,
    //   color: 0x75100e,
    //   opacity: 0.5,
    //   map: organTexture,
    // })
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
  camera.position.set(destination.x, camHeight, destination.z);
  camera.lookAt(sphereMesh.position);
}

function handleWallCollisions() {
  let velocity = sphereBody.velocity.clone();

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
  let dot = normal.dot(velocity.clone());
  let c = normal.clone().scale(3 * dot);
  return velocity.clone().vsub(c).scale(0.8);
}

function applyImpluses() {
  let impulseVec = new CANNON.Vec3(sphereDir.x, 0, sphereDir.z);
  impulseVec.scale(impact);

  for (let i = 0; i < keys.length; i++) {
    if (keys[i] == 1) {
      switch (
        i // UpArrow
      ) {
        case 0: // Apply forward impulse.
          sphereBody.applyImpulse(impulseVec, sphereBody.position);
          break;
        case 1: // Apply backward impulse.
          sphereBody.applyImpulse(impulseVec.negate(), sphereBody.position);
          break;
        case 2: // Change the ball's direction; update camera.
          sphereDir.applyEuler(new THREE.Euler(0, -angle, 0));
          focusCamera();
          break;
        case 3: // Change the ball's direction; update camera.
          sphereDir.applyEuler(new THREE.Euler(0, angle, 0));
          focusCamera();
          break;
        case 4: // Jump! (only if not in the air).
          if (sphereBody.position.y <= sphereRestHeight + EPS) {
            // console.log("JUMPING!");
            sphereBody.applyImpulse(
              new CANNON.Vec3(0, 3, 0),
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

export function getFloor() {
  return planeMeshes;
}
export function getplaneRad() {
  return planeRad;
}
