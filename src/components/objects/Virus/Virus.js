import { Group, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DoubleSide, Mesh } from 'three';
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

        // Load object
        const loader = new GLTFLoader();
        loader.load(MODEL, (gltf) => {

            gltf.scene.traverse( function( node ) {
                if ( node instanceof Mesh ) { 
                  node.castShadow = true; 
                  node.material.side = DoubleSide;
                  node.geometry.center();
                  node.rotation.set(0,0,0);
                }
            });

            gltf.scene.rotation.set(0,0,0);

            this.add(gltf.scene);
            // let children = gltf.scene.children; 
            // for (let i = 0; i < children.length; i++) {
                // let child = children[i];
                // this.add(child)
                // child.position.set(0,0,0);
            // }
        });

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    update(timeStamp) {
        if (this.state.rotate) {
            // Bob back and forth
            this.rotation.x += 0.01;
            this.rotation.y += 0.01
        }
    }
}

export default Virus;
