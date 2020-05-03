// seems directly from ColoRing
const Colors = {
  background: 0x000000,
  floor: 0x000000,
  ball1: 0x0055ff,
  ball2: 0xe2598b,
  bomb: 0x15cda8,
  freeze: 0x0075f6,
  cross: 0xff5959,
};

const X_AXIS = new THREE.Vector3(1, 0, 0),
  Y_AXIS = new THREE.Vector3(0, 1, 0),
  Z_AXIS = new THREE.Vector3(0, 0, 1),
  TO_RADIANS = Math.PI / 180,
  time = 31,
  turning = 3.5,
  speed = 8,
  cameraX = 3.5,
  cameraZ = 4,
  ballRadius = 3,
  maxPowers = 5,
  powerProb = 0.975;
