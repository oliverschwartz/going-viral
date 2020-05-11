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
      newState = "play";
      // stop event bubbling
      e.stopImmediatePropagation();
    });
    this.newState = newState;
  }

  startGame() {
    $("#menu").css("display", "none");
    newState = "play";
  }

  showGameover() {
    $(".gameover").css("display", "flex");
  }

  clearGameover() {
    $(".gameover").css("display", "none");
  }

  showWin() {
    $(".win").css("display", "flex");
  }

  clearWin() {
    $(".win").css("display", "none");
  }
}

export default Menu;
