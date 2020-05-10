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
    $(".health-bar-red, .health-bar").stop();
    this.curHealth = this.curHealth - damage;
    if (this.curHealth < 0) {
      this.curHealth = 0;
    } else {
      $(".message-box").html("You took " + damage + " points of damage!");
    }
    this.applyChange();
    // }
  }

  addHealth() {
    if (this.curHealth == this.maxHealth) {
      $(".message-box").html("You are already at full health");
    } else {
      let heal = Math.floor(Math.random() * 100 + 5);
      $(".health-bar-red, .health-bar-blue, .health-bar").stop();
      this.curHealth = this.curHealth + heal;
      if (this.curHealth > this.maxHealth) {
        this.curHealth = this.maxHealth;
        $(".message-box").html("You're at full health");
      } else if (this.curHealth == 0) {
        $(".message-box").html(
          "Miraculously! You regained your health by " +
            heal +
            " points and get back on to your feet!"
        );
      } else {
        $(".message-box").html(
          "You regained your health by " + heal + " points!"
        );
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
