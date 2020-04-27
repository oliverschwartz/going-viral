/******************************************************
`items.js`: A file for manipulating our array of items. 
*******************************************************/

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
    let increment = 0.1; 

    // Iterate over each block. 
    for (let i = 0; i < this.count; i++) {
        
        let block = this.blocks[i]; 
        let route = items.routes[i];

        // For the current block, see if it has anywhere to go.
        if (route != undefined) {

            console.log("moving block " + i);

            // Move along the first section of the route. 
            let section = route.sections[0]; 
            let direction = section.direction.clone().normalize(); 
            block.translateOnAxis(direction, increment); 
            section.distance -= increment;  
                
            // This section of the route is done. 
            if (section.distance <= 0) {
                route.sections.shift(); 
            }

            // If all sections of the route are done.
            if (route.sections.length == 0) {
                items.routes[i] = undefined;
            }
        }
    }
}

/*
    Shuffle the items. This involves building a route for each. 
    Check objects are not currently moving. 
*/
Items.prototype.shuffle = function() {
    console.log("shuffling");

    let route = new Route();
    route.addSection(new THREE.Vector3(0,1,0), 50); 
    route.addSection(new THREE.Vector3(0,-1,0), 50); 
    items.routes[1] = route;
}