"use strict";

var canvas;
var gl;
var program;

var speed = 10;
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

var headId     = 0;
var headId1    = 0;
var headId2    = 1;
var bodyId     = 2;
var upperFLLId = 3;
var lowerFLLId = 4;
var upperFRLId = 5;
var lowerFRLId = 6;
var upperRLLId = 7;
var lowerRLLId = 8;
var upperRRLId = 9;
var lowerRRLId = 10;
var tailId     = 11;

// H = Height
// W = Width
// FLH = Front Leg Height
// FLW = Front Leg Width
// RLH = Rear Leg Height
// RLW = Rear Leg Width

var headH    = 1.5;
var headW    = 1.0;
var bodyH    = 5.0;
var bodyW    = 1.0;
var upperFLH = 2.5;
var lowerFLH = 1.5;
var upperFLW = 0.5;
var lowerFLW = 0.5;
var upperRLH = 2.5;
var lowerRLH = 1.5;
var upperRLW = 0.5;
var lowerRLW = 0.5;
var tailH    = 2.5;
var tailW    = 0.3;

// The number of nodes to be created, 1 node for each object constituting
// the body parts
var numNodes = 11;
// Angles of the body parts
var theta = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var numVertices = 24;
// Stacking the modelViewMatrices
var stack = [];
// Figure for each body part to create a node and render it
var figure = [];
for (var i = 0; i<=numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelviewLoc;
var pointsArray = [];


function scale4(a, b, c){
  var result = mat4();
  result[0][0] = a;
  result[1][1] = b;
  result[2][2] = c;
}


function createNode(transformation, render, related, child){
  var node = {
  transformation: transformation;
  render: render;
  related: related;
  child: child;
  }
  return node;
}

function initNodes(Id){

  var t = mat4();
  switch(Id){

    case headId:
    case head1Id:
    case head2Id:
    t = translate(0.0, bodyH + 0.5 * headH, 0.5);
  t = mult(t, rotate(theta[head1Id], 1, 0, 0));
  t = mult(t, rotate(theta[head2Id], 0, 1, 0));
    t = mult(t, translate(0.0, -0.5 * headH, 0.0));
    figure[headId] = createNode(t, head, upperFLLId, null);
    break;

    case bodyId:
    t = rotate(theta[bodyId], 1, 1, 1);
    figure[bodyId] = createNode(t, body, null, headId);
    break;

    case upperFLLId:
    t = translate(-(bodyW + upperFLW), 0.9*bodyH, 0.0);
  t = mult(t, rotate(theta[upperFLLId], 1, 0, 0));
    figure[upperFLLId] = createNode(t, upperFLL, upperFRLId, lowerFLLId);
    break;




  }



}
