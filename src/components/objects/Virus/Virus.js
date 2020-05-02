import { Group, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DoubleSide, Mesh, SphereGeometry, MeshPhongMaterial, Color } from 'three';
import MODEL from './virus.gltf';

class Virus extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();
        this.name = 'virus';

        // Init state
        this.state = {
            gui: parent.state.gui,
            rotate: true,
        };
        
        // Define the sphere. 
        const geo = new  SphereGeometry(1, 32, 32); 
        const mat = new MeshPhongMaterial({
            color: new Color(0xffffff * Math.random()), 
            flatShading: false,
            wireframe: true,
        });
        const mesh = new Mesh(geo, mat);
        this.add(mesh);
        mesh.position.set(0,2,0);

        // Define a boolean array to determine where the virus should go. 
        // Each key corresponds to Left,Up,Right,Down.
        this.keys = [0,0,0,0];

        // Register event listeners. 
        function addKeyDownHandler(elem, keys) {
            elem.addEventListener('keydown', function(e) {
                if (e.key === "ArrowUp") {
                    keys[0] = 1;
                }
            }, false);
        }
        function addKeyUpHandler(elem, keys) {
            elem.addEventListener('keyup', function(e) {
                if (e.key === "ArrowUp") {
                    keys[0] = 0;
                }
            }, false);
        }
        addKeyDownHandler(window, this.keys);
        addKeyUpHandler(window, this.keys);

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    update(timeStamp) {
        if (this.state.rotate) {
            this.children[0].rotation.x += 0.01;
            this.children[0].rotation.y += 0.01
        }

        let currPosition = this.children[0].position; 

        for (let i = 0; i < this.keys.length; i++) {
            if (this.keys[i] === 1) {
                switch (i) {
                    case 0:
                        this.children[0].position.set(currPosition.x + 0.001, currPosition.y, currPosition.z);
                    case 1:
                        this.children[0].position.z += 1;
                    case 2:
                        this.children[0].position.x -= 1;
                    case 3:
                        this.children[0].position.z -= 1;
                }
            }
        }
    }
}

export default Virus;
