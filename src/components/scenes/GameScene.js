import * as Dat from 'dat.gui';
import { Scene, Color, Vector3 } from 'three';
import { Flower, Arena } from 'objects';
import { BasicLights } from 'lights';

const Colors = {
    background: 0x000000,
    floor: 0x000000,
    ball1: 0x0055ff,
    ball2: 0xe2598b,
    bomb: 0x15cda8,
    freeze: 0x0075f6,
    cross: 0xff5959
}

const   X_AXIS = new Vector3(1, 0, 0),
        Y_AXIS = new Vector3(0, 1, 0),
        Z_AXIS = new Vector3(0, 0, 1),
        TO_RADIANS = Math.PI / 180,
        time = 31,
        turning = 3.5,
        speed = 8,
        cameraX = 3.5,
        cameraZ = 4,
        ballRadius = 3,
        maxPowers = 5,
        powerProb = 0.975;

class GameScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
        };

        this.Colors = Colors;
        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        const arena = new Arena(this);
        const flower = new Flower(this);
        const lights = new BasicLights();
        this.add(arena, flower, lights);

        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default GameScene;
