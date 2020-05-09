import * as APP from "../../app.js";

export var newState;
class Menu {
  constructor() {
    $("#instructions_btn").click(function () {
      $("#instruction_menu").css("display", "flex");
    });
    $("#instruction_btn").click(function () {
      $("#instruction_menu").css("display", "none");
    });
    $("#start").click(function (e) {
      $("#menu").css("display", "none");
      newState = 'play';
      // stop event bubbling 
      e.stopImmediatePropagation();
    });
    this.newState = newState;
  }
}

export default Menu;
