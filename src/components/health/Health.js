import * as APP from "../../app.js";

class Health {
  constructor() {
    this.maxHealth = 500;
    this.curHealth = this.maxHealth;
    $(".health-bar-text").html("100%");
    $(".health-bar").css({
      width: "100%",
    });
  }

  takeDamage(damage) {
    if (!APP.damageSound.isPlaying)
      APP.damageSound.play();
    $(".health-bar-red, .health-bar").stop();
    this.curHealth = this.curHealth - damage;
    if (this.curHealth < 0) {
      this.curHealth = 0;
    } else {
      $(".message-box").html("You took " + damage + " points of damage!");
    }
    this.applyChange();
  }

  addHealth(heal) {
    if (this.curHealth == this.maxHealth) {
    } else {
      $(".health-bar-red, .health-bar-blue, .health-bar").stop();
      this.curHealth = this.curHealth + heal;
      if (this.curHealth > this.maxHealth) {
        this.curHealth = this.maxHealth;
      }
      this.applyChange();
    }
  }

  applyChange() {
    let a = this.curHealth * (100 / this.maxHealth);
    $(".health-bar-text").html(Math.round(a) + "%");
    $(".health-bar-red").animate(
      {
        width: a + "%",
      },
      700
    );
    $(".health-bar").animate(
      {
        width: a + "%",
      },
      500
    );
    $(".health-bar-blue").animate(
      {
        width: a + "%",
      },
      300
    );
    $(".total").html(this.curHealth + "/" + this.maxHealth);
  }

  restart() {
    //Was going to have a game over/restart function here.
    $(".health-bar-red, .health-bar");
    $(".message-box").html("You've been knocked down! Things are looking bad.");
  }
}

export default Health;
