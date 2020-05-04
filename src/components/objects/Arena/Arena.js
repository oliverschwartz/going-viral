import {
  Color,
  Group,
  MeshPhongMaterial,
  BoxGeometry,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  DoubleSide,
} from "three";

class Arena extends Group {
  constructor(parent) {
    // Call parent Group() constructor
    super();
    this.name = "arena";

    // Inherit a series of colours from the GameScene.
    const colors = parent.Colors;

    // Hard-code some parameters of the arena.
    this.parent = parent;
    this.height = this.parent.height;
    this.width = this.parent.width;
    this.wallSize = this.parent.wallSize;
    this.wallHeight = this.parent.wallHeight;
    this.tileSize = this.parent.tileSize;

    this.tileColors = [];
    this.floor = [];

    // Define the geometry of a floor tile.
    const geo = new BoxGeometry(this.tileSize, this.tileSize, this.tileSize);

    // Create all the floor tiles (BoxGeometries).
    for (let x = -this.width / 2; x < this.width / 2; x += this.tileSize) {
      for (let z = -this.height / 2; z < this.height / 2; z += this.tileSize) {
        // Create the box.
        const mat = new MeshPhongMaterial({
          color: new Color(0xffffff),
          flatShading: true,
        });
        const mesh = new Mesh(geo, mat);

        // Update its position; add it to the scene.
        mesh.position.set(x, -this.tileSize / 2, z);
        this.floor.push(mesh);
        // this.tileColors.push(0); // What is this line doing?
        this.add(mesh);
      }
    }

    /*
      Squares go from 
      - x in [-this.width / 2, this.width / 2 - this.tileSize]
      - z in [-this.height / 2, this.height / 2 - this.tileSize]

      We want the wall coordinates to be: 
      - pair 1: x = -this.width / 2 - this.tileSize and this.width / 2, z in [-this.height / 2 - this.tileSize, this.height / 2]
      - pair 2: z = -this.height / 2 - this.tileSize and this.height / 2, x in [-this.width / 2, this.width / 2 - this.tileSize]
    */

    // Create all the wall tiles along one pair of sides.
    let x = -this.width / 2 - this.tileSize;
    for (
      let z = -this.height / 2 - this.tileSize;
      z <= this.height / 2;
      z += this.tileSize
    ) {
      const mat = new MeshPhongMaterial({
        color: new Color(0xffffff * Math.random()),
        flatShading: true,
      });
      const mesh = new Mesh(geo, mat);
      let clone = mesh.clone();
      mesh.position.set(x, this.tileSize / 2, z);
      clone.position.set(-x - this.tileSize, this.tileSize / 2, z);
      this.add(mesh, clone);
    }

    // Create all the wall tiles along the remaining pair of sides.
    let z = -this.height / 2 - this.tileSize;
    for (
      let x = -this.width / 2;
      x <= this.width / 2 - this.tileSize;
      x += this.tileSize
    ) {
      const mat = new MeshPhongMaterial({
        color: new Color(0xffffff * Math.random()),
        flatShading: true,
      });
      const mesh = new Mesh(geo, mat);
      let clone = mesh.clone();
      mesh.position.set(x, this.tileSize / 2, z);
      clone.position.set(x, this.tileSize / 2, -z - this.tileSize);
      this.add(mesh, clone);
    }

    parent.addToUpdateList(this);
  }

  index(x, z) {
    let x_index = Math.round((x + this.width / 2) / this.tileSize);
    let z_index = Math.round((z + this.height / 2) / this.tileSize);
    let index = x_index * (this.height / this.tileSize) + z_index;
    return index;
  }

  // update Land to color based on player positions
  update(timeStamp) {
    if (this.parent.virus) {
      let virus_x = this.parent.virus.state.mesh.position.x;
      let virus_z = this.parent.virus.state.mesh.position.z;
      let i = this.index(virus_x, virus_z);
      this.floor[i].material.color = new Color(0x0);
    }
    // if (this.state.bob) {
    //     // Bob back and forth
    //     this.rotation.z = 0.05 * Math.sin(timeStamp / 300);
    // }
    // if (this.state.twirl > 0) {
    //     // Lazy implementation of twirl
    //     this.state.twirl -= Math.PI / 8;
    //     this.rotation.y += Math.PI / 8;
    // }
    // // Advance tween animations, if any exist
    // TWEEN.update();
  }
}

export default Arena;
