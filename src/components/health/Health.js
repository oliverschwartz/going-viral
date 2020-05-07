import * as APP from "../../app.js";

class Health {
    constructor() {
        let styles = `
        .area {
            padding: 10px;
            text-align: center;
          }
          
          h2 {
            padding: 5px;
            text-align: center;
          }
          
          p {
            width: 500px;
            padding: 1%;
            margin: auto;
          }
          
          .btn {
            text-align: center;
            width: 100px;
            background-color: #A8C2C4;
            border: 2px solid #97aeb0;
            padding: 20px;
            display: inline-block;
            margin: 30px 10px;
            user-select: none;
            -moz-user-select: none;
            -khtml-user-select: none;
            -webkit-user-select: none;
            -o-user-select: none;
            cursor: pointer;
          }
          
          .health-box {
            background-color: #ccc;
            height: 30px;
            width: 500px;
            margin: 0 auto;
            border: solid 1px #aaa;
          }
          
          .health-bar {
            background-color: #007f00;
            width: inherit;
            height: 28px;
            position: relative;
            bottom: 56px;
          }
          
          .health-bar-red {
            width: 100%;
            height: 100%;
            background-color: #cc0000;
          }
          
          .health-bar-blue {
            width: 100%;
            height: 100%;
            background-color: #3bd3df;
            bottom: 28px;
            position: relative;
          }
          
          .health-bar-text {
            position: relative;
            bottom: 80px;
          }
          
          .message-box {
            text-align: center;
            padding: 5px;
          }
          
          .total,
          .message-box {
            font-size: 16px;
            margin: 5px;
          }
        `;
        
        let styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);

        let div = document.createElement("div"); 
        div.classList.add("container"); 
        div.innerHTML = `
        <div class="col-md-12">
          <div class="area">
            <div class="total"></div>
            <div class="health-box">
              <div class="health-bar-red"></div>
              <div class="health-bar-blue"></div>
              <div class="health-bar"></div>
              <div class="health-bar-text"></div>
            </div>
          </div>
        </div>
        `;

        let maxHealth = 500;
        let curHealth = maxHealth;
        $(".total").html(maxHealth + "/" + maxHealth);
        $(".health-bar-text").html("100%");
        $(".health-bar").css({
            width: "100%",
        });
        $(".add-damage").click(function () {
            if (curHealth == 0) {
                $(".message-box").html("Is this the end??");
            } else {
                var damage = Math.floor(Math.random() * 100 + 50);
                $(".health-bar-red, .health-bar").stop();
                curHealth = curHealth - damage;
                if (curHealth < 0) {
                    curHealth = 0;
                    restart();
                } else {
                    $(".message-box").html(
                        "You took " + damage + " points of damage!"
                    );
                }
                applyChange(curHealth);
            }
        });
        $(".add-heal").click(function () {
            if (curHealth == maxHealth) {
                $(".message-box").html("You are already at full health");
            } else {
                var heal = Math.floor(Math.random() * 100 + 5);
                $(".health-bar-red, .health-bar-blue, .health-bar").stop();
                curHealth = curHealth + heal;
                if (curHealth > maxHealth) {
                    curHealth = maxHealth;
                    $(".message-box").html("You're at full health");
                } else if (curHealth == 0) {
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
                applyChange(curHealth);
            }
        });

        function applyChange(curHealth) {
            var a = curHealth * (100 / maxHealth);
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
            $(".total").html(curHealth + "/" + maxHealth);
        }

        function restart() {
            //Was going to have a game over/restart function here.
            $(".health-bar-red, .health-bar");
            $(".message-box").html(
                "You've been knocked down! Thing's are looking bad."
            );
        }
    }
}

export default Health;
