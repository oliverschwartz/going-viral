var Sim = Sim || {};

var randomPoints;
var cloth;

Sim.init = function() {
  // Points by which cloth will be suspended in "Random" pinning mode.
  randomPoints = [];

  // The cloth object being simulated.
  cloth = new Cloth(SceneParams.xSegs, SceneParams.ySegs, SceneParams.fabricLength);

  Sim.update();
}

// Performs one timestep of the simulation.
// This function is repeatedly called in a loop, and its results are
// then rendered to the screen.
// For more info, see animate() in render.js.
Sim.simulate = function() {
  // If toggled, update sphere position for interactive fun
  if (SceneParams.movingSphere && Scene.sphere.mesh.visible) {
    Sim.updateSpherePosition(Scene.sphere);
  }

  // Apply all relevant forces to the cloth's particles
  cloth.applyForces();

  // For each particle, perform Verlet integration to compute its new position
  cloth.update(SceneParams.TIMESTEP);

  // Handle collisions with other objects in the scene
  cloth.handleCollisions();

  // Handle self-intersections
  if (SceneParams.avoidClothSelfIntersection) {
    cloth.handleSelfIntersections();
  }

  // Apply cloth constraints
  cloth.enforceConstraints();

  // Pin constraints
  Sim.enforcePinConstraints();
}

/****** Helper functions for the simulation ******/
/****** You do not need to know how these work ******/

Sim.randomCoord = function() {
  let randX = Math.round(Math.random() * cloth.w);
  let randY = Math.round(Math.random() * cloth.h);
  return new THREE.Vector2(randX, randY);
}

// update sim
Sim.pinCloth = function(choice) {
  if (choice == "Random" && randomPoints.length == 0) {
    let nPoints = Math.round(Math.random() * 10) + 1;
    randomPoints = [];
    for (r = 0; r < nPoints; r++) {
      randomPoints.push(Sim.randomCoord());
    }
  } else {
    randomPoints = [];
  }
}

Sim.enforcePinConstraints = function() {
  let particles = cloth.particles;
  const w = cloth.w;
  const h = cloth.h;
  // Special case for wave: keep one edge stationary while the opposing one oscillates
  if (SceneParams.wave) {
    for (let i = 0; i <= w; i++) {
      particles[cloth.index(h, i)].lockToOriginal();
      particles[cloth.index(0, i)].lock();
    }
    return;
  }

  if (SceneParams.pinned === "Corners") {
    // could also do particles[blah].lock() which will lock particles to
    // wherever they are, not to their original position
    particles[cloth.index(0, 0)].lockToOriginal();
    particles[cloth.index(w, 0)].lockToOriginal();
    particles[cloth.index(0, h)].lockToOriginal();
    particles[cloth.index(w, h)].lockToOriginal();
  } else if (SceneParams.pinned === "OneEdge") {
    for (let x = 0; x <= w; x++) {
      particles[cloth.index(x, 0)].lockToOriginal();
    }
  } else if (SceneParams.pinned === "TwoEdges") {
    for (let y = 0; y <= h; y++) {
      particles[cloth.index(0, y)].lockToOriginal();
      particles[cloth.index(w, y)].lockToOriginal();
    }
  } else if (SceneParams.pinned === "FourEdges") {
    for (let i = 0; i <= w; i++) {
      particles[cloth.index(0, i)].lockToOriginal();
      particles[cloth.index(w, i)].lockToOriginal();
      particles[cloth.index(i, 0)].lockToOriginal();
      particles[cloth.index(i, h)].lockToOriginal();
    }
  } else if (SceneParams.pinned === "Random") {
    for (let pt of randomPoints) {
      particles[cloth.index(pt.x, pt.y)].lockToOriginal();
    }
  } else if (SceneParams.pinned === "None") {
    return;
  }
}

// restartCloth() is used when we change a fundamental cloth property with a slider
// and therefore need to recreate the cloth object from scratch
Sim.restartCloth = function() {
  // Remove the old cloth from the scene
  Scene.scene.remove(Scene.cloth.mesh);
  if (Scene.cloth.constraints) {
    Scene.scene.remove(Scene.cloth.constraints.group);
  }
  Scene.cloth.constraints = undefined;

  // recreate the logical Cloth data structure
  let xSegs = SceneParams.xSegs;
  let ySegs = SceneParams.ySegs;
  let fabricLength = SceneParams.fabricLength;
  cloth = new Cloth(xSegs, ySegs, fabricLength);

  // recreate cloth geometry
  Scene.cloth.geometry = new THREE.ParametricGeometry(initParameterizedPosition, xSegs, ySegs);
  Scene.cloth.geometry.dynamic = true;

  // recreate cloth mesh
  Scene.cloth.mesh = new THREE.Mesh(Scene.cloth.geometry, Scene.cloth.material);
  Scene.cloth.mesh.position.set(0, 0, 0);
  Scene.cloth.mesh.castShadow = true;

  Scene.scene.add(Scene.cloth.mesh); // adds the cloth to the scene
}

// Update the scene to reflect changes made in the GUI.
Sim.update = function() {
  Sim.placeObject(SceneParams.object);
  Sim.pinCloth(SceneParams.pinned);
}

Sim.placeObject = function(object) {
  if (object == "Sphere" || object == "sphere") {
    Scene.sphere.mesh.visible = true;
    Scene.box.mesh.visible = false;
    Sim.restartCloth();
  } else if (object == "Box" || object == "box") {
    Scene.sphere.mesh.visible = false;
    Scene.box.mesh.visible = true;
    Sim.restartCloth();
  } else if (object == "None" || object == "none") {
    Scene.sphere.mesh.visible = false;
    Scene.box.mesh.visible = false;
  }
}

Sim.updateSpherePosition = function(sphere) {
  sphere.prevPosition.copy(sphere.position);
  sphere.position.y = 50 * Math.sin(time / 600);
  sphere.position.x = 50 * Math.sin(time / 600);
  sphere.position.z = 50 * Math.cos(time / 600);
}
