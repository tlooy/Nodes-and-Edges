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

var nodeCount = 0;
var edgeCount = 0;
// Node[] nodes = new Node[100];
nodes = new Array();
// HashMap nodeTable = new HashMap();
nodeTable = new Map();
var margin = 30; // margin so our Features don't overlap the lines of the columns
var topMargin = 100; // leave room for context and release data
var bottomMargin = 100; // leave room for selected feature details

//Edge[] edges = new Edge[500];
edges = new Array();

// static final color myFeatureColor      = #63B8FF;
var myFeatureColor      = "#63B8FF";
var defaultFeatureColor = "#F0C070";
var selectColor         = "#FF3030";
var fixedColor          = "#FF8080";
var edgeColor           = "#000000";
var arrowHeadColor      = "#000000";
var labelColor          = "#000000";

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
  loadJSONDataToTable();
  createCanvas(1200, 900); 
//  font = createFont("SansSerif", 10);

  strokeWeight(1.5);
  
  stroke(100, 100, 100);
  fill(100, 100, 100);
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
    var dependency = featureTable[i]; 
    addEdge(dependency);  
  }
};

function addEdge(dependency) { 
  var dependencyType                       = dependency["dependencyType"];
  var columnIndex                          = dependency["columnIndex"];

  var myFeature                            = findNode(dependency["myFeatureId"]);
  myFeature.name                           = dependency["myFeatureName"];
  myFeature.percentDoneByStoryCount        = dependency["myFeaturePercentDoneByStoryCount"];
  myFeature.percentDoneByStoryPlanEstimate = dependency["myFeaturePercentDoneByStoryPlanEstimate"];
  
  myFeature.columnIndex                    = dependency["columnIndex"];  // always override the columnIndex to make sure that it is defined by a myFeature
  myFeature.featureColor                   = myFeatureColor; // override the default feature color if the feature is a 'myFeature'
  myFeature.x = myFeature.y = myFeature.dx = myFeature.dy = 0;
  myFeature.increment(); 
  
  var dependentFeature                            = findNode(dependency["dependentFeatureId"]);
  dependentFeature.name                           = dependency["dependentFeatureName"];
  dependentFeature.percentDoneByStoryCount        = dependency["dependentFeaturePercentDoneByStoryCount"];
  dependentFeature.percentDoneByStoryPlanEstimate = dependency["dependentFeaturePercentDoneByStoryPlanEstimate"];
  if (dependentFeature.columnIndex == 0) {        // only set the columnIndex for a dependent Feature if it doesn't have one yet... 
      dependentFeature.columnIndex = columnIndex; // never override as the Feature my be a myFeature with a different columnIndex
  }
  // TODO: do I get any value from knowing the number of times a Feature is referenced?  
  dependentFeature.x = dependentFeature.y = dependentFeature.dx = dependentFeature.dy = 0;
  dependentFeature.increment();

// TODO: do I get any value from counting the number of times an edge is created?  
console.log("self.edgeCount", self.edgeCount);
console.log("self.edges", self.edges);
  for (var i = 0; i < self.edgeCount; i++) {
    if (self.edges[i].myFeature == myFeature && self.edges[i].dependentFeature == dependentFeature) {
      self.edges[i].increment();
      return;
    }
  } 
  
  var e = new Edge(myFeature, dependentFeature, dependencyType);
  e.increment();
  self.edges.push(e);
  self.edgeCount++;
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
  line(width/2,   0, width/2,   height);

//  for (var i = 0 ; i < edgeCount ; i++) {
  for (var i = 0 ; i < self.edges.length ; i++) {
    self.edges[i].relax();
  }
  for (var i = 0 ; i < self.nodes.length ; i++) {
    nodes[i].relax();
  }
  for (var i = 0 ; i < self.nodes.length ; i++) {
    nodes[i].update();
  }
  for (var i = 0 ; i < self.nodes.length ; i++) {
    nodes[i].draw();
  }
  for (var i = 0 ; i < self.edges.length ; i++) {
    edges[i].draw();
  }
};


// Node selection; 
var selection; 

function mousePressed() { 
  // Ignore anything greater than this distance
  var closest = 20;
//  for (var i = 0; i < nodeCount; i++) {
  for (var i = 0; i < nodes.length; i++) {
//    Node n = nodes[i];
    var n = nodes[i];
    var d = dist(mouseX, mouseY, n.x, n.y);
    if (d < closest) {
      self.selection = n;
      closest = d;
    }
  }
  if (self.selection != null) {
    if (mouseButton == LEFT) {
      self.selection.fixed = true;
      self.selection.selected = true;
    } else if (mouseButton == RIGHT) {
      self.selection.fixed = false;
    }
  }
};

function mouseClicked() {
  // Ignore anything greater than this distance
  var closest = 20;
  for (var i = 0; i < nodes.length; i++) {
//    Node n = nodes[i];
    var n = nodes[i];
    var d = dist(mouseX, mouseY, n.x, n.y);
    if (d < closest) {
      self.selection = n;
      closest = d;
      self.selection.selected = true;
/*      
      showMessageDialog(null, selection.featureId + ": " + selection.name + 
                              "\nPercent Complete by Story Points: " + selection.percentDoneByStoryPlanEstimate + "%" +
                              "\nPercent Complete by Story Count: "  + selection.percentDoneByStoryCount + "%");
*/
      alert(self.selection.featureId + ": " + self.selection.name + 
            "\nPercent Complete by Story Points: " + self.selection.percentDoneByStoryPlanEstimate + "%" +
            "\nPercent Complete by Story Count: "  + self.selection.percentDoneByStoryCount + "%");
    }
  }
};

function mouseDragged() { 
  if (self.selection != null) {
    self.selection.x = mouseX;
    self.selection.y = mouseY;
    
    switch (self.selection.columnIndex) { // this where we put the code to keep nodes in their columns and inside the margins
      case 1:  self.selection.x = constrain(self.selection.x, 0 + margin, (width/2) - margin); break;
      case 2:  self.selection.x = constrain(self.selection.x, (width/2) + margin, width - margin); break;
      default: self.selection.x = constrain(self.selection.x, 0 + margin, width - margin);
    };
    self.selection.y = constrain(self.selection.y, 0 + topMargin, height - bottomMargin);
    
  }
};

function mouseReleased() {
  self.selection = null;
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
    this.featureColor = self.defaultFeatureColor;

    var name;
    var percentDoneByStoryCount;
    var percentDoneByStoryPlanEstimate;
//    var featureColor;
  
    var x, y; //float 
    var dx, dy; //float 
    var fixed; // boolean
    var selected; // boolean
    var count;
    var columnIndex = 0;

    switch (columnIndex) {
      case 1:  x = random(0 + margin, (width/2) - margin); break;
      case 2:  x = random((width/2) + margin, width - margin); break;
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
      this.dx += ddx / dlen;
      this.dy += ddy / dlen;
    }
};


Node.prototype.update = function() {
    if (!this.fixed) {      
      this.x += constrain(this.dx, -5, 5);
      this.y += constrain(this.dy, -5, 5);
      
      switch (this.columnIndex) {
        case 1:  this.x = constrain(this.x, 0 + margin, (width/2) - margin); break;
        case 2:  this.x = constrain(this.x, (width/2) + margin, width - margin); break;
        default: this.x = constrain(this.x, 0 + margin, width - margin);
      };
      this.y = constrain(this.y, 0 + topMargin, height - bottomMargin);
    }
    this.dx /= 2;
    this.dy /= 2;
};


Node.prototype.draw = function() {
    fill(this.featureColor);
    stroke(0);
    if (this.selected) {
      strokeWeight(1.5);
    } else {
    strokeWeight(0.5);
  }
    
    ellipse(this.x, this.y, 50, 50); // make all Features the same size
    console.log("self.labelColor", self.labelColor);
    fill(self.labelColor);
//    fill(0,0,0,0);
    textAlign(CENTER, BOTTOM);
    text(this.featureId, this.x, this.y);

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
  var vx = this.dependentFeature.x - this.myFeature.x;
  var vy = this.dependentFeature.y - this.myFeature.y;
  var d = mag(vx, vy);
  if (d > 0) {
    var f = (this.len - d) / (d * 3);
    var dx = f * vx;
    var dy = f * vy;
    this.dependentFeature.dx += dx;
    this.dependentFeature.dy += dy;
    this.myFeature.dx -= dx;
    this.myFeature.dy -= dy;
  }
};


Edge.prototype.draw = function() {
  stroke(self.edgeColor);
  strokeWeight(1.0);

  if (this.dependencyType === "predecessor") {
    drawArrow(this.myFeature.x, this.myFeature.y, this.dependentFeature.x, this.dependentFeature.y, 8, 0, true);
  } else {
    drawArrow(this.myFeature.x, this.myFeature.y, this.dependentFeature.x, this.dependentFeature.y, 0, 8, true);
  }    
};

function drawArrow(x0, y0, x1, y1, beginHeadSize, endHeadSize, filled) {
  var d = new p5.Vector(x1 - x0, y1 - y0);
  d.normalize();
  
  var coeff = 1.5; // float
  
  strokeCap(SQUARE);
  
  line( x0+d.x*beginHeadSize*coeff / (filled ? 1.0 : 1.75), 
        y0+d.y*beginHeadSize*coeff / (filled ? 1.0 : 1.75), 
        x1-d.x*endHeadSize*coeff   / (filled ? 1.0 : 1.75), 
        y1-d.y*endHeadSize*coeff   / (filled ? 1.0 : 1.75));
  
  var angle = atan2(d.y, d.x);
  
  if (filled) {
    // begin head
//    pushMatrix();
    push();
//    translate(x0, y0);
    translate((x0 + x1)/2, (y0 + y1)/2); //  move the arrow to the middle of the line

    rotate(angle+PI);

    beginShape();
    fill(self.arrowHeadColor);
    triangle(-beginHeadSize*coeff, -beginHeadSize, 
             -beginHeadSize*coeff, beginHeadSize, 
             0, 0);
    endShape();
    
//    popMatrix();
    pop();
    // end head
//    pushMatrix();
    push();
//    translate(x1, y1);
    translate((x0 + x1)/2, (y0 + y1)/2); //  move the arrow to the middle of the line
    rotate(angle);
    triangle(-endHeadSize*coeff, -endHeadSize, 
             -endHeadSize*coeff, endHeadSize, 
             0, 0);
//    popMatrix();
    pop();
  } 
  else {
    // begin head
//    pushMatrix();
    push();
    translate(x0, y0);
    rotate(angle+PI);
    strokeCap(ROUND);
    line(-beginHeadSize*coeff, -beginHeadSize, 0, 0);
    line(-beginHeadSize*coeff, beginHeadSize, 0, 0);
//    popMatrix();
    pop();
    // end head
//    pushMatrix();
    push();
    translate(x1, y1);
    rotate(angle);
    strokeCap(ROUND);
    line(-endHeadSize*coeff, -endHeadSize, 0, 0);
    line(-endHeadSize*coeff, endHeadSize, 0, 0);
//    popMatrix();
    pop();
  }
};

