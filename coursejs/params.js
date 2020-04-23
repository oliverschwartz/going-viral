class Params {

  // Variables for simulation state; can be interactively changed in GUI
  // These are their default values:
  constructor() {
    // ====================================================================
    //                     Physical Constants
    // ====================================================================
    // Damping coefficient for integration
    this.DAMPING = 0.03;

    // Mass of each particle in the cloth
    this.MASS = 0.1;

    // Acceleration due to gravity, scaled up experimentally for effect.
    this.GRAVITY = 9.8 * 140;

    // The timestep (or deltaT used in integration of the equations of motion)
    // Smaller values result in a more stable simulation, but becomes slower.
    // This value was found experimentally to work well in this simulation.
    this.TIMESTEP = 18 / 1000;

    // ====================================================================
    //                   Properties of the cloth
    // ====================================================================
    this.fabricLength = 500;  // sets the length of the cloth in both dimensions

    // Natural resting distances
    // (these are explicitly redefined in cloth.js)
    this.restDistance = 20; // the natural resting distance of adjacent springs
    this.restDistanceB = 2; // natural distance multiplier of 2-apart springs
    this.restDistanceS = Math.sqrt(2); // natural distance multiplier of diagonal springs

    this.xSegs = Math.round(this.fabricLength / this.restDistance); // how many particles wide is the cloth
    this.ySegs = Math.round(this.fabricLength / this.restDistance); // how many particles tall is the cloth

    // Which spring types to use in the cloth
    this.structuralSprings = true;
    this.shearSprings = true;
    this.bendingSprings = true;
    this.showConstraints = false; // should constraints be drawn to screen?
    this.allowShownConstraintMovement = false; // should drawn constraints be locked in place?

    // Which pieces of the cloth are being held up?
    this.pinned = "Corners";

    // ====================================================================
    //            Properties of forces and interactions
    // ====================================================================
    this.gravity = true; // Should gravity be enabled?

    this.wave = false; // Should wave oscillations be enabled?
    this.waveAmp = 50; // Amplitude of wave oscillations (distance in units)
    this.waveFreq = 5; // Frequency of wave oscillations (units are complicated, proportional to Hz)

    this.wind = false; // Should the wind force be enabled?
    this.windStrength = 30; // scalar multiplier for wind force magnitude

    this.rain = false; // Should the rain impulse be enabled?
    this.rainStrength = 6; // scalar multiplier for rain impulse magnitude
    this.rainRate = 5; // Number of droplets per fixed area per time step.

    this.customForce = false; // Should the custom force be enabled?
    this.customFStrength = 10; // custom strength parameter
    this.customFRate = 5; // custom rate parameter

    // Similar to coefficient of friction
    // 0 = frictionless, 1 = cloth sticks in place
    this.friction = 0.9;

    // Flag for whether cloth should avoid self intersections
    this.avoidClothSelfIntersection = false;

    // ====================================================================
    //             Physical properties of scene objects
    // ====================================================================
    // Properties of objects in the scene
    this.object = "None"; // Which object is present in the scene
    this.movingSphere = false; // if the sphere is present, is it moving?

    // Properties of sphere and ground
    this.groundY = -249;
    this.sphereRadius = 125;

    // ====================================================================
    //              Rendering properties of the scene
    // ====================================================================
    this.wireframe = true;  // should meshes render as wireframes?
    this.rotate = false;    // Should the camera auto-rotate?

    this.clothColor = 0xaa2929;     // base color of cloth
    this.clothSpecular = 0x030303;  // reflection color of cloth

    this.groundColor = 0x404761;    // base color of ground
    // this.groundSpecular = 0x404761; // reflection color of ground
    this.groundEmissive = 0x000000; // emission color of ground

    this.fogColor = 0xcce0ff;       // base color of fog

    this.showClothTexture = false;
    this.clothTexture = "maze.png";

    this.showGroundTexture = false;
    this.groundTexture = "grasslight-big.jpg";

    // ====================================================================
    //                Video recording properties
    // ====================================================================
    // Record videos in real time, or slow down rendering?
    // Recording in realtime uses a lower quality (but faster) recording device
    // that can introduce visual artefacts, whereas slowing down rendering
    // takes much longer to record.
    this.recordInRealtime = false;

    // What format should video recordings be exported to?
    this.recordingFormat = "webm"; // "webm", "gif", "png", "jpg"

    // What framerate should video recordings be exported in?
    this.recordingFramerate = 60;
  }

  // (Re)define all the properties that are derived from others
  // To be called on page reload, after URL params are read in.
  update() {
    this.xSegs = Math.round(this.fabricLength / this.restDistance);
    this.ySegs = Math.round(this.fabricLength / this.restDistance);


    // Move these to Scene.update();
    // showWireframe(this.wireframe);
    // placeObject(this.object);
    // pinCloth(this.pinned);

    // clothMaterial.color.setHex(this.clothColor);
    // clothMaterial.specular.setHex(this.clothSpecular);

    // groundMaterial.color.setHex(this.groundColor);
    // groundMaterial.specular.setHex(this.groundSpecular);

    // scene.fog.color.setHex(this.fogColor);
    // renderer.setClearColor(scene.fog.color);

    // restartCloth();
    this.export();
  }

  export() {
    /*
    for (let key in this) {
       window[key] = this[key];
    }
    */
  }
}

var DefaultParams = new Params();
var SceneParams = new Params();

Params.restoreDefaults = function() {
  for (let k of Object.keys(DefaultParams)) {
    this[k] = DefaultParams[k];
  }
  Params.storeToURL();
  Gui.refreshValues();
  Scene.update();
  Sim.update();
  Sim.restartCloth();
}

// https://html-online.com/articles/get-url-parameters-javascript/
Params.getURLParams = function() {
  let vars = {};
  let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
  });
  return vars;
}

// gets rid of the ".0000000001" etc when stringifying floats
// from http://stackoverflow.com/questions/1458633/how-to-deal-with-floating-point-number-precision-in-javascript
Params.stripFloatError = function(number) {
  if (number && number.toPrecision) {
    return parseFloat(number.toPrecision(12));
  } else {
    return number;
  }
}

// Find any changes to the URL, and apply those changes to SceneParams
Params.loadFromURL = function() {
  let params = Params.getURLParams();
  for (let key in params) {
    let v = params[key];
    let defaultType = typeof(DefaultParams[key]);
    if (defaultType == "number") {
      v = Number(v);
    } else if (defaultType == "boolean") {
      v = (v == "true");
    }
    SceneParams[key] = v;
  }
}

// URL encode the keys and values in the dictionary
https://stackoverflow.com/questions/7045065/how-do-i-turn-a-javascript-dictionary-into-an-encoded-url-string
Params.urlEncode = function(params) {
  for (let k in params) {
    let v = params[k];
    if (typeof(v) === "number") params[k] = Params.stripFloatError(v);
  }

  let data = Object.entries(params);
  // encode every parameter (unpack list into 2 variables)
  data = data.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  // combine into string
  let query = data.join('&');
  return `?${query}`;
}

// Find any changes to SceneParams, and apply those changes to the URL.
Params.storeToURL = function() {
  let params = {};

  // Find all non-default scene parameters
  for (let key in SceneParams) {
    // Don't try to put functions in the url
    if (typeof(SceneParams[key]) == "function") continue;

    // Don't put derived types in the url
    if (key === "xSegs" || key == "ySegs") continue;

    // Put all other types into the url
    if (SceneParams[key] !== DefaultParams[key]) {
      params[key] = SceneParams[key];
    }
  }

  // Change the URL.
  window.history.pushState("", "", Params.urlEncode(params));
}

// Set all color parameters to ints, converting from hex strings if needed
Params.repairColors = function() {
  for (let def of GuiConfig.defs) {
    if (def.type !== "color") {
      continue;
    }

    let param = def.param;
    let v = SceneParams[param];
    if (typeof(v) == typeof("")) {
      v = v.replace("#", "0x");
      SceneParams[param] = parseInt(v);
    }
  }
}
