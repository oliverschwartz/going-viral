import * as APP from "../../app.js";

class Progress {
  constructor() {
    this.maxPosition = APP.height;
    this.currPosition = 0;
    this.state = "";
    this.r = 0;
  }

  updateBar(position) {
    this.currPosition = position;
    let r = (100 * this.currPosition) / this.maxPosition;
    $(".progress-bar-circle").css("left", r + "%");
    this.r = r;
  }
}

export default Progress;
