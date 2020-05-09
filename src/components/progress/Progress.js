import * as APP from "../../app.js";

class Progress {
  constructor() {
    this.maxPosition = APP.height;
    this.currPosition = 0;
  }

  updateBar(position) {
    this.currPosition = position;
    let r = (100 * this.currPosition) / this.maxPosition;
    $(".progress-bar-circle").css("left", r + "%");
    if (r > 99) {
      $(".win").css("display", "flex");
    }
  }
}

export default Progress;
