"use strict";

// Particle constructor
function Particle(x, y, z, mass) {
  this.position = new THREE.Vector3(); // position
  this.previous = new THREE.Vector3(); // previous
  this.original = new THREE.Vector3(); // original
  initParameterizedPosition(x, y, this.position);
  initParameterizedPosition(x, y, this.previous);
  initParameterizedPosition(x, y, this.original);

  this.netForce = new THREE.Vector3(); // net force acting on particle
  this.mass = mass; // mass of the particle
  this.correction = new THREE.Vector3(); // offset to apply to enforce constraints
}

// Snap a particle back to its original position
Particle.prototype.lockToOriginal = function() {
  this.position.copy(this.original);
  this.previous.copy(this.original);
};

// Snap a particle back to its previous position
Particle.prototype.lock = function() {
  this.position.copy(this.previous);
  this.previous.copy(this.previous);
};

// Add the given force to a particle's total netForce.
// Params:
// * force: THREE.Vector3 - the force to add
Particle.prototype.addForce = function(force) {
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 1 lines of code.
  this.netForce.add(force); 
  // ----------- STUDENT CODE END ------------
};

// Perform Verlet integration on this particle with the provided
// timestep deltaT.
// Params:
// * deltaT: Number - the length of time dt over which to integrate
Particle.prototype.integrate = function(deltaT) {
  const DAMPING = SceneParams.DAMPING;

  // ----------- STUDENT CODE BEGIN ------------
  // You need to:
  // (1) Save the old (i.e. current) position into this.previous.
  let prevprevious = this.previous.clone(); 
  this.previous = this.position;

  // (2) Compute the new position of this particle using Verlet integration,
  //     and store it into this.position.
  this.position = this.previous.clone().add(this.previous.clone().sub(prevprevious).multiplyScalar(1 - DAMPING)); 
  this.position.add((this.netForce.clone().divideScalar(this.mass)).multiplyScalar(deltaT * deltaT)); 

  // (3) Reset the net force acting on the particle (i.e. make it (0, 0, 0) again).
  this.netForce = new THREE.Vector3(0, 0, 0); 

  // ----------- Our reference solution uses 13 lines of code.
  // ----------- STUDENT CODE END ------------
};

// Handle collisions between this Particle and the provided floor.
// Note: the fields of floor are documented for completeness, but you
//       *WILL NOT* need to use all of them.
// Params:
// * floor: An object representing the floor of the scene, with properties:
//    - mesh: THREE.Mesh - the physical representation in the scene
//    - geometry: THREE.PlaneBufferGeometry - the abstract geometric representation
//    - material: THREE.MeshPhongMaterial - material information for lighting
Particle.prototype.handleFloorCollision = function(floor) {
  let floorMesh = floor.mesh;
  let floorPosition = floorMesh.position;
  const EPS = 3;
  // ----------- STUDENT CODE BEGIN ------------
  // Handle collision of this particle with the floor.
  // ----------- Our reference solution uses 4 lines of code.
  if (this.position.y <= floorPosition.y + EPS) {
    this.position.y = floorPosition.y + EPS;
  }

  // ----------- STUDENT CODE END ------------
};

// Handle collisions between this Particle and the provided sphere.
// Note: the fields of sphere are documented for completeness, but you
//       *WILL NOT* need to use all of them.
// Params:
// * sphere: An object representing a sphere in the scene, with properties:
//    - mesh: THREE.Mesh - the physical representation in the scene
//    - geometry: THREE.SphereGeometry - the abstract geometric representation
//    - material: THREE.MeshPhongMaterial - material information for lighting
//    - radius: number - the radius of the sphere
//    - position: THREE.Vector3 - the sphere's position in this frame
//    - prevPosition: THREE.Vector3 - the sphere's position in the previous frame
Particle.prototype.handleSphereCollision = function(sphere) {
  if (sphere.mesh.visible) {
    const friction = SceneParams.friction;
    let spherePosition = sphere.position.clone();
    let prevSpherePosition = sphere.prevPosition.clone();
    let EPS = 5; // empirically determined
    // ----------- STUDENT CODE BEGIN ------------
    // Handle collision of this particle with the sphere.
    // As with the floor, use EPS to prevent clipping.
    let posFriction = new THREE.Vector3();
    let posNoFriction = new THREE.Vector3();
    // ----------- Our reference solution uses 28 lines of code.

    // Check if the particle is inside the sphere. 
    let dist = spherePosition.clone().sub(this.position.clone()).length(); 
    if (dist < sphere.radius + EPS) {
      let normal = this.position.clone().sub(spherePosition).normalize(); 
      posNoFriction = spherePosition.clone().add(normal.clone().multiplyScalar(sphere.radius + EPS)); 
    } else {
      return;
    }

    // If the particle was outside the sphere in the last time step. 
    dist = prevSpherePosition.clone().sub(this.previous).length(); 
    if (dist > sphere.radius + EPS) {
      let movement = spherePosition.clone().sub(prevSpherePosition.clone()); 
      posFriction = this.previous.clone().add(movement); 
      this.position = posFriction.clone().multiplyScalar(friction);
      this.position.add(posNoFriction.clone().multiplyScalar(1 - friction)); 
    } else {
      this.position = posNoFriction.clone();
    }

    // ----------- STUDENT CODE END ------------
  }
};

// Handle collisions between this Particle and the provided axis-aligned box.
// Note: the fields of box are documented for completeness, but you
//       *WILL NOT* need to use all of them.
// Params:
// * box: An object representing an axis-aligned box in the scene, with properties:
//    - mesh: THREE.Mesh - the physical representation in the scene
//    - geometry: THREE.BoxGeometry - the abstract geometric representation
//    - material: THREE.MeshPhongMaterial - material information for lighting
//    - boundingBox: THREE.Box3 - the bounding box of the box in the scene
Particle.prototype.handleBoxCollision = function(box) {
  if (box.mesh.visible) {
    const friction = SceneParams.friction;
    let boundingBox = box.boundingBox.clone();
    const EPS = 20; // empirically determined
    // ----------- STUDENT CODE BEGIN ------------
    // Handle collision of this particle with the axis-aligned box.
    // As before, use EPS to prevent clipping
    let posFriction = new THREE.Vector3();
    let posNoFriction = new THREE.Vector3();
    // ----------- Our reference solution uses 66 lines of code.

    let originalBox = boundingBox.clone()
    boundingBox.expandByScalar(EPS);

    if (boundingBox.containsPoint(this.position)) {
      
      // Calculate the distance of this point to the top face and 4 side faces. 
      let obj = {
        "distTop" : originalBox.max.z - this.position.z,
        "dist1" : this.position.x - originalBox.min.x,
        "dist2" : originalBox.max.y - this.position.y,
        "dist3" : originalBox.max.x - this.position.x,
        "dist4" : this.position.y - originalBox.min.y,
        "distBottom": this.position.z - originalBox.min.z
      }; 

      let keys = Object.keys(obj).sort(function(a, b) {return obj[a] - obj[b]}); 
      let minVal = obj[keys[0]]; 

      posNoFriction = this.position.clone();

      if (obj["distTop"] == minVal) {
        posNoFriction.z = boundingBox.max.z;
      } 
      if (obj["dist1"] == minVal) {
        posNoFriction.x = boundingBox.min.x; 
      }
      if (obj["dist2"] == minVal) {
        posNoFriction.y = boundingBox.max.y;
      }
      if (obj["dist3"] == minVal) {
        posNoFriction.x = boundingBox.max.x; 
      }
      if (obj["dist4"] == minVal) {
        posNoFriction.y = boundingBox.min.y;
      }
      if (obj["distBottom"] == minVal) {
        posNoFriction.z = boundingBox.min.z; 
      }

      if (boundingBox.containsPoint(this.previous)) {
        this.position = posNoFriction.clone();
      } else {
        posFriction = this.previous.clone();
        posFriction = posFriction.multiplyScalar(friction);
        this.position = posFriction.clone().add(posNoFriction.clone().multiplyScalar(1 - friction)); 
      }
    } else {
      return;
    }

    // ----------- STUDENT CODE END ------------
  }
};

// ------------------------ Don't worry about this ---------------------------
// Apply the cached correction vector to this particle's position, and
// then zero out the correction vector.
// Particle.prototype.applyCorrection = function() {
//   this.position.add(this.correction);
//   this.correction.set(0,0,0);
// }
