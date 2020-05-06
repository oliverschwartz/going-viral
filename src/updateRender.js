import * as APP from "./app.js";

export function updateCellsForParticle(particle) {
  // Count scores
  if (particle.position.x >= APP.width - APP.getplaneRad()) return;
  if (particle.position.z >= APP.height - APP.getplaneRad()) return;
  let boxMeshes = APP.getFloor();
  var i = index(particle.position.x, particle.position.z);
  const oldColor = boxMeshes[i].material.color;
  // if (oldColor == 1) virus.score--;
  // else if (oldColor == 2) antibody.score--;
  // particle.score++;

  // Updates grid to particle's color

  boxMeshes[i].material.color.set(particle.material.color);
  // arena.tileColors[i] = particle.num;
}

function index(x, z) {
  let planeRad = APP.getplaneRad();
  let index =
    Math.round(x / (planeRad * 2)) * (APP.height / (planeRad * 2)) +
    Math.round(z / (planeRad * 2));
  //   let x_index = Math.round((x + APP.width / 2) / planeRad);
  //   let z_index = Math.round((z + APP.height / 2) / planeRad);
  //   let index = x_index * (APP.height / planeRad) + z_index;
  return index;
}
