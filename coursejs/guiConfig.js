"use strict";

var GuiConfig = GuiConfig || {};

GuiConfig.textureNames = [
  "tbd",
];

GuiConfig.dropdownOptions = {};

GuiConfig.dropdownOptions.textures = [
  "circuit_pattern.png",
];

GuiConfig.dropdownOptions.objects = [
  "None",
  "Sphere",
  "Box",
];

GuiConfig.dropdownOptions.pinned = [
  "None",
  "Corners",
  "OneEdge",
  "TwoEdges",
  "FourEdges",
  "Random",
];

// Each entry of GuiConfig.defs will have one Gui element created for it.
/* Parameters are as follows:
    - folderName: what folder to place this entry in
    - name: text to display as a label for this GUI element
    - param: name of the field of SceneParams to be mutated
    - range: [min, max, step] for numerical-valued fields
    - onChange: a function f(newValue) that applies the results of this
                variable having changed
    - type: optionally a type hint to indicate the type of value being selected
            ("color", "string", "num", "boolean")
*/
GuiConfig.defs = [
  /***************************************************
   *                Top level
   ***************************************************/
  {
    name: "Cloth Size",
    param: "fabricLength",
    range: [200, 1000, 20],
    onChange: Sim.restartCloth,
  },
  {
    name: "Wireframe",
    param: "wireframe",
    onChange: Scene.showWireframe,
  },
  {
    name: "auto rotate",
    param: "rotate",
  },
  /***************************************************
   *             Forces folder
   ***************************************************/
  {
   folderName: "Forces",
   name: "gravity",
   param: "gravity",
  },
  {
    folderName: "Forces",
    name: "wind",
    param: "wind",
  },
  {
    folderName: "Forces",
    name: "wind strength",
    param: "windStrength",
    range: [0,50,0.1],
  },
  {
    folderName: "Forces",
    name: "rain",
    param: "rain",
  },
  {
    folderName: "Forces",
    name: "rain strength",
    param: "rainStrength",
    range: [0,50,0.1],
  },
  {
    folderName: "Forces",
    name: "rain rate",
    param: "rainRate",
    range: [0,50,1],
  },
  {
    folderName: "Forces",
    name: "custom",
    param: "customForce",
  },
  {
    folderName: "Forces",
    name: "custom strength",
    param: "customFStrength",
    range: [0,50,0.1],
  },
  {
    folderName: "Forces",
    name: "custom rate",
    param: "customFRate",
    range: [0,50,1],
  },
  /***************************************************
   *             Scene folder
   ***************************************************/
  {
    folderName: "Scene",
    name: "object",
    param: "object",
    dropdownOptions: GuiConfig.dropdownOptions.objects,
    defaultOption: GuiConfig.dropdownOptions.objects[0],
    onChange: Sim.placeObject,
  },
  {
    folderName: "Scene",
    name: "friction",
    param: "friction",
    range: [0,1,0.001],
  },
  {
    folderName: "Scene",
    name: "moving sphere",
    param: "movingSphere",
  },
  {
    folderName: "Scene",
    name: "pinned",
    param: "pinned",
    dropdownOptions: GuiConfig.dropdownOptions.pinned,
    defaultOption: GuiConfig.dropdownOptions.pinned[1],
    onChange: Sim.pinCloth,
  },

  /***************************************************
   *             Behavior folder
   ***************************************************/
  {
    folderName: "Behavior",
    name: "structural",
    param: "structuralSprings",
    onChange: Sim.restartCloth,
  },
  {
    folderName: "Behavior",
    name: "shear",
    param: "shearSprings",
    onChange: Sim.restartCloth,
  },
  {
    folderName: "Behavior",
    name: "bending",
    param: "bendingSprings",
    onChange: Sim.restartCloth,
  },
  {
    folderName: "Behavior",
    name: "show constraints",
    param: "showConstraints",
    onChange: Scene.update,
  },
  {
    folderName: "Behavior",
    name: "NoSelfIntersect",
    param: "avoidClothSelfIntersection",
  },
  {
   folderName: "Behavior",
   name: "wave",
   param: "wave",
   onChange: Scene.update,
  },
  {
   folderName: "Behavior",
   name: "wave amplitude",
   param: "waveAmp",
   range: [0,100,1],
  },
  {
   folderName: "Behavior",
   name: "wave frequency",
   param: "waveFreq",
   range: [0.5,50,0.5],
  },
  /***************************************************
   *             Appearance folder
   ***************************************************/
   {
     folderName: "Appearance",
     name: "cloth color",
     param: "clothColor",
     type: "color",
     onChange: Scene.update,
   },
   {
     folderName: "Appearance",
     name: "cloth reflection",
     param: "clothSpecular",
     type: "color",
     onChange: Scene.update,
   },
   {
     folderName: "Appearance",
     name: "ground color",
     param: "groundColor",
     type: "color",
     onChange: Scene.update,
   },
   {
     folderName: "Appearance",
     name: "ground emission",
     param: "groundEmissive",
     type: "color",
     onChange: Scene.update,
   },
   {
     folderName: "Appearance",
     name: "fog color",
     param: "fogColor",
     type: "color",
     onChange: Scene.update,
   },
   {
     folderName: "Appearance",
     name: "cloth texture?",
     param: "showClothTexture",
     onChange: Scene.update,
   },
   {
     folderName: "Appearance",
     name: "cloth img",
     param: "clothTexture",
     onChange: Scene.update,
   },
   {
     folderName: "Appearance",
     name: "ground texture?",
     param: "showGroundTexture",
     onChange: Scene.update,
   },
   {
     folderName: "Appearance",
     name: "ground img",
     param: "groundTexture",
     onChange: Scene.update,
   },
   /***************************************************
    *             Top level
    ***************************************************/
   {
     name: "Restart simulation",
     param: "restartCloth",
     onClick: Sim.restartCloth,
   },
   {
     name: "Restore defaults",
     param: "restoreDefaults",
     onClick: Params.restoreDefaults,
   }
 ];
