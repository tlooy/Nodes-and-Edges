// Code from Visualizing Data, First Edition, Copyright 2008 Ben Fry.
// Based on the GraphLayout example by Sun Microsystems.
// Modified by tlooy24@gmail.com March 2017
// TODO:
//      Unselect a selected Feature
//      Allow a selected Feature in each column
//      Parse multi level JSON file - parent to contain column data: column number, context and release
//      replace swing message object with text from the selected Feature at the bottom of the column


// As part of the conversion to p5 (JavaScript):
//    changed all void methods to function
//    changed size to createCanvas in conversion to p5  
//    changed int and float to var
//    changed the way that Arrays are created
//    removed the swing Pane component and replaced it with a JavaScript dialog box
//    changed Java hashMap to Javascript Map
//    changed static final color to var
//    changed appending new edge to an array using 'push' 
//    added preload to get fonts loaded before setup is run
// import static javax.swing.JOptionPane.*;

var nodeCount;
// Node[] nodes = new Node[100];
nodes = new Array(100);
// HashMap nodeTable = new HashMap();
nodeTable = new Map();
var margin = 30; // margin so our Features don't overlap the lines of the columns
var topMargin = 100; // leave room for context and release data
var bottomMargin = 100; // leave room for selected feature details



var edgeCount;
//Edge[] edges = new Edge[500];
edges = new Array(500);

// static final color myFeatureColor      = #63B8FF;
var myFeatureColor      = "63B8FF";
var defaultFeatureColor = "F0C070";
var selectColor         = "FF3030";
var fixedColor          = "FF8080";
var edgeColor           = "000000";
var arrowHeadColor      = "000000";
var labelColor          = "000000";

// PFont font;
// JSONArray featureValues;
var self = this;
var myFont;
var featureValues = [];

function preload() {
//  myFont = loadFont('./QumpellkaNo12.otf');
  self.featureValues = loadJSON("http://localhost:8000/Documents/GitHub/Nodes-and-Edges/nodes_and_edges/features.json");
};

function setup() { 
  createCanvas(1200, 900); 
//  font = createFont("SansSerif", 10);

  strokeWeight(1.5);
  
  stroke(100, 100, 100);
  fill(100, 100, 100);
  loadJSONDataToTable();
};

function loadJSONDataToTable() { 
  console.table(self.featureValues);
  var featureTable;
  for (var key in self.featureValues) {
    if (!featureTable) {
      featureTable = [self.featureValues[key]];
    } else {
      featureTable.push(self.featureValues[key]);
    }
  }
  for (var i = 0; i < featureTable.length; i++) {
console.log("In for loop", featureTable[i]);
    var dependency = featureTable[i]; 
//    var dependency = JSON.parse(featureTable[i]); 
    addEdge(dependency);  
  }
};

//function addEdge(JSONObject dependency) { 
function addEdge(dependency) { 
  var dependencyType                       = dependency["dependencyType"];
  var columnIndex                          = dependency["columnIndex"];

  var myFeature                            = findNode(dependency["myFeatureId"]);
  myFeature.name                           = dependency["myFeatureName"];
  myFeature.percentDoneByStoryCount        = dependency["myFeaturePercentDoneByStoryCount"];
  myFeature.percentDoneByStoryPlanEstimate = dependency["myFeaturePercentDoneByStoryPlanEstimate"];
  
  myFeature.columnIndex                    = dependency["columnIndex"];  // always override the columnIndex to make sure that it is defined by a myFeature
  myFeature.featureColor                   = myFeatureColor; // override the default feature color if the feature is a 'myFeature'
  myFeature.increment(); 
  
  var dependentFeature                            = findNode(dependency["dependentFeatureId"]);
  dependentFeature.name                           = dependency["dependentFeatureName"];
  dependentFeature.percentDoneByStoryCount        = dependency["dependentFeaturePercentDoneByStoryCount"];
  dependentFeature.percentDoneByStoryPlanEstimate = dependency["dependentFeaturePercentDoneByStoryPlanEstimate"];
  if (dependentFeature.columnIndex == 0) {        // only set the columnIndex for a dependent Feature if it doesn't have one yet... 
      dependentFeature.columnIndex = columnIndex; // never override as the Feature my be a myFeature with a different columnIndex
  }
  
// TODO: do I get any value from knowing the number of times a Feature is referenced?  
  dependentFeature.increment();

// TODO: do I get any value from counting the number of times an edge is created?  
  for (var i = 0; i < edgeCount; i++) {
    if (edges[i].myFeature == myFeature && edges[i].dependentFeature == dependentFeature) {
      edges[i].increment();
      return;
    }
  } 
  
  var e = new Edge(myFeature, dependentFeature, dependencyType);
  e.increment();
  edges.push(e);
/*
  if (edgeCount == edges.length) {
    edges = (Edge[]) expand(edges);
  }
  edges[edgeCount++] = e;
*/
}


// Node findNode(featureId) {
function findNode(featureId) {
  var n = nodeTable.get(featureId);
  if (n == null) {
    return addNode(featureId);
  }
  return n;
};


// Node addNode(String featureId) {
function addNode(featureId) {
  var n = new Node(featureId);  
/*
  if (nodeCount == nodes.length) {
    nodes = (Node[]) expand(nodes);
  }
*/
//  nodeTable.put(featureId, n);
  nodeTable.set(featureId, n);
//  nodes[nodeCount++] = n;  
  nodes.push(n);  
  return n;
};


function draw() { 
  background(255);
//  textFont(myFont);  
  smooth();  
  line(width/3,   0, width/3,   height);
  line(width/1.5, 0, width/1.5, height);

  for (var i = 0 ; i < edgeCount ; i++) {
    edges[i].relax();
  }
  for (var i = 0; i < nodeCount; i++) {
    nodes[i].relax();
  }
  for (var i = 0; i < nodeCount; i++) {
    nodes[i].update();
  }
  for (var i = 0 ; i < nodeCount ; i++) {
    nodes[i].draw();
  }
  for (var i = 0 ; i < edgeCount ; i++) {
    edges[i].draw();
  }
};


// Node selection; 
var selection; 

function mousePressed() { 
  // Ignore anything greater than this distance
  var closest = 20;
  for (var i = 0; i < nodeCount; i++) {
//    Node n = nodes[i];
    var n = nodes[i];
    var d = dist(mouseX, mouseY, n.x, n.y);
    if (d < closest) {
      selection = n;
      closest = d;
    }
  }
  if (selection != null) {
    if (mouseButton == LEFT) {
      selection.fixed = true;
      selection.selected = true;
    } else if (mouseButton == RIGHT) {
      selection.fixed = false;
    }
  }
};

function mouseClicked() {
  // Ignore anything greater than this distance
  var closest = 20;
  for (var i = 0; i < nodeCount; i++) {
//    Node n = nodes[i];
    var n = nodes[i];
    var d = dist(mouseX, mouseY, n.x, n.y);
    if (d < closest) {
      selection = n;
      closest = d;
      selection.selected = true;
/*      
      showMessageDialog(null, selection.featureId + ": " + selection.name + 
                              "\nPercent Complete by Story Points: " + selection.percentDoneByStoryPlanEstimate + "%" +
                              "\nPercent Complete by Story Count: "  + selection.percentDoneByStoryCount + "%");
*/
      alert(selection.featureId + ": " + selection.name + 
            "\nPercent Complete by Story Points: " + selection.percentDoneByStoryPlanEstimate + "%" +
            "\nPercent Complete by Story Count: "  + selection.percentDoneByStoryCount + "%");
    }
  }
};

function mouseDragged() { 
  if (selection != null) {
    selection.x = mouseX;
    selection.y = mouseY;
    
    switch (selection.columnIndex) { // this where we put the code to keep nodes in their columns and inside the margins
      case 1:  selection.x = constrain(selection.x, 0 + margin, (width/3) - margin); break;
      case 2:  selection.x = constrain(selection.x, (width/3) + margin, (width/1.5) - margin); break;
      case 3:  selection.x = constrain(selection.x, (width/1.5) + margin, width - margin); break;
      default: selection.x = constrain(selection.x, 0 + margin, width - margin);
    };
    selection.y = constrain(selection.y, 0 + topMargin, height - bottomMargin);
    
  }
};

function mouseReleased() {
  selection = null;
};


/* class Node
class Node {
  String featureId;
  String name;
  var percentDoneByStoryCount;
  var percentDoneByStoryPlanEstimate;
  color featureColor;
  
  float x, y;
  float dx, dy;
  boolean fixed;
  boolean selected;
  var count;
  var columnIndex = 0;
*/

function Node(label) {
    this.featureId = label;
    this.featureColor = defaultFeatureColor;

    var name;
    var percentDoneByStoryCount;
    var percentDoneByStoryPlanEstimate;
    var featureColor;
  
    var x, y; //float 
    var dx, dy; //float 
    var fixed; // boolean
    var selected; // boolean
    var count;
    var columnIndex = 0;

    switch (columnIndex) {
      case 1:  x = random(0 + margin, (width/3) - margin); break;
      case 2:  x = random((width/3) + margin, (width/1.5) - margin); break;
      case 3:  x = random((width/1.5) + margin, width - margin); break;
      default: x = random(0 + margin, width - margin);
    };
    y = random(0 + topMargin, height - bottomMargin);
};
    
Node.prototype.increment = function() {
    this.count++;
};
  
  
Node.prototype.relax = function() {
    ddx = 0; // float
    ddy = 0; // float

    for (var j = 0; j < nodeCount; j++) {
//      Node n = nodes[j]; 
      n = nodes[j]; 
      if (n != this) {
        vx = x - n.x; // float
        vy = y - n.y; // float
        lensq = vx * vx + vy * vy; // float
        if (lensq == 0) {
          ddx += random(1);
          ddy += random(1);
        } else if (lensq < 100*100) {
          ddx += vx / lensq;
          ddy += vy / lensq;
        }
      }
    }
    dlen = mag(ddx, ddy) / 2; // float
    if (dlen > 0) {
      dx += ddx / dlen;
      dy += ddy / dlen;
    }
};


Node.prototype.update = function() {
    if (!fixed) {      
      x += constrain(dx, -5, 5);
      y += constrain(dy, -5, 5);
      
      switch (columnIndex) {
        case 1:  x = constrain(x, 0 + margin, (width/3) - margin); break;
        case 2:  x = constrain(x, (width/3) + margin, (width/1.5) - margin); break;
        case 3:  x = constrain(x, (width/1.5) + margin, width - margin); break;
        default: x = constrain(x, 0 + margin, width - margin);
      };
      y = constrain(y, 0 + topMargin, height - bottomMargin);
    }
    dx /= 2;
    dy /= 2;
};


Node.prototype.draw = function() {
    fill(featureColor);
    stroke(0);
    if (selected) {
      strokeWeight(1.5);
    } else {
    strokeWeight(0.5);
  }
    
    ellipse(x, y, 50, 50); // make all Features the same size
    fill(labelColor);
    textAlign(CENTER, BOTTOM);
    text(featureId, x, y);

};

function Edge(myFeature, dependentFeature, dependencyType) {
  var myFeature; // Node
  var dependentFeature; // Node
  var len; // float
  var count;
  var dependencyType;

//  Edge(Node myFeature, Node dependentFeature, String dependencyType) {
//  Edge(myFeature, dependentFeature, dependencyType) {
    this.myFeature = myFeature;
    this.dependentFeature = dependentFeature;
    this.dependencyType = dependencyType;
    this.len = 150;
//  }
};  
  
Edge.prototype.increment = function() {
  this.count++;
};
  
  
Edge.prototype.relax = function() {
  var vx = dependentFeature.x - myFeature.x;
  var vy = dependentFeature.y - myFeature.y;
  var d = mag(vx, vy);
  if (d > 0) {
    var f = (len - d) / (d * 3);
    var dx = f * vx;
    var dy = f * vy;
    dependentFeature.dx += dx;
    dependentFeature.dy += dy;
    myFeature.dx -= dx;
    myFeature.dy -= dy;
  }
};


Edge.prototype.draw = function() {
  stroke(edgeColor);
  strokeWeight(1.0);

  if (dependencyType.equals("predecessor")) {
    drawArrow(myFeature.x, myFeature.y, dependentFeature.x, dependentFeature.y, 8, 0, false);
  } else {
    drawArrow(myFeature.x, myFeature.y, dependentFeature.x, dependentFeature.y, 0, 8, false);
  }    
};
