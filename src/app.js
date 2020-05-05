import * as THREE from "three";
import * as CANNON from "cannon";
import { BasicLights } from "lights";

/***************************************************************************/

// Constants and variables.
const dt = 1 / 60;
const EPS = 0.02;
const impact = 10 ** -2;
const width = 20;
const height = 20;
const camDistXZ = 15;
const camHeight = 10;
const angle = (3 * Math.PI) / 180;
var world;
var controls, renderer, scene, camera;
var boxMeshes = [],
    boxBodies = [],
    boxRad,
    sphereMesh,
    sphereBody,
    sphereRad,
    sphereDir;
var keys = [0, 0, 0, 0];

/***************************************************************************/

initCannon();
init();
animate();

/***************************************************************************/

function initCannon() {
    world = new CANNON.World();
    world.gravity.set(0, -9.8, 0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // Create a plane
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({ mass: 0, linearDamping: 0.1 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(
        new CANNON.Vec3(1, 0, 0),
        -Math.PI / 2
    );
    world.addBody(groundBody);
}

function init() {
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
    scene.background = new THREE.Color(0x7ec0ee);

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

    // Make the sphere slippery.
    let groundMaterial = new CANNON.Material("groundMaterial");
    let slipperyMaterial = new CANNON.Material("slipperyMaterial");
    let ground_slippery_cm = new CANNON.ContactMaterial(
        groundMaterial,
        slipperyMaterial,
        {
            friction: 0,
            restitution: 0.3,
            contactEquationStiffness: 1e8,
            contactEquationRelaxation: 3,
            frictionEquationStiffness: 1e8,
            frictionEquationRegularizationTime: 3,
        }
    );
    world.addContactMaterial(ground_slippery_cm);

    // Add boxes on top of the plane.
    boxRad = 1;
    let halfExtents = new CANNON.Vec3(boxRad, boxRad, boxRad);
    let boxShape = new CANNON.Box(halfExtents);
    let boxGeometry = new THREE.BoxGeometry(boxRad * 2, boxRad * 2, boxRad * 2);
    for (let i = -width / 2 + boxRad; i < width / 2; i += boxRad * 2) {
        for (let j = -height / 2 + boxRad; j < height / 2; j += boxRad * 2) {
            let x = i;
            let y = boxRad;
            let z = j;
            let boxBody = new CANNON.Body({
                mass: 5,
                linearDamping: 0.1,
                material: groundMaterial,
            });
            boxBody.addShape(boxShape);
            let boxMesh = new THREE.Mesh(
                boxGeometry,
                new THREE.MeshLambertMaterial({
                    color: 0xffffff * Math.random(),
                })
            );
            world.addBody(boxBody);
            scene.add(boxMesh);
            boxBody.position.set(x, y, z);
            boxMesh.position.set(x, y, z);
            boxMesh.castShadow = true;
            boxMesh.receiveShadow = true;
            boxBodies.push(boxBody);
            boxMeshes.push(boxMesh);
        }
    }

    // Create some walls.
    createWall(height, new CANNON.Vec3(width / 2 + boxRad, 3, 0));
    createWall(height, new CANNON.Vec3(-width / 2 - boxRad, 3, 0));
    createWall(width, new CANNON.Vec3(0, 3, height / 2 + boxRad), true);
    createWall(width, new CANNON.Vec3(0, 3, -height / 2 - boxRad), true);

    // Create a sphere.
    sphereRad = 0.5;
    sphereDir = new THREE.Vector3(1, 0, 0);
    let sphereShape = new CANNON.Sphere(sphereRad);
    sphereBody = new CANNON.Body({
        mass: 1,
        linearDamping: 0.5,
        angularDamping: 0.5,
        material: slipperyMaterial,
    });
    sphereBody.addShape(sphereShape);
    world.add(sphereBody);
    sphereMesh = new THREE.Mesh(
        new THREE.SphereGeometry(sphereRad, 100, 100),
        new THREE.MeshPhongMaterial({ color: 0x1244fe })
    );
    scene.add(sphereMesh);
    sphereBody.position.set(0, 5, 0);
    sphereMesh.position.set(0, 5, 0);
}

function createWall(length, position, rotate) {
    let wallGeometry = new THREE.BoxGeometry(boxRad * 2, boxRad * 2, length);
    let wallMesh = new THREE.Mesh(
        wallGeometry,
        new THREE.MeshLambertMaterial({
            color: 0x0,
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
    camera.position.set(destination.x, camHeight, destination.z);
    camera.lookAt(sphereMesh.position);
}

function handleWallCollisions() {
    let velocity = sphereBody.velocity.clone();

    // +x wall
    if (sphereBody.position.x + EPS >= width / 2) {
        sphereBody.position.x = width / 2 - EPS;
        sphereBody.velocity = calculateVelocity(
            new CANNON.Vec3(1, 0, 0),
            velocity
        );
    }
    // -x wall
    if (sphereBody.position.x - EPS <= -width / 2) {
        sphereBody.position.x = -width / 2 + EPS;
        sphereBody.velocity = calculateVelocity(
            new CANNON.Vec3(1, 0, 0),
            velocity
        );
    }
    // +z wall
    if (sphereBody.position.z + EPS >= height / 2) {
        sphereBody.position.z = height / 2 - EPS;
        sphereBody.velocity = calculateVelocity(
            new CANNON.Vec3(0, 0, 1),
            velocity
        );
    }
    // -z wall
    if (sphereBody.position.z - EPS <= -height / 2) {
        sphereBody.position.z = -height / 2 + EPS;
        sphereBody.velocity = calculateVelocity(
            new CANNON.Vec3(0, 0, -1),
            velocity
        );
    }
}

function calculateVelocity(normal, velocity) {
    let dot = normal.dot(velocity.clone());
    let c = normal.clone().scale(2 * dot);
    return velocity.clone().vsub(c).scale(0.8);
}

function applyImpluses() {
    let impulseVec = new CANNON.Vec3(sphereDir.x, 0, sphereDir.z);
    impulseVec.scale(impact);

    for (let i = 0; i < keys.length; i++) {
        if (keys[i] == 1) {
            switch (i) {
                case 0: // Apply forward impulse.
                    sphereBody.applyImpulse(impulseVec, sphereBody.position);
                    break;
                case 1: // Apply backward impulse.
                    sphereBody.applyImpulse(
                        impulseVec.negate(),
                        sphereBody.position
                    );
                    break;
                case 2: // Right.
                    sphereDir.applyEuler(new THREE.Euler(0, -angle, 0));
                    focusCamera();
                    break;
                case 3: // Left.
                    sphereDir.applyEuler(new THREE.Euler(0, angle, 0));
                    focusCamera();
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
            },
            false
        );
    })();
}

function animate() {
    window.requestAnimationFrame(animate);
    world.step(dt);

    // Check for user input.
    applyImpluses();

    // Update the camera position.
    focusCamera();

    // Handle wall collisions.
    handleWallCollisions();

    // Update sphere position.
    sphereMesh.position.copy(sphereBody.position);
    sphereMesh.quaternion.copy(sphereBody.quaternion);

    renderer.render(scene, camera);
}
