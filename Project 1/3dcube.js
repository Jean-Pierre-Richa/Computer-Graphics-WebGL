"use strict";

var canvas;
var gl;
var numVertices  = 36;
var numChecks = 8;
var program;
var c;
var flag = true;


// Problem 1 Implementing a button to change the current rotation direction
var reverse = true;           //Flag for changing the rotation direction

//problem 2: declaring the modelview and projection matrices
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

//problem3: declaring the scaling and translation variables
var tx = 0;     //TranslateX
var ty = 0.6;   //TranslateY
var tz = 0;     //translateZ

//problem 4 & 5: declaring the variables to be used in the projections
var n = 0.3;    //near
var f = 4;      //far
var l = -1.0;   //left
var r = 1.0;    //right
var tt = 1.0;   //top
var b = -1.0;   //bottom
var s = 0.5;    //slide
var switchprojection = false; //Flag for changing between perspective and orthographic
var fov = 100.0;  //Field of View in perspective projection
var aspect = 1.0; //Aspect perspective perspective projection

var render;

// problem 6: light position variables
var lx = 0;     //Light position along the X axis
var ly = -2;    //Light position along the Y axis
var lz = 10;    //Light position along the Z axis

//problem 6: flags to switch between gouraud and phong shading
var shadingBool = true;
var Shadingbool = false;





var color = new Uint8Array(4);

var pointsArray = [];
var colorsArray = [];
var normalsArray = [];

var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 ),
    ];

// problem 6: creating the light
var lightPosition = vec4(lx, ly, lz, 0.0 );
var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0 );
var lightDiffuse = vec4( 0.1, 0.2, 0.9, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.5, 0.8, 0.8, 1.0 );
var materialDiffuse = vec4( 0.1, 0.5, 0.1, 1.0);
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 7.0;
var ambientColor, diffuseColor, specularColor;

var viewerPos;
var framebuffer;

//problem 4 & 5:
var eye = vec3(0.0, 0.0, 1.0);
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;

var theta = [45.0, 45.0, 45.0];

var thetaLoc;

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];
function quad(a, b, c, d) {


      var t1 = subtract(vertices[b], vertices[a]);
      var t2 = subtract(vertices[c], vertices[b]);
      var normal = cross(t1, t2);
      var normal = vec3(normal);
      normal = normalize(normal);

      pointsArray.push(vertices[a]);
      normalsArray.push(normal);
      pointsArray.push(vertices[b]);
      normalsArray.push(normal);
      pointsArray.push(vertices[c]);
      normalsArray.push(normal);
      pointsArray.push(vertices[a]);
      normalsArray.push(normal);
      pointsArray.push(vertices[c]);
      normalsArray.push(normal);
      pointsArray.push(vertices[d]);
      normalsArray.push(normal);
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta");

//problem 2:
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

// problem 6 & 7: creating the light products for gouraud and phong shading
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    var AmbientProduct = mult(lightAmbient, materialAmbient);
    var DiffuseProduct = mult(lightDiffuse, materialDiffuse);
    var SpecularProduct = mult(lightSpecular, materialSpecular);

 document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
 document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
 document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
 document.getElementById("ButtonT").onclick = function(){flag = !flag;};

// Problem 1: Implementing a button to change the current rotation direction
 document.getElementById("ButtonC").onclick = function(){reverse = !reverse};



//problem 3:
 document.getElementById("ButtonO").onclick = function(){switchprojection = !switchprojection};
 document.getElementById("ButtonS").onclick = function(){shadingBool = !shadingBool;};
  document.getElementById("ButtonS").onclick = function(){Shadingbool = !Shadingbool;};
//problem 3: reading the translation values from HTML
 document.getElementById("tx").oninput = function(event) {
     tx = event.target.value;
    gl.uniform1f( gl.getUniformLocation(program, "tx"), tx);
 };
 document.getElementById("ty").oninput = function(event) {
     ty = event.target.value;
    gl.uniform1f( gl.getUniformLocation(program, "ty"), ty);
 };
 document.getElementById("tz").oninput = function(event) {
     tz = event.target.value;
    gl.uniform1f( gl.getUniformLocation(program, "tz"), tz);
 };
//problem 3: getting the scaling values from the HTML file
 document.getElementById("s").oninput = function(event) {
     s = event.target.value;
    gl.uniform1f( gl.getUniformLocation(program, "s"), s);
  };



//problem 4 & 5: getting the near, far & fov, and aspect values from HTML
 document.getElementById("depthSlider").oninput = function(event) {
     n = event.target.value/2;
    gl.uniform1f( gl.getUniformLocation(program, "depthSlider"), depthSlider);
 };
 document.getElementById("depthSlider2").oninput = function(event) {
     f = event.target.value/2;
 };
 document.getElementById("fov").oninput = function(event) {
     fov = event.target.value;
 };
 document.getElementById("aspect").oninput = function(event) {
     aspect = event.target.value;
 };


// problem 6:
 document.getElementById("lx").oninput = function(event) {
    lx = event.target.value;
    gl.uniform1f( gl.getUniformLocation(program, "lx"), lx);
 };
 document.getElementById("ly").oninput = function(event) {
    ly = event.target.value;
    gl.uniform1f( gl.getUniformLocation(program, "ly"), ly);
 };
 document.getElementById("lz").oninput = function(event) {
    lz = event.target.value;
    gl.uniform1f( gl.getUniformLocation(program, "lz"), lz);
 };


// problem 6 & 7:
gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
   flatten(ambientProduct));
gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
   flatten(diffuseProduct) );
gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
   flatten(specularProduct) );
gl.uniform4fv(gl.getUniformLocation(program, "AmbientProduct"),
   flatten(AmbientProduct));
gl.uniform4fv(gl.getUniformLocation(program, "DiffuseProduct"),
   flatten(DiffuseProduct) );
gl.uniform4fv(gl.getUniformLocation(program, "SpecularProduct"),
   flatten(SpecularProduct) );
gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
   flatten(lightPosition) );
gl.uniform1f(gl.getUniformLocation(program, "shininess"),
          materialShininess);
gl.uniform1f(gl.getUniformLocation(program, "Shininess"),
          materialShininess);

    render();
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
// Problem 1 Implementing a button to change the current rotation direction
    if(flag){
        if (reverse){
            theta[axis] -= 2.0;
        }
        else{
        theta[axis] += 2.0;
        }
    }
        gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(vec4(lx, ly, lz, 0.0)));

//problem 4: implementing the orthographic projection
        modelViewMatrix = lookAt(eye, at , up);
        projectionMatrix = ortho(l, r, b, tt, n, f);

//problem 3: implementing the saling and translation matrices
        modelViewMatrix = mult(modelViewMatrix, scalem(s, s, s));
        modelViewMatrix = mult(modelViewMatrix, translate(tx, ty, tz));

//problem 2: calculating the rotation matrices in the JS file
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], [1, 0, 0] ));
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], [0, 1, 0] ));
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], [0, 0, 1] ));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) )
        gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

//problem 5: implementing perspective view and switching between orthographic and perspective
    if (switchprojection){
        modelViewMatrix = lookAt(eye, at , up);
        projectionMatrix = perspective(fov, aspect, n, f);

//problem 3: implementing the saling and translation matrices
        modelViewMatrix = mult(modelViewMatrix, scalem(s, s, s));
        modelViewMatrix = mult(modelViewMatrix, translate(tx, ty, tz));

//problem 2: calculating the rotation matrices in the JS file
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], [1, 0, 0] ));
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], [0, 1, 0] ));
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], [0, 0, 1] ));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) )
        gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    }
// problem 6 & 7:
    gl.uniform1f(gl.getUniformLocation(program,
       "shadingBool"), shadingBool);
    gl.uniform1f(gl.getUniformLocation(program,
       "Shadingbool"), Shadingbool);
    gl.uniform3fv(thetaLoc, theta);
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    requestAnimFrame(render);

}
