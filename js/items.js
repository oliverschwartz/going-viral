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
            block.translateOnAxis(direction, section.increment); 
            section.distance -= section.increment;  
                
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

// Helper function: shuffle `array`, returning the shuffled array and the
// shuffled indices. 
// FROM: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;
    let indices = [...Array(array.length).keys()];
    
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;

        // Update the indices array. 
        tmpKey = indices[currentIndex]; 
        indices[currentIndex] = indices[randomIndex]; 
        indices[randomIndex] = tmpKey;
    }

    return array, indices;
}

/*
    Shuffle the items. This involves building a route for each. 
    Check objects are not currently moving. 
*/
Items.prototype.shuffle = function() {

    // First, shuffle the blocks in this.blocks. 
    let indices; 
    this.blocks, indices = shuffleArray(this.blocks); 

    // Get the new positions for every block. 
    for (let i = 0; i < this.count; i++) {
        let index = indices[i]; 
        let source = this.blocks[index].position.clone(); 
        let destination = this.blocks[indices.findIndex(function(element) {
            return element === i; 
        })].position.clone();
        let travel = destination.clone().sub(source.clone()); 

        // Second, compute the routes for every block to its new position.
        let route = new Route();
        let offset = 10;
        let scale = 15;
        let dist = offset + scale * index;

        // Upward section.
        route.addSection(new THREE.Vector3(0,1,0), dist, dist * 10 ** -1.5);

        // Lateral section.
        route.addSection(travel.clone().normalize(), travel.length(), travel.length() * 10 ** -1.5); 

        // Downward section.
        route.addSection(new THREE.Vector3(0,-1,0), dist, dist * 10 ** -1.5);
        items.routes[index] = route;

        console.log(indices);
        console.log("moving " + index + " to position " + i);
        console.log("index of block " + i + " in shuffled array is " + indices.findIndex(function(element) {
            return element == i; 
        }))
    }
}
