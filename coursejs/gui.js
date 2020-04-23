"use strict";

var guiEnabled = true;

var Gui = Gui || {};

Gui.gui = null;

// Create a folder named folderName, or return it if it already exists.
// If no folderNmae specified, return the top level Gui.
Gui.folder = function(folderName) {
  if (folderName === undefined) {
    return Gui.gui;
  }
  let f = Gui.folders[folderName];
  if (f !== undefined) {
    return f;
  }
  f = Gui.gui.addFolder(folderName);
  Gui.folders[folderName] = f;
  return f;
}

// A wrapper function for onchange handlers, to allow some operations
// to take place every time any value is updated.
// Takes in a function f(val), and returns a function f(val).
Gui.onchangeWrapper = function(onchange) {
  let wrapped = function(value) {
    // Before calling the onchange, update all values to ensure self-consistency
    SceneParams.update();

    // Call the original onchange
    if (onchange !== undefined) onchange(value);

    // Afterwards, update URL params
    Params.storeToURL();
  };
  return wrapped;
}

// Add function clickers to the Params obj
Gui.registerOnClicks = function() {
  for (let def of GuiConfig.defs) {
    if (def.onClick === undefined) continue;
    SceneParams[def.param] = def.onClick;
  }
}

Gui.refreshValues = function() {
  let gui = Gui.gui;

  // https://stackoverflow.com/questions/16166440/refresh-dat-gui-with-new-values
  // Update top level
  for (let controller of gui.__controllers) {
      controller.updateDisplay();
  }

  // Update folders
  for (let i = 0; i < Object.keys(gui.__folders).length; i++) {
    let key = Object.keys(gui.__folders)[i];
    for (let j = 0; j < gui.__folders[key].__controllers.length; j++ ) {
        gui.__folders[key].__controllers[j].updateDisplay();
    }
  }
}

// Read the GUI in from the GuiConfig, and initialize all of the fields
Gui.init = function() {
  if (!guiEnabled) return;

  Gui.registerOnClicks();

  Gui.gui = new dat.GUI();
  Gui.folders = {};

  // Load URL options
  Params.loadFromURL();
  SceneParams.update();

  for (let def of GuiConfig.defs) {
    let folder = Gui.folder(def.folderName);

    let el = null;
    // Add color selectors
    if (def.type === "color") {
      el = folder.addColor(SceneParams, def.param);

    // Add list selectors
    } else if (def.dropdownOptions !== undefined) {
      el = folder.add(SceneParams, def.param, def.dropdownOptions);

    // Add other selectors (num, bool)
    } else {
      let range = def.range;
      let min  = (range !== undefined && range.length >= 1) ? range[0] : undefined;
      let max  = (range !== undefined && range.length >= 2) ? range[1] : undefined;
      let step = (range !== undefined && range.length >= 3) ? range[2] : undefined;

      el = folder.add(SceneParams, def.param, min, max);
      if (step !== undefined) el = el.step(step);
    }

    if (def.name !== undefined)     el = el.name(def.name);
    el = el.onChange(Gui.onchangeWrapper(def.onChange));
  }
}
