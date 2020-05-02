import { Color, Group, MeshPhongMaterial, BoxGeometry, PlaneGeometry, MeshBasicMaterial, Mesh, DoubleSide } from 'three';

class Arena extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        // const loader = new GLTFLoader();
        const colors = parent.Colors;
        this.name = 'arena';

        this.height = 50;
        this.width = 75;
        this.wallSize = 5; 
        this.wallHeight = 10;
        this.tileSize = 5; 

        this.tileColors = [];
        this.floor = [];

        const geo = new BoxGeometry(this.tileSize, this.tileSize/2,
            this.tileSize);

        
        for (let x = -this.width; x < this.width + 1; x += this.tileSize) {
            for (let z = -this.height; z < this.height + 1; z += this.tileSize) {

                const mat = new MeshPhongMaterial({color: new Color(Math.random() * 0xffffff),
                    flatShading: true});
                const mesh = new Mesh(geo, mat);
                mesh.position.set(x,  -this.tileSize / 4, z);
                this.floor.push(mesh);
                this.tileColors.push(0);
                // gameScene.add(mesh);
                this.add(mesh);
            }
        }

        
        
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
