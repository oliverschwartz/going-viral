import { Vector3, Group } from "three";

class Ball extends Group {
  constructor() {
    super();
    this.name = "ball";
    console.log("constructed ball");
  }
}

export default Ball;
