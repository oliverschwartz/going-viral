export var newState;
const gameoverTitle = $('<div class="gameover-title">GAME OVER</div>');
const gameoverText = $(
  '<div class="gameover-text">Press "r" to start again.</div>'
);
const winTitle = $('<div class="win-title">YOU WIN!</div>');
const winText = $(
  '<div class="win-text">Great work mate! Press "L" to move to the next level.</div>'
);

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
    gameoverTitle.appendTo(".gameover");
    gameoverText.appendTo(".gameover");
  }

  clearGameover() {
    gameoverTitle.remove();
    gameoverText.remove();
  }

  showWin() {
    winTitle.appendTo(".win");
    winText.appendTo(".win");
  }

  clearWin() {
    winTitle.remove();
    winText.remove();
  }
}

export default Menu;
