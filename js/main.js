var scene, camera, renderer, gui, items; 

function init() {

    // Create the scene. 
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x3eabca)
    scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);

    // Create the camera. 
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
    scene.add(camera);

    // Add some lighting. 
    scene.add(new THREE.AmbientLight(0xffffff));

    // Create our blocks.
    var createBlocks = function(numBlocks, size) {
        let blocks = [];
        let centering = -numBlocks * size

        for (let i = 0; i < numBlocks; i++) {
            cube = new THREE.Mesh(
                new THREE.BoxGeometry(size, size, size), 
                new THREE.MeshBasicMaterial({color: 0x990033})
            );
            scene.add(cube);
            blocks.push(cube);
        
            // Add mesh on the cube. 
            var geo = new THREE.EdgesGeometry(cube.geometry);
            var mat = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 2});
            var wireframe = new THREE.LineSegments(geo, mat);
            cube.add(wireframe);
    
            cube.translateX(i * size * 2 + centering);
        }

        // Instantiate our Items. 
        items = new Items(blocks); 
    }

    // Some parameters about our blocks. 
    let numBlocks = 20; 
    let size = 10;
    createBlocks(numBlocks, size)
    
    // Create the ground, adding a texture to it.
    var loader = new THREE.TextureLoader();
    var groundTexture = loader.load( 'textures/grasslight-big.jpg' );
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 25, 25 );
    groundTexture.anisotropy = 16;
    groundTexture.encoding = THREE.sRGBEncoding;
    var groundMaterial = new THREE.MeshLambertMaterial({map: groundTexture});
    var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(20000, 20000), groundMaterial);
    mesh.position.y = -150;
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Create our renderer object. 
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio); 
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add controls so we can manipulating viewing angle.
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 1000;
    controls.maxDistance = 5000;

    // Display the coordinate axes. 
    var axesHelper = new THREE.AxesHelper(1000);
    scene.add(axesHelper);

    // Add a GUI with shuffle capability. 
    var guiObj = function() {
        this.shuffle = function() {
            items.shuffle();
        }
        this.numOfBlocks = 10;
        this.reset = function() {
            if (items.count != this.numOfBlocks) {
                console.log("here")
                debugger
                createBlocks(this.numBlocks, 50);
            }
        }
    }
    var text = new guiObj();
    gui = new dat.GUI();
    gui.add(text, 'shuffle');
    gui.add(text, 'numOfBlocks', 1, 20);
    gui.add(text, 'reset');

    camera.position.set(0, 0, 10);
    controls.update();
}

function animate() {
    requestAnimationFrame(animate);

    // Update the position of our items. 
    items.update() 

    renderer.render(scene, camera);
};

init();
animate();