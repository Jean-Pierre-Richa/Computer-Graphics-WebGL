var pesce = [];
var boat;
var boatFlag = false;
var fishFlag = false;
var flag = false;
var helper;
var boxes = [];
var movingCubes = [];
var collidableMeshList = [];
var container, stats;
var scene, renderer, camera;
var light, light2;
var progress;
var quickTime = false;
var keyboard = new KeyboardState();
var bar = document.getElementById("bar-1");
var xAxis = new THREE.Vector3(1, 0, 0);

// Building the hierarchical structure
var lighthouseId = 0;
var boatId = 1;
var rod1Id = 2;
var rod2Id = 3;
var rod3Id = 4;
var numNodes = 4;
var figure = [];
var m = new THREE.Vector3();
var stack = [];
var theta=[0, 0, 0.5, 0, 0];
for (var i = 0; i<=numNodes; i++) figure[i] = createNode(null, null, null, null); // create a node for each object

function createNode(transform, render, sibling, child){ //node creation function for the hierarchical structure
  var node = {
  transform: transform,
  render: render,
  sibling: sibling,
  child: child,
  }
  return node;
}

function initNodes(Id){

  switch(Id){

  case lighthouseId:
  t = new THREE.Vector3(0, 0, 0);
  figure[lighthouseId] = createNode(t, lighthousea, null, boatId);
  break;

  case boatId:
  t1 = t.add(new THREE.Vector3(-270, -11, -600));
  figure[boatId] = createNode(t1, boata, null, rod1Id);
  break;

  case rod1Id:
  t2 = t1.add(new THREE.Vector3(0, 0, 0));
  figure[rod1Id] = createNode(t2, roda, null, rod2Id);
  break;

  case rod2Id:
  t3 = t2.add(new THREE.Vector3(0, 0, 0));
  figure[rod2Id] = createNode(t3, rodb, null, rod3Id);
  break;

  case rod3Id:
  t4 = t3.add(new THREE.Vector3(0, 0, 0));
  figure[rod3Id] = createNode(t4, rodc, null, null);
  break;
  }
}

function traverse(Id){

  if(Id == null) return;
  stack.push(m);
  m.dot(figure[Id].transform)
  figure[Id].render();
  if (figure[Id].child != null) traverse(figure[Id].child);
    m = stack.pop();
  if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

///////////////////
//QUICKTIME EVENT
///////////////////

function SetBarsAsUndefined() {
    bar.setUndeterminated(1);
}

function SetBarsAsDefined() {
    bar.setUndeterminated(0);
}

function UpdateBars() {
    bar.progress++;
    if (document.getElementById("bar-1").progress < 100) {
        setTimeout(UpdateBars, 10);
    }
}

// Converts from degrees to radians.
Math.radians = function (degrees) {
    return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function (radians) {
    return radians * 180 / Math.PI;
};

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}



init();
function init() {
    ///////////////////
    //CAMERA
    ///////////////////

    container = document.getElementById('container');

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000);
    // camera.position.set(159, 10, 552);

    //ORBIT CONTROL
    // var controls = new THREE.OrbitControls(camera);
    // controls.update();
    //
    // camera.lookAt(0, 0, 0);
    // window.addEventListener('mousemove', function (e) {
    //     var mouse3D = new THREE.Vector3(
    //         ((event.clientX / window.innerWidth) * 2 - 1) * 300,
    //         (-(event.clientY / window.innerHeight) * 2 + 1) * 300,
    //         0.5);
    //     camera.lookAt(mouse3D);
    // });

    /* IF YOU NEED A 360 DEGREES CAMERA, YOU CAN USE POINTERLOCKCONTROL
    EXAMPLE IS DINO:
    https://codepen.io/MSEdgeDev/pen/NpKejy */

    /* var looking = new THREE.PointerLockControls( camera );
    scene.add( looking.getObject() ); */
    //looking.enabled = true; // Turns on camera rotating with mouse


    ///////////////////
    //LIGHTS & SHADOWS
    ///////////////////


    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    light2 = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(light2);

    light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(0, 200, -3000);
    light.castShadow = true;
    scene.add(light);
    //Set up shadow properties for the light
    light.shadow.mapSize.width = 512; // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 500 // default

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    //STATS TOP LEFT
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px'
    container.appendChild(stats.domElement);

    //PROGRESS BAR
    progress = document.getElementById('progressBar');
    progress.style.position = 'absolute';
    progress.style.top = '50%';
    progress.style.left = '50%';
    progress.style.visibility = 'hidden';
    container.appendChild(progress);

    window.addEventListener('resize', onWindowResize, false);
}

///////////////////
//WATER
///////////////////

var params = {
    color: '#ffffff',
    scale: 4,
    flowX: 1,
    flowY: 1
};

var waterGeometry = new THREE.PlaneBufferGeometry(2000, 2000);
water = new THREE.Water(waterGeometry, {
    color: params.color,
    scale: params.scale,
    flowDirection: new THREE.Vector2(params.flowX, params.flowY),
    textureWidth: 1024,
    textureHeight: 1024
});
water.position.y = -11;
water.rotation.x = Math.PI * -0.5;
scene.add(water);


///////////////////
//SKY
///////////////////

// Add Sky
sky = new THREE.Sky();
sky.scale.setScalar(450000);
scene.add(sky);

// Add Sun Helper
sunSphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(20000, 16, 8),
    new THREE.MeshBasicMaterial({
        color: 0xffffff
    })
);
sunSphere.position.y = -700000;
sunSphere.visible = false;
scene.add(sunSphere);

var distance = 400000;

var effectController = {
    turbidity: 10,
    rayleigh: 2,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
    luminance: 1,
    inclination: 0.49, // elevation / inclination
    azimuth: 0.25, // Facing front,
    sun: !true
};

var uniforms = sky.material.uniforms;
uniforms.turbidity.value = effectController.turbidity;
uniforms.rayleigh.value = effectController.rayleigh;
uniforms.luminance.value = effectController.luminance;
uniforms.mieCoefficient.value = effectController.mieCoefficient;
uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
var theta = Math.PI * (effectController.inclination - 0.5);
var phi = 2 * Math.PI * (effectController.azimuth - 0.5);
sunSphere.position.x = distance * Math.cos(phi);
sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);
sunSphere.visible = effectController.sun;
uniforms.sunPosition.value.copy(sunSphere.position);

///////////////////
//CAMERA
///////////////////

var helper = new THREE.CameraHelper(light.shadow.camera);
scene.add(helper);

///////////////////
//3D MODELS
///////////////////

//Adding the Lighthouse (the function will be used when the new node for the lighthouse is created)
var loader = new THREE.GLTFLoader();
function lighthousea(){
  loader.load(
      // resource URL
      '/models/lighthouse/model.gltf',
      // called when the resource is loaded
      function (gltf) {
          //gltf.scene.rotation.z = 180;
          var lighthouse = gltf.scene;
          lighthouse.castShadow = true;
          lighthouse.name = "lighthouse";
          lighthouse.position.set(0, -10, 0);
          scene.add(lighthouse);
      },
      // called while loading is progressing
      function (xhr) {

          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
          if (xhr.loaded / xhr.total == 1) {

          }

      },
      // called when loading has errors
      function (error) {

          console.log('An error happened');

      }
  );
}
//Adding the boat (the function will be used when the new node for the boat is created)
function boata(){
  loader.load(
      // resource URL
      '/models/boat2/scene.gltf',
      // called when the resource is loaded
      function (gltf) {
          boat = gltf.scene;
          boat.castShadow = true;
          boat.name = "boat";
          boat.position.set(t1.x, t1.y+5, t1.z);
          boat.scale.set(3, 3, 3);
          boat.rotation.y = Math.PI/180;
          scene.add(boat);
          boatFlag = true;
      },
      // called while loading is progressing
      function (xhr) {

          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
          if (xhr.loaded / xhr.total == 1) {

          }

      },
      // called when loading has errors
      function (error) {

          console.log('An error happened');

      }
  );

}
//Adding the rod handle (the function will be used when the new node for the rod handle is created)
function roda(){
  loader.load(
      // resource URL
      '/models/rod/rod13.gltf',
      // called when the resource is loaded
      function (gltf) {
          rod1 = THREE.Object3D.prototype.clone.call(gltf.scene);
          // rod1.rotation.x = -2;
          // rod1.position.set(170, 5, 565);
          rod1.position.set(t2.x, t2.y+5, t2.z);
          // rod1.position.set(t2.x, t2.y, t2.z);
          rod1.scale.set(5, 5, 5);
          rod1.castShadow = true;
          scene.add(rod1);
      },
      // called while loading is progressing
      function (xhr) {

          console.log((xhr.loaded / xhr.total * 100) + '% loaded');

      },
      // called when loading has errors
      function (error) {

          console.log('An error happened');

      }
  );

}
//Adding the rod rope (the function will be used when the new node for the rod rope is created)
function rodb(){
  loader.load(
      '/models/rod/rod14.gltf',
      function (gltf) {
          rod2 = THREE.Object3D.prototype.clone.call(gltf.scene);
          // rod2.rotation.x = -1.6;
          // rod2.position.set(170, 4.5, 565);
          rod2.position.set(t3.x, t3.y+5, t3.z);
          // rod2.position.set(t3.x, t3.y, t3.z);
          rod2.scale.set(5, 5, 5);
          rod2.castShadow = true;
          scene.add(rod2);
      },
      function (xhr) {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      function (error) {
          console.log('An error happened');
      }
  );
}
//Adding the rod bait (the function will be used when the new node for the rod bait is created)
function rodc(){
  loader.load(
      '/models/rod/rod15.gltf',
      function (gltf) {
          rod3 = THREE.Object3D.prototype.clone.call(gltf.scene);
          // rod2.rotation.x = -1.6;
          // rod2.position.set(170, 4.5, 565);
          rod3.position.set(t4.x, t4.y+5, t4.z);
          // rod2.position.set(t3.x, t3.y, t3.z);
          rod3.scale.set(5, 5, 5);
          rod3.castShadow = true;
          scene.add(rod3);
      },
      function (xhr) {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      function (error) {
          console.log('An error happened');
      }
  );
}

//Adding the fishes
loader.load(
    '/models/fish/scene.gltf',
    function (gltf) {
        gltf.scene.scale.set(0.05, 0.05, 0.05);
        gltf.scene.castShadow = true;
        for (var i = 0; i < 100; i++) {
            x = THREE.Math.randFloatSpread(1000);
            z = THREE.Math.randFloatSpread(1000);
            gltf.scene.position.set(x, -20, z);
            gltf.scene.name = "pesce" + i.toString();
            gltf.scene.rotation.y = Math.random() * 6.28 - 3.14;
            pesce[i] = THREE.Object3D.prototype.clone.call(gltf.scene)

            //COLLISION BOXES
            var center = new THREE.Vector3();
            var box = new THREE.Box3().setFromObject(pesce[i]);
            var cubeGeometry = new THREE.BoxGeometry(box.getSize(center).x, box.getSize(center).y, box.getSize(
                center).z);
            var wireMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                wireframe: true
            });
            movingCubes[i] = new THREE.Mesh(cubeGeometry, wireMaterial);
            movingCubes[i].position.x = pesce[i].position.x;
            movingCubes[i].position.y = pesce[i].position.y + 2.5;
            movingCubes[i].position.z = pesce[i].position.z;

            collidableMeshList.push(movingCubes[i]);

            scene.add(pesce[i]);
            scene.add(movingCubes[i]);
        }
    },
    // called while loading is progressing
    function (xhr) {

        console.log((xhr.loaded / xhr.total * 100) + '% loaded');

    },
    // called when loading has errors
    function (error) {
        console.log('An error happened');
    }
);


  ///////////////////
  //FISH MOVEMENT
  ///////////////////

  function movimentoPesce(oggetto) {
      for (var i = 0; i < oggetto.length; i++) {
          var randDegrees = Math.floor(Math.random() * 720) - 360;
          var randRadians = Math.radians(randDegrees);
          var x = 0.5 * Math.cos(randRadians);
          var z = 0.5 * Math.sin(randRadians);
          if (oggetto[i].position.x + x > 500 || oggetto[i].position.x + x < -500 || oggetto[i].position.z + z >
              500 || oggetto[i].position.z + z < -500) {
              var rand = THREE.Math.randFloatSpread(1000);
              oggetto[i].position.set(0, -20, 0);
          }

          function r1(oggetto, i, cubo) {

              //TO SLOW DOWN FISH MOVEMENT, UNCOMMENT SETTIMEOUT
              setTimeout(function () {
              if (randRadians > oggetto.rotation.y) {
                  var deltax = oggetto.position.x;
                  var deltaz = oggetto.position.z;
                  oggetto.rotation.y += 0.17;
                  oggetto.translateOnAxis(xAxis, -0.5);
                  deltax = oggetto.position.x - deltax;
                  deltaz = oggetto.position.z - deltaz;
                  cubo.position.x += deltax;
                  cubo.position.z += deltaz;
                  r1(oggetto, i, cubo);
              }
            }, 300);
          }

          function r2(oggetto, i, cubo) {
              setTimeout(function () {
              if (randRadians < oggetto.rotation.y) {
                  var deltax = oggetto.position.x;
                  var deltaz = oggetto.position.z;
                  oggetto.rotation.y -= 0.17;
                  oggetto.translateOnAxis(xAxis, -0.5);
                  deltax = oggetto.position.x - deltax;
                  deltaz = oggetto.position.z - deltaz;
                  cubo.position.x += deltax;
                  cubo.position.z += deltaz;
                  r2(oggetto, i, cubo);
              }
            }, 300);
          }

          randRadians = randRadians + oggetto[i].rotation.y
          if (randRadians > oggetto[i].rotation.y) {
              r1(oggetto[i], i, movingCubes[i]);
          } else {
              r2(oggetto[i], i, movingCubes[i]);
          }
      }
  }

function polarToCartesian(radius, angle) {
    return [radius * Math.cos(angle), radius * Math.sin(angle)]
}

function collision(obj) {
    for (var i = 0; i < obj.length; i++) {
        var originPoint = movingCubes[i].position.clone();
        for (var vertexIndex = 0; vertexIndex < movingCubes[i].geometry.vertices.length; vertexIndex++) {
            var localVertex = movingCubes[i].geometry.vertices[vertexIndex].clone();
            var globalVertex = localVertex.applyMatrix4(movingCubes[i].matrix);
            var directionVector = globalVertex.sub(movingCubes[i].position);

            var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
            var collisionResults = ray.intersectObjects(collidableMeshList);
            if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length())
                console.log(" Hit ");
        }
    }
}

var animate = function () {
    setTimeout( function() {
        requestAnimationFrame( animate );

    }, 1000 / 30 );
    var time = performance.now() * 0.001;


    stats.update();
    collision(pesce);
    keyboard.update();

    if (quickTime) {
        flag = false;
        bar.progress = 0;
        progress.style.visibility = 'visible';
        bar.style.visibility = 'visible';
        UpdateBars();
        quickTime = false;
    }

    var time = performance.now() * 0.001;
    if (boatFlag) {
        boat.rotation.x = Math.sin(time) * 0.015;
    }

    if (flag) {
        movimentoPesce(pesce);
    }

    if (keyboard.down("space")) {
        bar.progress = 100;
        bar.style.visibility = 'hidden';
        progress.style.visibility = 'hidden';
        flag = true;
    }

    renderer.render(scene, camera);
};
animate();

// Animating the boat
// W, A, S, D keys are used to move the boat, and F, G are used to throw and pull the rod
var map = {87 : false, 83 : false, 65 : false, 68 : false, 70 : false, 71 : false};
document.addEventListener("keydown", keyDownTextField, false);

function keyDownTextField(e) {
  var xSpeed =10;
  var zSpeed = 10;
  var rota = 2*Math.PI/180;
  var bpos = boat.position;
  var brot = boat.rotation;
  var cpos = camera.position;
  var crot = camera.rotation;
  var r1pos = rod1.position;
  var r2pos = rod2.position;
  var r3pos = rod3.position;
  var r1rot = rod1.rotation;
  var r2rot = rod2.rotation;
  var r3rot = rod3.rotation;
  var cos = Math.cos;
  var sin = Math.sin;
    if (e.keyCode in map) {
        map[e.keyCode] = true;
        if (map[87] && map[65]) { // forward + left movement
          bpos.z = bpos.z - sin(brot.y)*zSpeed;
          bpos.x = bpos.x + cos(brot.y)*xSpeed;
          brot.y += rota;
        }
        else if (map[87] && map[68]) { // forward + right movement
          bpos.z = bpos.z - sin(brot.y)*zSpeed;
          bpos.x = bpos.x + cos(brot.y)*xSpeed;
          brot.y -= rota;
        }
        else if (map[87]) { // forward movement
          bpos.z = bpos.z - sin(brot.y)*zSpeed;
          bpos.x = bpos.x + cos(brot.y)*xSpeed;
        }
        else if (map[83] && map[65]) { // backward + left movement
          bpos.z = bpos.z + sin(brot.y)*zSpeed;
          bpos.x = bpos.x - cos(brot.y)*xSpeed;
          brot.y -= rota;
        }
        else if (map[83] && map[68]) { // backward + right movement
          bpos.z = bpos.z + sin(brot.y)*zSpeed;
          bpos.x = bpos.x - cos(brot.y)*xSpeed;
          brot.y += rota;
        }
        else if (map[83]) { // backward movement
          bpos.z = bpos.z + sin(brot.y)*zSpeed;
          bpos.x = bpos.x - cos(brot.y)*xSpeed;
        }

        if (boat.position.z <= -940 || boat.position.x <= -940 || boat.position.z >= 940 || boat.position.x >= 940){
          brot.y += 90*Math.PI/180;
        }
      cpos.x = bpos.x;
      cpos.y = bpos.y+5;
      cpos.z = bpos.z;
      crot.y = brot.y - (90*Math.PI/180);
      r1pos.x = bpos.x;
      r1pos.z = bpos.z;
      r2pos.x = bpos.x;
      r2pos.z = bpos.z;
      r3pos.x = bpos.x;
      r3pos.z = bpos.z;
      r1rot.y = brot.y;
      r2rot.y = brot.y;
      r3rot.y = brot.y;
        if (map[70]){ // pull the rod
          r1rot.x = 0;
          rod2.scale.set(5, 5, 5);
          r2pos.y = -6;
          r3pos.y = -6;

        }
        if (map[71]){ // throw the rod
          r1rot.x = -0.5;
          rod2.scale.set(5, 10, 5);
          r2pos.z -= 2.5;
          r2pos.y = boat.position.y-11.5;
          r3pos.y = r2pos.y-1;
          r3pos.z = r2pos.z;
        }
    }
  }

document.onkeyup = myKeyUpHandler;
function myKeyUpHandler(e) {
  var brot = boat.rotation;
  var crot = camera.rotation;
    if (e.keyCode in map) {
        map[e.keyCode] = false;
        crot.y = brot.y;
        // cpos.x = bpos.x-14;
    }
};
var render = function(){
  traverse(lighthouseId);
  camera.position.set(t1.x, t1.y+10, t1.z);
  requestAnimationFrame(animate);

}
// create the nodes
for(i = 0; i<=numNodes; i++) initNodes(i);
    render();
