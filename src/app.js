import * as THREE from "three";
import * as CANNON from "cannon";
import { BasicLights } from "lights";
import { updateCellsForParticle, resetRender } from "./updateRender.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { Virus } from "virus";
import * as MENU from "menu";
import { Health } from "health";
import { Progress } from "progress";
// import { Perlin } from "perlin";

import ORGAN from "../assets/organ.jpg";
import BACKGROUND from "../assets/bg.jpg";

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
export const planeColor = new THREE.Color(0x75100e);
export var scene;
export var damageSound;
export var shrekSound;
export const sphereRestHeight = 0.5;
const dt = 1 / 60;
const camDistXZ = 5;
const camHeightAbove = 3;
const angle = (3 * Math.PI) / 180;
var world;
var controls, renderer, scene, camera;
var planeMeshes = [],
  sphereMesh,
  sphereBody,
  sphereRad,
  sphereDir,
  state,
  viruses = [],
  menu,
  health,
  progress;
var keys = [0, 0, 0, 0, 0]; // Up, Down, Left, Right, Jump!
var date,
  pn,
  longWall1,
  longWall2,
  shortWall1,
  shortWall2;

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
  addSounds();

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

  // initalize perlin variables
	date = new Date();
  pn = new Perlin('rnd' + date.getTime());

  // Create 4 walls and add them to the scene 
  // first two instantiated easily
  longWall1 = createWall(height, new CANNON.Vec3(width, 1, height / 2 - planeRad));
  longWall2 = createWall(height, new CANNON.Vec3(0 - planeRad * 2, 1, height / 2 - planeRad));
  shortWall1 = createWall(width, new CANNON.Vec3(width / 2 - planeRad, 1, height), true);
  shortWall2 = createWall(width, new CANNON.Vec3(width / 2 - planeRad, 1, -planeRad * 2), true);
  console.log('created the walls');

  

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

  let loader = new OBJLoader();
  console.log("before callback");
  loader.load("glbs/1408 White Blood Cell.obj", function (object) {
    scene.remove(sphereMesh);
    sphereMesh = object.children[0].clone();
    sphereMesh.geometry.scale(objScale, objScale, objScale);
    sphereMesh.geometry.center();
    sphereMesh.position.set(0, sphereRestHeight + EPS, 0);
    sphereMesh.castShadow = true;
    scene.add(sphereMesh);
  });

  // Add event listeners for health damage.
  sphereBody.addEventListener("collide", function (e) {
    if (e.body.mass == virusMass && health != null) {
      health.takeDamage(30);
    }
  });

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

      // Update walls for Perlin movement 
      updateWall(longWall1);
      // updateWall(farXwall);
      // updateWall(closeZwall);
      // updateWall(farZwall);

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
      state = "menu";
    }
  }
  window.requestAnimationFrame(animate);
}

/***************************************************************************/
/* HELPER FUNCTIONS */

function updateWall(wall) {
  // wall.rotation.y += Math.PI/100;
}

/* 
    Create a wall at the specified position. 
    There is no corresponding CANNON object for the wall
    as we handle collisions manually. 
*/
function createWall(length, position, rotate) {
  // let wallGeometry = new THREE.PlaneBufferGeometry(planeRad * 2, length, 200, 200);
  // let wallTexture = new THREE.PlaneBufferGeometry(length, length, length);
  let wallGeometry = new THREE.PlaneGeometry(planeRad * 2, length, 40, 700);
  // let wallGeometry = new THREE.BoxGeometry(planeRad * 2, planeRad * 2, length);
  
  // Apply Perlin noise
  for (var i = 0, l = wallGeometry.vertices.length; i < l; i++) {
    var vertex = wallGeometry.vertices[i];
    var value = pn.noise(vertex.x , vertex.y , 0);
    vertex.z = value ;
  }

  //ensure light is computed correctly
  wallGeometry.computeFaceNormals();
  wallGeometry.computeVertexNormals();

  let wallMesh = new THREE.Mesh(
    wallGeometry,
    new THREE.MeshLambertMaterial({
      color: 0x8B0000,
      side: THREE.DoubleSide, 
      reflectivity: 0.1
    })
  );

  scene.add(wallMesh);
  wallMesh.position.set(position.x, position.y, position.z);
  wallMesh.rotation.x = -Math.PI / 2;
  if (rotate) { // short wall 
    wallMesh.rotation.z = Math.PI / 2;
    wallMesh.rotation.x += Math.PI / 2;
    if (position.z < height/2) wallMesh.position.set(position.x, position.y, position.z+0.6);
    else wallMesh.position.set(position.x, position.y, position.z-1.0);
  }
  else { // long wall 
    wallMesh.rotation.y += Math.PI / 2;
    if (position.x < width) wallMesh.position.set(position.x+.7, position.y, position.z);
    else wallMesh.position.set(position.x-1.5, position.y, position.z);
  }


  return wallMesh;
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
        if (e.key === "Enter" && state == "menu") {
          console.log("working");
          menu.startGame();
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

function Perlin(seed) {

  // Alea random number generator.
  //----------------------------------------------------------------------------//

  // From http://baagoe.com/en/RandomMusings/javascript/
  function Alea() {
    return (function(args) {
      // Johannes BaagÃ¸e <baagoe@baagoe.com>, 2010
      var s0 = 0;
      var s1 = 0;
      var s2 = 0;
      var c = 1;

      if (args.length == 0) {
        args = [+new Date];
      }
      var mash = Mash();
      s0 = mash(' ');
      s1 = mash(' ');
      s2 = mash(' ');

      for (var i = 0; i < args.length; i++) {
        s0 -= mash(args[i]);
        if (s0 < 0) {
          s0 += 1;
        }
        s1 -= mash(args[i]);
        if (s1 < 0) {
          s1 += 1;
        }
        s2 -= mash(args[i]);
        if (s2 < 0) {
          s2 += 1;
        }
      }
      mash = null;

      var random = function() {
        var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
        s0 = s1;
        s1 = s2;
        return s2 = t - (c = t | 0);
      };
      random.uint32 = function() {
        return random() * 0x100000000; // 2^32
      };
      random.fract53 = function() {
        return random() +
          (random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
      };
      random.version = 'Alea 0.9';
      random.args = args;
      return random;

    }(Array.prototype.slice.call(arguments)));
  };

  // From http://baagoe.com/en/RandomMusings/javascript/
  // Johannes BaagÃ¸e <baagoe@baagoe.com>, 2010
  function Mash() {
    var n = 0xefc8249d;

    var mash = function(data) {
      data = data.toString();
      for (var i = 0; i < data.length; i++) {
        n += data.charCodeAt(i);
        var h = 0.02519603282416938 * n;
        n = h >>> 0;
        h -= n;
        h *= n;
        n = h >>> 0;
        h -= n;
        n += h * 0x100000000; // 2^32
      }
      return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    };

    mash.version = 'Mash 0.9';
    return mash;
  }

  // Simplex perlin noise.
  //----------------------------------------------------------------------------//

  // Ported from Stefan Gustavson's java implementation
  // http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
  // Read Stefan's excellent paper for details on how this code works.
  //
  // Sean McCullough banksean@gmail.com

  /**
   * You can pass in a random number generator object if you like.
   * It is assumed to have a random() method.
   */
  var SimplexNoise = function(r) {
    if (r == undefined) r = Math;
    this.grad3 = [
      [1, 1, 0],
      [-1, 1, 0],
      [1, -1, 0],
      [-1, -1, 0],
      [1, 0, 1],
      [-1, 0, 1],
      [1, 0, -1],
      [-1, 0, -1],
      [0, 1, 1],
      [0, -1, 1],
      [0, 1, -1],
      [0, -1, -1]
    ];
    this.p = [];
    for (var i = 0; i < 256; i++) {
      this.p[i] = Math.floor(r.random() * 256);
    }
    // To remove the need for index wrapping, double the permutation table length
    this.perm = [];
    for (var i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
    }

    // A lookup table to traverse the simplex around a given point in 4D.
    // Details can be found where this table is used, in the 4D noise method.
    this.simplex = [
      [0, 1, 2, 3],
      [0, 1, 3, 2],
      [0, 0, 0, 0],
      [0, 2, 3, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 2, 3, 0],
      [0, 2, 1, 3],
      [0, 0, 0, 0],
      [0, 3, 1, 2],
      [0, 3, 2, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 3, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 2, 0, 3],
      [0, 0, 0, 0],
      [1, 3, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 3, 0, 1],
      [2, 3, 1, 0],
      [1, 0, 2, 3],
      [1, 0, 3, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 3, 1],
      [0, 0, 0, 0],
      [2, 1, 3, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 1, 3],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [3, 0, 1, 2],
      [3, 0, 2, 1],
      [0, 0, 0, 0],
      [3, 1, 2, 0],
      [2, 1, 0, 3],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [3, 1, 0, 2],
      [0, 0, 0, 0],
      [3, 2, 0, 1],
      [3, 2, 1, 0]
    ];
  };

  SimplexNoise.prototype.dot = function(g, x, y) {
    return g[0] * x + g[1] * y;
  };

  SimplexNoise.prototype.noise = function(xin, yin) {
    var n0, n1, n2; // Noise contributions from the three corners
    // Skew the input space to determine which simplex cell we're in
    var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    var s = (xin + yin) * F2; // Hairy factor for 2D
    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    var t = (i + j) * G2;
    var X0 = i - t; // Unskew the cell origin back to (x,y) space
    var Y0 = j - t;
    var x0 = xin - X0; // The x,y distances from the cell origin
    var y0 = yin - Y0;
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
    else {
      i1 = 0;
      j1 = 1;
    } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
    var y2 = y0 - 1.0 + 2.0 * G2;
    // Work out the hashed gradient indices of the three simplex corners
    var ii = i & 255;
    var jj = j & 255;
    var gi0 = this.perm[ii + this.perm[jj]] % 12;
    var gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
    var gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
    // Calculate the contribution from the three corners
    var t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) n0 = 0.0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0); // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) n1 = 0.0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
    }
    var t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) n2 = 0.0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70.0 * (n0 + n1 + n2);
  };

  // 3D simplex noise 
  SimplexNoise.prototype.noise3d = function(xin, yin, zin) {
    var n0, n1, n2, n3; // Noise contributions from the four corners
    // Skew the input space to determine which simplex cell we're in
    var F3 = 1.0 / 3.0;
    var s = (xin + yin + zin) * F3; // Very nice and simple skew factor for 3D
    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var k = Math.floor(zin + s);
    var G3 = 1.0 / 6.0; // Very nice and simple unskew factor, too
    var t = (i + j + k) * G3;
    var X0 = i - t; // Unskew the cell origin back to (x,y,z) space
    var Y0 = j - t;
    var Z0 = k - t;
    var x0 = xin - X0; // The x,y,z distances from the cell origin
    var y0 = yin - Y0;
    var z0 = zin - Z0;
    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.
    var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
    var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } // X Y Z order
      else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } // X Z Y order
      else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } // Z X Y order
    } else { // x0<y0
      if (y0 < z0) {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } // Z Y X order
      else if (x0 < z0) {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } // Y Z X order
      else {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } // Y X Z order
    }
    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.
    var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords
    var y1 = y0 - j1 + G3;
    var z1 = z0 - k1 + G3;
    var x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords
    var y2 = y0 - j2 + 2.0 * G3;
    var z2 = z0 - k2 + 2.0 * G3;
    var x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords
    var y3 = y0 - 1.0 + 3.0 * G3;
    var z3 = z0 - 1.0 + 3.0 * G3;
    // Work out the hashed gradient indices of the four simplex corners
    var ii = i & 255;
    var jj = j & 255;
    var kk = k & 255;
    var gi0 = this.perm[ii + this.perm[jj + this.perm[kk]]] % 12;
    var gi1 = this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] % 12;
    var gi2 = this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] % 12;
    var gi3 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] % 12;
    // Calculate the contribution from the four corners
    var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) n0 = 0.0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0);
    }
    var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) n1 = 0.0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1);
    }
    var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) n2 = 0.0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2, z2);
    }
    var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) n3 = 0.0;
    else {
      t3 *= t3;
      n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to stay just inside [-1,1]
    return 32.0 * (n0 + n1 + n2 + n3);
  };

  // Classic Perlin noise, 3D version 
  //----------------------------------------------------------------------------//

  var ClassicalNoise = function(r) { // Classic Perlin noise in 3D, for comparison 
    if (r == undefined) r = Math;
    this.grad3 = [
      [1, 1, 0],
      [-1, 1, 0],
      [1, -1, 0],
      [-1, -1, 0],
      [1, 0, 1],
      [-1, 0, 1],
      [1, 0, -1],
      [-1, 0, -1],
      [0, 1, 1],
      [0, -1, 1],
      [0, 1, -1],
      [0, -1, -1]
    ];
    this.p = [];
    for (var i = 0; i < 256; i++) {
      this.p[i] = Math.floor(r.random() * 256);
    }
    // To remove the need for index wrapping, double the permutation table length
    this.perm = [];
    for (var i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
    }
  };

  ClassicalNoise.prototype.dot = function(g, x, y, z) {
    return g[0] * x + g[1] * y + g[2] * z;
  };

  ClassicalNoise.prototype.mix = function(a, b, t) {
    return (1.0 - t) * a + t * b;
  };

  ClassicalNoise.prototype.fade = function(t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  };

  ClassicalNoise.prototype.noise = function(x, y, z) {
    // Find unit grid cell containing point
    var X = Math.floor(x);
    var Y = Math.floor(y);
    var Z = Math.floor(z);

    // Get relative xyz coordinates of point within that cell
    x = x - X;
    y = y - Y;
    z = z - Z;

    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255;
    Y = Y & 255;
    Z = Z & 255;

    // Calculate a set of eight hashed gradient indices
    var gi000 = this.perm[X + this.perm[Y + this.perm[Z]]] % 12;
    var gi001 = this.perm[X + this.perm[Y + this.perm[Z + 1]]] % 12;
    var gi010 = this.perm[X + this.perm[Y + 1 + this.perm[Z]]] % 12;
    var gi011 = this.perm[X + this.perm[Y + 1 + this.perm[Z + 1]]] % 12;
    var gi100 = this.perm[X + 1 + this.perm[Y + this.perm[Z]]] % 12;
    var gi101 = this.perm[X + 1 + this.perm[Y + this.perm[Z + 1]]] % 12;
    var gi110 = this.perm[X + 1 + this.perm[Y + 1 + this.perm[Z]]] % 12;
    var gi111 = this.perm[X + 1 + this.perm[Y + 1 + this.perm[Z + 1]]] % 12;

    // The gradients of each corner are now:
    // g000 = grad3[gi000];
    // g001 = grad3[gi001];
    // g010 = grad3[gi010];
    // g011 = grad3[gi011];
    // g100 = grad3[gi100];
    // g101 = grad3[gi101];
    // g110 = grad3[gi110];
    // g111 = grad3[gi111];
    // Calculate noise contributions from each of the eight corners
    var n000 = this.dot(this.grad3[gi000], x, y, z);
    var n100 = this.dot(this.grad3[gi100], x - 1, y, z);
    var n010 = this.dot(this.grad3[gi010], x, y - 1, z);
    var n110 = this.dot(this.grad3[gi110], x - 1, y - 1, z);
    var n001 = this.dot(this.grad3[gi001], x, y, z - 1);
    var n101 = this.dot(this.grad3[gi101], x - 1, y, z - 1);
    var n011 = this.dot(this.grad3[gi011], x, y - 1, z - 1);
    var n111 = this.dot(this.grad3[gi111], x - 1, y - 1, z - 1);
    // Compute the fade curve value for each of x, y, z
    var u = this.fade(x);
    var v = this.fade(y);
    var w = this.fade(z);
    // Interpolate along x the contributions from each of the corners
    var nx00 = this.mix(n000, n100, u);
    var nx01 = this.mix(n001, n101, u);
    var nx10 = this.mix(n010, n110, u);
    var nx11 = this.mix(n011, n111, u);
    // Interpolate the four results along y
    var nxy0 = this.mix(nx00, nx10, v);
    var nxy1 = this.mix(nx01, nx11, v);
    // Interpolate the two last results along z
    var nxyz = this.mix(nxy0, nxy1, w);

    return nxyz;
  };

  //----------------------------------------------------------------------------//

  var rand = {};
  rand.random = new Alea(seed);
  var noise = new ClassicalNoise(rand);

  this.noise = function(x, y, z) {
    return 0.5 * noise.noise(x, y, z) + 0.5;
  }

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
