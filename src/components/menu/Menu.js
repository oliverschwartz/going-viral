import * as APP from "../../app.js";

class Menu {
    constructor() {
        document.getElementById("start").onclick = function () {
            document.getElementById("menu").style.display = "none";
        }
    }
}

export default Menu;
