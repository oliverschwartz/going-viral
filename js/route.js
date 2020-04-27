/******************************************************
`route.js`: A class for defining routes through space. 
            Each route consists of a series of sections.
            Each section has a directional vector and a distance 
            left for the block to travel. 
******************************************************/

class Route {
    constructor() {
        this.sections = [];
    }
}

Route.prototype.addSection = function(direction, distance) {
    this.sections.push(
        {
            direction: direction.clone().normalize(),
            distance: distance
        }
    );
}