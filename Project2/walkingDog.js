"use strict";

var canvas;
var gl;
var program;


var projectionMatrix;
var modelViewMatrix;
var modelViewMatrixLoc;

var instanceMatrix;

var vertices = [

  vec4(-0.5, -0.5,  0.5, 1.0),
  vec4(-0.5,  0.5,  0.5, 1.0),
  vec4( 0.5,  0.5,  0.5, 1.0),
  vec4( 0.5, -0.5,  0.5, 1.0),
  vec4(-0.5, -0.5, -0.5, 1.0),
  vec4(-0.5,  0.5, -0.5, 1.0),
  vec4( 0.5,  0.5, -0.5, 1.0),
  vec4( 0.5, -0.5, -0.5, 1.0),
];

// FLL = Front Left Leg
// FRL = Front Right Leg
// RLL = Rear Left Leg
// RRL = Rear Right Leg

var bodyId     = 0;
var headId     = 1;
var head1Id    = 1;
var head2Id    = 10;
var upperFLLId = 2;
var lowerFLLId = 3;
var upperFRLId = 4;
var lowerFRLId = 5;
var upperRLLId = 6;
var lowerRLLId = 7;
var upperRRLId = 8;
var lowerRRLId = 9;
var tailId     = 11;

// H = Height
// W = Width
// FLH = Front Leg Height
// FLW = Front Leg Width
// RLH = Rear Leg Height
// RLW = Rear Leg Width

var headH    = 1.0;
var headW    = 1.0;
var bodyH    = 1.0;
var bodyW    = 3.0;
var upperFLH = 1.5;
var lowerFLH = 1.0;
var upperFLW = 0.3;
var lowerFLW = 0.3;
var upperRLH = 1.5;
var lowerRLH = 1.0;
var upperRLW = 0.3;
var lowerRLW = 0.3;
var tailH    = 1.5;
var tailW    = 0.3;

// The number of nodes to be created, 1 node for each object constituting
// the body parts
var numNodes = 11;


// Angles of the body parts
// var theta = [0, 0, -80, -25, -80, -25, -80, -25, -80, -25, 180, 140];
var theta = [null, 90, 185, -25, 185, -25, 185, -25, 185, -25, 45, 45];
var numVertices = 24;
// Stacking the modelViewMatrices
var stack = [];
// Figure for each body part to create a node and render it
var figure = [];
for (var i = 0; i<=numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelviewLoc;
var pointsArray = [];

var Sequence;
var speed = 10;


function scale4(a, b, c){
  var result = mat4();
  result[0][0] = a;
  result[1][1] = b;
  result[2][2] = c;
  return result;
}

function createNode(transform, render, sibling, child){
  var node = {
  transform: transform,
  render: render,
  sibling: sibling,
  child: child,
  }
  return node;
}

function initNodes(Id){

    var t = mat4();
    switch(Id){

    case bodyId:
    t = (translate(-10.0, 0.0, 0.0));
    t = mult(t, rotate(theta[bodyId], 0, 1, 0));
    figure[bodyId] = createNode(t, body, null, headId);
    break;

    case headId:
    case head1Id:
    case head2Id:
    t = translate(bodyW*0.5+headW*0.5, 0.5*bodyH, 0.0);
    t = mult(t, rotate(theta[head1Id], 1, 0, 0));
    t = mult(t, rotate(theta[head2Id], 0, 1, 0));
    t = mult(t, translate(0.0, -0.5 * headH, 0.0));
    figure[headId] = createNode(t, head, upperFLLId, null);
    break;

    case upperFLLId:
    t = translate(0.5 * bodyW -(upperFLW), 0.2, -(bodyW/2.0)+0.5*upperFLW);
    t = mult(t, rotate(theta[upperFLLId], 0, 0, 1));
    figure[upperFLLId] = createNode(t, upperFLL, upperFRLId, lowerFLLId);
    break;

    case upperFRLId:
    t = translate(0.5 * bodyW -(upperFLW), 0.2, (bodyW/2.0)-0.5*upperFLW);
    t = mult(t, rotate(theta[upperFRLId], 0, 0, 1));
    figure[upperFRLId] = createNode(t, upperFRL, upperRLLId, lowerFRLId);
    break;

    case upperRLLId:
    t = translate(-(0.5 * bodyW) + upperRLW, 0.2, -(bodyW/2.0)+0.5*upperFLW);
    t = mult(t, rotate(theta[upperRLLId], 0, 0, 1));
    figure[upperRLLId] = createNode(t, upperRLL, upperRRLId, lowerRLLId);
    break;

    case upperRRLId:
    t = translate(-(0.5 * bodyW) + upperRLW, 0.2, (bodyW/2.0)-0.5*upperFLW);
    t = mult(t, rotate(theta[upperRRLId], 0, 0, 1));
    figure[upperRRLId] = createNode(t, upperRRL, tailId, lowerRRLId);
    break;

    case lowerFLLId:

    t = translate(0.0, upperFLH-0.1, 0.0);
    t = mult(t, rotate(theta[lowerFLLId], 0, 0, 1));
    figure[lowerFLLId] = createNode(t, lowerFLL, null, null);
    break;

    case lowerFRLId:
    t = translate(0.0, upperFLH-0.1, 0.0);
    t = mult(t, rotate(theta[lowerFRLId], 0, 0, 1));
    figure[lowerFRLId] = createNode(t, lowerFRL, null, null);
    break;

    case lowerRLLId:
    t = translate(0.0, upperRLH-0.1, 0.0);
    t = mult(t, rotate(theta[lowerRLLId], 0, 0, 1));
    figure[lowerRLLId] = createNode(t, lowerRLL, null, null);
    break;

    case lowerRRLId:
    t = translate(0.0, upperRLH-0.1, 0.0);
    t = mult(t, rotate(theta[lowerRRLId], 0, 0, 1));
    figure[lowerRRLId] = createNode(t, lowerRRL, null, null);
    break;

    case tailId:
    t = translate(-(0.48 * bodyW), bodyH-0.1, 0.0);
    t = mult(t, rotate(theta[tailId], 0, 0, 1));
    figure[tailId] = createNode(t, tail, null, null);
    break;
  }
}

function traverse(Id){

  if(Id == null) return;
  stack.push(modelViewMatrix);
  modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
  figure[Id].render();
  if (figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
  if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function body() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * bodyH, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(bodyW, bodyH, bodyW));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headH, 0.0));
	instanceMatrix = mult(instanceMatrix, scale4(headW, headH, headW));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function upperFLL(){

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperFLH, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(upperFLW, upperFLH, upperFLW));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function lowerFLL(){

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerFLH, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(lowerFLW, lowerFLH, lowerFLW));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function upperFRL(){

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperFLH, 0.0));
	instanceMatrix = mult(instanceMatrix, scale4(upperFLW, upperFLH, upperFLW));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function lowerFRL() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerFLH, 0.0));
	instanceMatrix = mult(instanceMatrix, scale4(lowerFLW, lowerFLH, lowerFLW));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function  upperRLL() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperRLH, 0.0));
	instanceMatrix = mult(instanceMatrix, scale4(upperRLW, upperRLH, upperRLW));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function lowerRLL() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerRLH, 0.0));
	instanceMatrix = mult(instanceMatrix, scale4(lowerRLW, lowerRLH, lowerRLW));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function upperRRL() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperRLH, 0.0));
	instanceMatrix = mult(instanceMatrix, scale4(upperRLW, upperRLH, upperRLW));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function lowerRRL() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerRLH, 0.0));
	instanceMatrix = mult(instanceMatrix, scale4(lowerRLW, lowerRLH, lowerRLW));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function tail() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tailH, 0.0));
	instanceMatrix = mult(instanceMatrix, scale4(tailW, tailH, tailW));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function quad(a, b, c, d){
  pointsArray.push(vertices[a]);
  pointsArray.push(vertices[b]);
  pointsArray.push(vertices[c]);
  pointsArray.push(vertices[d]);
}

function cube(){
  quad(1, 0, 3, 2);
  quad(2, 3, 7, 6);
  quad(3, 0, 4, 7);
  quad(6, 5, 1, 2);
  quad(4, 5, 6, 7);
  quad(5, 4, 0, 1);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    modelViewMatrix = mat4();

    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")
    cube();

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    document.getElementById("slider0").onchange = function(event) {
      theta[bodyId ] = event.target.value;
      initNodes(bodyId);
  };

    document.getElementById("walkButton").onclick = function(){
      clear();
      walk();
      }

    for(i = 0; i<=numNodes; i++) initNodes(i);
    render();
}

function clear(){
    Sequence = 2;
    // theta[bodyId] = 0;
}

function walk()
{
    Sequence = 0;
	// theta[bodyId];
    // initNodes(bodyId);
    setInterval(function(){ walkLoop(); }, speed);
    var i = -10;

function walkLoop()
{
  var t = mat4();
  if (theta[upperFLLId] > 160 && Sequence == 0)
  {
      initNodes(bodyId)
      theta[upperFLLId] -= 1;
      initNodes(upperFLLId);
      theta[upperRLLId] -= 1;
      initNodes(upperRLLId);
      theta[upperFRLId] += 1;
      initNodes(upperFRLId);
      theta[upperRRLId] += 1;
      initNodes(upperRRLId);
      theta[tailId] -= 1;
      initNodes(tailId);
      

      if(theta[bodyId] == 0){
        i += 0.05;
        initNodes(bodyId);
        t = (translate(i, 0.0, 0.0));
        t = mult(t, rotate(theta[bodyId], 0, 1, 0));
        figure[bodyId] = createNode(t, body, null, headId);
      }
        if (i>=9){
           theta[bodyId] = 180;
        }
      if(theta[bodyId] == 180){
        i -= 0.05;
        initNodes(bodyId);
        t = (translate(i, 0.0, 0.0));
        t = mult(t, rotate(theta[bodyId], 0, 1, 0));
        figure[bodyId] = createNode(t, body, null, headId);
      }
        if (i<=-9){
           theta[bodyId] = 0;
        }
      // document.write("------first-------" + i + "-------" + theta[bodyId] + "-------");

      if(theta[upperFLLId] == 160){
        Sequence = 1;
      }
     }

    if (theta[upperFLLId] <= 185 && Sequence == 1)
	{
      theta[upperFLLId] += 1;
      initNodes(upperFLLId);
      theta[upperRLLId] += 1;
      initNodes(upperRLLId);
      theta[upperFRLId] -= 1;
      initNodes(upperFRLId);
      theta[upperRRLId] -= 1;
      initNodes(upperRRLId);
      theta[tailId] += 1;
      initNodes(tailId);
      if(theta[upperFLLId] == 185)
	  {
        Sequence = 0;
   }
  }
 }
}

var render = function() {

        gl.clear( gl.COLOR_BUFFER_BIT );
        traverse(bodyId);
        requestAnimFrame(render);
}
