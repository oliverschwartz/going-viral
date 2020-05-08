import * as APP from '../../app.js';

class Progress {
    constructor() {
        this.maxPosition = APP.height;
        this.currPosition = 0; 
    }
    
    updateBar(position) {
        this.currPosition = position; 
        let r = this.currPosition / (100/this.maxPosition); 
        console.log(r);
        $(".progress-bar").css("width", r + "%").text(r + " %");
    }
}

export default Progress; 