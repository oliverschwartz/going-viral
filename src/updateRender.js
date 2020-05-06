import * as APP from "./app.js";

export function updateCellsForParticle(particle) {
  // Count scores
  if (particle.position.x >= APP.width - APP.getBoxRad()) return;
  if (particle.position.z >= APP.height - APP.getBoxRad()) return;
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
  let boxRad = APP.getBoxRad();
  let index =
    Math.round(x / (boxRad * 2)) * (APP.height / (boxRad * 2)) +
    Math.round(z / (boxRad * 2));
  //   let x_index = Math.round((x + APP.width / 2) / boxRad);
  //   let z_index = Math.round((z + APP.height / 2) / boxRad);
  //   let index = x_index * (APP.height / boxRad) + z_index;
  return index;
}
