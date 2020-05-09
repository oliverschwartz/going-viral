import * as APP from "./app.js";

export function updateCellsForParticle(particle) {
  if (particle.position.z >= APP.height - APP.planeRad) return;
  if (particle.position.x == NaN || particle.position.z == NaN) return;

  let boxMeshes = APP.getFloor();
  let sphereMesh = APP.getSphereMesh();
  var i = index(particle.position.x, particle.position.z);
  // if particle is a white blood cell, update damage
  if (particle === sphereMesh) {
    if (particle.position.y > APP.sphereRestHeight) {
      return;
    }

    const currColor = boxMeshes[i].material.color;
    if (!currColor.equals(APP.planeColor)) {
      // debugger;
      var health = APP.getHealth();
      health.takeDamage(2);
    }
    return;
  }

  // If particle is a virus, update grid to particle's color
  boxMeshes[i].material.color.set(particle.material.color);

  // Callback to change colour back after a few seconds.
  setTimeout(function () {
    boxMeshes[i].material.color.set(0x75100e);
  }, 1000);
}

function index(x, z) {
  let planeRad = APP.planeRad;
  let index =
    Math.round(x / (planeRad * 2)) * (APP.height / (planeRad * 2)) +
    Math.round(z / (planeRad * 2));
  //   let x_index = Math.round((x + APP.width / 2) / planeRad);
  //   let z_index = Math.round((z + APP.height / 2) / planeRad);
  //   let index = x_index * (APP.height / planeRad) + z_index;
  return index;
}
