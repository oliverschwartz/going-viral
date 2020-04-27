var scene, camera, renderer, gui, blocks; 

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

    // Some parameters about our blocks. 
    blocks = [];
    let numBlocks = 10;
    let size = 50; 
    let centering = -numBlocks * size

    // Create our blocks. 
    for (let i = 0; i < numBlocks; i++) {
        cube = new THREE.Mesh(
            new THREE.BoxGeometry(size, size, size), 
            new THREE.MeshBasicMaterial({color: 0x990033})
        );
        scene.add(cube);
    
        // Add mesh on the cube. 
        var geo = new THREE.EdgesGeometry(cube.geometry);
        var mat = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 2});
        var wireframe = new THREE.LineSegments(geo, mat);
        cube.add(wireframe);

        cube.translateX(i * size * 2 + centering);
    }

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

    // Add a GUI
    gui = new dat.GUI();

    camera.position.set(0, 0, 10);
    controls.update();
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate the cube a small amount. 
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    renderer.render(scene, camera);
};

init();
animate();