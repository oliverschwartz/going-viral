import * as APP from "../../app.js";

class Level {
  constructor() {
    this.levelHTML = '<div class="level-text">LEVEL: ' + APP.LEVEL + "</div>";
    this.levelText = null;
    this.prevText = null;
  }

  updateLabel() {
    this.levelHTML = '<div class="level-text">LEVEL: ' + APP.LEVEL + "</div>";
    this.levelText = $(this.levelHTML);
    if (this.prevText) {
      this.prevText.remove();
    }
    this.levelText.appendTo(".level-div");
    this.prevText = this.levelText;
  }
  removeLabel() {
    this.prevText.remove();
  }
}

export default Level;
