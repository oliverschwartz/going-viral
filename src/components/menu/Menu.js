import * as APP from "../../app.js";

class Menu {
  constructor() {
    document.getElementById("start").onclick = function () {
      document.getElementById("menu").style.display = "none";
    };
    document.getElementById("instructions_btn").onclick = function () {
      document.getElementById("instruction_menu").style.display = "flex";
    };
    document.getElementById("instruction_btn").onclick = function () {
      console.log("click");
      document.getElementById("instruction_menu").style.display = "none";
    };
  }
}

export default Menu;
