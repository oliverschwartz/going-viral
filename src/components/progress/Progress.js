import * as APP from "../../app.js";

class Progress {
  constructor() {
    this.maxPosition = APP.height;
    this.currPosition = 0;
    this.state = "";
  }

  updateBar(position) {
    this.currPosition = position;
    let r = (100 * this.currPosition) / this.maxPosition;
    $(".progress-bar-circle").css("left", r + "%");
    if (r > 90) {
      $(".win").css("display", "flex");
      this.state = "win";
    } else if (r < 1) {
      $(".win").css("display", "none");
    }
  }
}

export default Progress;
