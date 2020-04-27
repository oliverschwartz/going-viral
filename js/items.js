/*
`items.js`: A file for manipulating our array of items. 
*/

class Items {
    constructor(blocks) {
        this.blocks = blocks;
        this.count = blocks.length;
        this.routes = new Array(this.count);
    }
}

/* 
    Move block number `id` in the direction of the normalized vector
    `direction`, `distance` number of units.
*/
Items.prototype.move = function(id, direction, distance) {
    direction.normalize(); 
    this.blocks[id].translateOnAxis(direction, distance); 
}

/*
    Update the position of each of our blocks if they are 
    out of position. 
*/
Items.prototype.update = function() {
    for (let i = 0; i < this.count; i++) {
        let route = this.routes[i]; 
        if (route !== undefined) {
            // Move along the route. 
        }
    }
}

/*
    Shuffle the items. This involves building a route for each. 
    Check objects are not currently moving. 
*/
Items.prototype.shuffle = function() {
    console.log("shuffling");
}