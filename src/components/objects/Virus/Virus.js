import { Group, Vector3, DoubleSide, Mesh, SphereGeometry, MeshPhongMaterial, Color } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './virus.gltf';

class Virus extends Group {
    constructor(parent, position, direction) {
        // Call parent Group() constructor
        super();
        this.name = 'virus';

        // Init state
        this.state = {
            gui: parent.state.gui,
            rotate: true,
            position: position,
            prevPosition: position.clone(),
            direction: direction,
            score: 0, // number of tiles colored
            // Define a boolean array to determine where the virus should go. 
            // Each key corresponds to Left,Up,Right,Down.
            keys: [0,0,0,0],
            mesh: undefined,
            physical: undefined,  
            canMove: true,
            freeze: undefined
        };
        
        // Define the sphere. 
        const geo = new  SphereGeometry(1, 32, 32); 
        const mat = new MeshPhongMaterial({
            color: new Color(0xffffff * Math.random()), 
            flatShading: false,
            wireframe: true,
        });
        this.state.mesh = new Mesh(geo, mat);
        this.add(this.state.mesh);
        this.state.mesh.position.set(this.state.position.x,this.state.position.y,this.state.position.z);

        // Register event listeners. 
        function addKeyDownHandler(elem, keys) {
            elem.addEventListener('keydown', function(e) {
                if (e.key === "ArrowUp") {
                    keys[0] = 1;
                }
                if (e.key === "ArrowDown") {
                    keys[1] = 1;
                }
                if (e.key === "ArrowRight") {
                    keys[2] = 1;
                }
                if (e.key === "ArrowLeft") {
                    keys[3] = 1;
                }
            }, false);
        }
        function addKeyUpHandler(elem, keys) {
            elem.addEventListener('keyup', function(e) {
                if (e.key === "ArrowUp") {
                    keys[0] = 0;
                }
                if (e.key === "ArrowDown") {
                    keys[1] = 0;
                }
                if (e.key === "ArrowRight") {
                    keys[2] = 0;
                }
                if (e.key === "ArrowLeft") {
                    keys[3] = 0;
                }
            }, false);
        }
        addKeyDownHandler(window, this.state.keys);
        addKeyUpHandler(window, this.state.keys);

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    update(timeStamp) {
        if (this.state.rotate) {
            this.children[0].rotation.x += 0.01;
            this.children[0].rotation.y += 0.01
        }

        let currPosition = this.children[0].position; 
        let target = new Vector3( 0, 0, -1 );
        target.applyQuaternion( this.parent.camera.quaternion );

        for (let i = 0; i < this.state.keys.length; i++) {
            if (this.state.keys[i] === 1) {
                switch (i) {
                    case 0:
                        this.children[0].position.x -= 0.1;
                        this.parent.camera.position.x -= 0.1;
                        this.parent.camera.lookAt(this.children[0].position);
                        break;
                    case 1:
                        this.children[0].position.x += 0.1;
                        this.parent.camera.position.x += 0.1;
                        this.parent.camera.lookAt(this.children[0].position);
                        break;
                    case 2:
                        this.children[0].position.z -= 0.1;
                        this.parent.camera.position.z -= 0.1;
                        this.parent.camera.lookAt(this.children[0].position);
                        break;
                    case 3:
                        this.children[0].position.z += 0.1;
                        this.parent.camera.position.z += 0.1;
                        this.parent.camera.lookAt(this.children[0].position);
                        break;
                }
            }
        }
    }
}

export default Virus;
