import * as APP from "../../app.js";

class Menu {
    constructor() {

        // let link1 = document.createElement("link"); 
        // link1.rel = "stylesheet"
        // link1.href = "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" 
        // link1.integrity = "sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" 
        // link1.crossorigin = "anonymous"
        // document.head.appendChild(link1);

        // document.head.append(`<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        // <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Sigmar+One" />`);

        // Add some CSS.
        var styles = `
          h1 {
            font-family: "Sigmar One"
          }
          
          h2 {
            font-family: "Sigmar One";
            font-size: 20px;
            text-align: center;
          }
          
          .instructions {
            font-family: "Sigmar One";
            font-size: 18px; 
            text-align: center;
            color: #a8a7a5; 
          }
          
          .overlay {
            height: 100%;
            width: 100%;
            position: fixed;
            z-index: 1;
            top: 0;
            left: 0;
            background-color: rgb(0, 0, 0);
            background-color: rgba(0, 0, 0, 0.9);
            overflow-x: hidden;
          }
          
          .overlayContent {
            position: relative;
            top: 30%;
            width: 100%;
            text-align: center;
            margin-top: 30px;
            padding: 8px;
            text-decoration: none;
            font-size: 36px;
            font-family: "Georgia";
            color: #ffffff;
            display: block;
          }
          
          .buttonDiv {
            display: flex;
            text-align: center;
          }
        `
        let styleSheet = document.createElement("style")
        styleSheet.type = "text/css"
        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)

        // Make a div. 
        let div = document.createElement("div");
        div.classList.add("overlay");
        document.body.appendChild(div);
        let html = `
            <div class="container overlayContent">
                <h1>
                <span style="color: #8a1007;">Welcome to </span><span style="color: #ff1200; font-size: 45px;">RONA RUN</span>
                </h1>
                <h2 style="color: #e33d67; padding-top: 2%; padding-bottom: 1%;">
                How to play
                </h2>
                <p class="instructions">
                You are a <span style="color: white;">healthy cell</span> <br>You <em>must</em> make it to your <span style="color: #ffd700">destination</span> to ensure the survival of your organism <br> Avoid touching the <span style="color: #26ff52;">viruses and the areas they infect</span> <br> BEWARE: the better you do, the more aggressive the viruses will become
                </p>
                <div>
                <button class="btn btn-danger" style="font-family: Sigmar One;" id="start">
                    START GAME
                </button>
                </div>
            </div>
        `
        div.innerHTML = html; 

        document.getElementById("start").onclick = function () {
            console.log("here!")
            div.style.display = "none";
        }
    }
}

export default Menu;