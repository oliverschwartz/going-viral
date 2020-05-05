/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3, AxesHelper } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GameScene } from "scenes";

// Initialize core ThreeJS components

//  the camera that uses perspective projection
const camera = new PerspectiveCamera();

// the GameScene from gamescene.js with the camera
const scene = new GameScene(camera);

// something that renders the scene
const renderer = new WebGLRenderer({ antialias: true });

// axis object to visualize the 3 axes (Red, Green, Blue)
var axesHelper = new AxesHelper(5);
scene.add(axesHelper);

// Set up camera
camera.position.set(15, 10, 0); // first camera position
camera.lookAt(new Vector3(0, 2, 0)); // camera look at some position
//  what is (0 2 0)? ball? initialPosVirus

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = "block"; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = "hidden"; // Fix scrolling
document.body.appendChild(canvas); // add canvas to document body

// // Set up controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 16;
controls.update();

// Render loop that does the animation
const onAnimationFrameHandler = (timeStamp) => {
  // controls.update();
  renderer.render(scene, camera);
  scene.update && scene.update(timeStamp);
  window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
  const { innerHeight, innerWidth } = window;
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener("resize", windowResizeHandler, false);
