import { Color, Group, MeshPhongMaterial, BoxGeometry, PlaneGeometry, MeshBasicMaterial, Mesh, DoubleSide } from 'three';

class Arena extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();
        this.name = 'arena';

        // Inherit a series of colours from the GameScene. 
        const colors = parent.Colors;

        // Hard-code some parameters of the arena. 
        this.height = 50;
        this.width = 75;
        this.wallSize = 5; 
        this.wallHeight = 10;
        this.tileSize = 5; 

        this.tileColors = [];
        this.floor = [];

        // Define the geometry of a floor tile.
        const geo = new BoxGeometry(this.tileSize, this.tileSize/2,
            this.tileSize);

        // Create all the floor tiles (BoxGeometries).
        for (let x = -this.width / 2; x <= this.width / 2; x += this.tileSize) {
            for (let z = -this.height / 2; z <= this.height / 2; z += this.tileSize) {
                
                // Create the box. 
                const mat = new MeshPhongMaterial({
                    color: new Color(Math.random() * 0xffffff),
                    flatShading: true
                });
                const mesh = new Mesh(geo, mat);

                // Update its position; add it to the scene. 
                mesh.position.set(x,  -this.tileSize / 4, z);
                this.floor.push(mesh);
                // this.tileColors.push(0); // What is this line doing? 
                this.add(mesh);
            }
        }

        // Create all the wall tiles. 

        
        
    }

    // update Land to color based on player positions 
    update(timeStamp) {
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
