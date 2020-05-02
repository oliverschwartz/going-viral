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
        
        const geo = new  SphereGeometry(1, 32, 32); 
        const mat = new MeshPhongMaterial({
            color: new Color(0xffffff * Math.random()), 
            flatShading: false,
            wireframe: true,
        });
        const mesh = new Mesh(geo, mat);
        this.add(mesh);
        mesh.position.set(0,2,0);

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    update(timeStamp) {
        if (this.state.rotate) {
            // Bob back and forth
            this.children[0].rotation.x += 0.01;
            this.children[0].rotation.y += 0.01
        }
    }
}

export default Virus;
