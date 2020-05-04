import { Group, Vector3, DoubleSide, Mesh, SphereGeometry, MeshPhongMaterial, Color, Euler } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './virus.gltf';

class Virus extends Group {
    constructor(parent, pos, direction) {
        // Call parent Group() constructor
        super();
        this.name = 'virus';

        console.log("IN CONSTRUCTOR")

        // Init state
        this.state = {
            gui: parent.state.gui,
            rotate: true,
            prevPosition: pos.clone(),
            direction: direction,
            score: 0, // number of tiles colored
            // Define a boolean array to determine where the virus should go. 
            // Each key corresponds to Left,Up,Right,Down.
            keys: [0, 0, 0, 0],
            mesh: undefined,
            mass: 1, 
            netForce: new Vector3(-1, 0, 0),
            physical: undefined,
            canMove: true,
            freeze: undefined
        };

        // Define the sphere. 
        const geo = new SphereGeometry(1, 32, 32);
        const mat = new MeshPhongMaterial({
            color: new Color(0xffffff * Math.random()),
            flatShading: false,
            wireframe: true,
        });
        this.state.mesh = new Mesh(geo, mat);
        this.add(this.state.mesh);
        this.state.mesh.position.set(pos.x, pos.y, pos.z);
        this.state.position = this.state.mesh.position; 

        console.log(this.state.position);

        // Register event listeners. 
        function addKeyDownHandler(elem, keys) { // If a key is released. 
            elem.addEventListener('keydown', function (e) {
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
        function addKeyUpHandler(elem, keys) { // If a key is pressed. 
            elem.addEventListener('keyup', function (e) {
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

        // Define some movement constants. 
        const speed = 0.5;
        const angle = 3 * Math.PI / 180;

        // Iterate over the arrow keys. If any are pressed, either rotate the camera or move the virus. 
        for (let i = 0; i < this.state.keys.length; i++) {
            if (this.state.keys[i] === 1) {
                let x, z, cameraX, cameraZ, force;
                switch (i) {
                    case 0: // Forward - move the object. 
                        // this.state.mesh.position.add(this.state.direction.clone().multiplyScalar(speed));
                        // this.parent.camera.position.add(this.state.direction.clone().multiplyScalar(speed));
                        cameraX = this.state.position.x - this.parent.camera.position.x; 
                        cameraZ = this.state.position.z - this.parent.camera.position.z;
                        force = new Vector3(cameraX, 0, cameraZ).normalize(); 
                        force.multiplyScalar(speed);
                        this.state.netForce.add(force);
                        break;

                    case 1: // Backward - move the object.
                        // this.state.mesh.position.add(this.state.direction.clone().multiplyScalar(-speed));
                        // this.parent.camera.position.add(this.state.direction.clone().multiplyScalar(-speed));
                        // break;
                        cameraX = this.state.position.x - this.parent.camera.position.x; 
                        cameraZ = this.state.position.z - this.parent.camera.position.z; 
                        force = new Vector3(cameraX, 0, cameraZ).normalize().applyEuler(new Euler(0, Math.PI, 0));
                        force.multiplyScalar(speed); 
                        this.state.netForce.add(force);
                        break; //cameraX, cameraZ, force

                    case 2: // Right - rotate the camera. 
                        this.state.netForce.applyEuler(new Euler(0, -angle, 0));
                        x = this.parent.camera.position.x - this.state.mesh.position.x;
                        z = this.parent.camera.position.z - this.state.mesh.position.z;
                        this.parent.camera.position.x = x * Math.cos(angle) - z * Math.sin(angle) + this.state.mesh.position.x;
                        this.parent.camera.position.z = z * Math.cos(angle) + x * Math.sin(angle) + this.state.mesh.position.z;
                        break;

                    case 3: // Left - rotate the camera. 
                        this.state.netForce.applyEuler(new Euler(0, angle, 0));
                        x = this.parent.camera.position.x - this.state.mesh.position.x;
                        z = this.parent.camera.position.z - this.state.mesh.position.z;
                        this.parent.camera.position.x = x * Math.cos(-angle) - z * Math.sin(-angle) + this.state.mesh.position.x;
                        this.parent.camera.position.z = z * Math.cos(-angle) + x * Math.sin(-angle) + this.state.mesh.position.z;
                        break;

                }
            }
        }



        // Update the position of the virus. 
        let prevPosition = this.state.prevPosition.clone(); 
        let currPosition = this.state.position.clone();
        this.state.prevPosition = this.state.position.clone(); 
        let accel = this.state.netForce.clone().multiplyScalar(1 / this.state.mass);
        let deltaT = 0.1;
        let damping = 0.1;
        this.state.position.add(currPosition.sub(prevPosition).multiplyScalar(1 - damping)).add(accel.multiplyScalar(deltaT ** 2)); 
        this.state.mesh.position.set(this.state.position.clone().x, this.state.position.clone().y, this.state.position.clone().z);

        this.state.direction = this.state.position.clone().sub(this.state.prevPosition.clone()).normalize(); 


        // Add friction proportional to velocity. 

        // Update the position of the camera.
        let translation = this.state.position.clone().sub(this.state.prevPosition.clone())
        this.parent.camera.position.add(translation);


        // Update where the camera is looking. 
        this.parent.camera.lookAt(this.state.mesh.position.clone())
    }
}

export default Virus;
