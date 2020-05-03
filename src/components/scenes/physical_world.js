function createPhysicsWorld() {

    // Creates physical world.
    world = new CANNON.World();
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;

    // Creates physical virus.
    virus.physical = createParticlePhysical(virus);
    world.addBody(virus.physical);

    // Creates physical antibody.
    // ball2.physical = createBallPhysical(ball2);
    // world.addBody(ball2.physical);
}

function updatePhysicsWorld() {

    world.step(1 / 60);

    // Updates velocity.
    virus.physical.velocity.scale(1 - virus.physical.friction,
        virus.physical.velocity);
    // ball2.physical.velocity.scale(1 - ball2.physical.friction,
    //     ball2.physical.velocity);

    // Updates impulse.
    if (virus.canMove) {
        updateImpulse(virus);
    }

    // if (ball2.canMove) {
    //     updateImpulse(ball2);
    // }

    // Handles wall collisions.
    handleWallCollisions(virus.physical);
    // handleWallCollisions(ball2.physical);
}