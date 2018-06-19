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
// JSONArray values;

var myFont;
var values = [];
function preload() {
//  myFont = loadFont('./QumpellkaNo12.otf');
  values = loadJSON("http://localhost:8000/Documents/GitHub/Nodes-and-Edges/nodes_and_edges/features.json");
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
//  var values = loadJSONArray("features.json
console.table(values);
console.log("Array Length", values.length);
console.log("values.typeOf", values.typeOf);
//  for (var i = 0; i < values.size(); i++) {
  for (var i = 0; i < values.length(); i++) {
//    JSONObject dependency = values.getJSONObject(i); 
    var dependency = values.getJSONObject(i); 
    addEdge(dependency);  
  }
};

//function addEdge(JSONObject dependency) { 
function addEdge(dependency) { 
  var dependencyType                       = dependency.getString("dependencyType");
  var columnIndex                          = dependency.getInt("columnIndex");

  var myFeature                            = findNode(dependency.getString("myFeatureId"));
  myFeature.name                           = dependency.getString("myFeatureName");
  myFeature.percentDoneByStoryCount        = dependency.getInt("myFeaturePercentDoneByStoryCount");
  myFeature.percentDoneByStoryPlanEstimate = dependency.getInt("myFeaturePercentDoneByStoryPlanEstimate");
  
  myFeature.columnIndex                    = dependency.getInt("columnIndex");  // always override the columnIndex to make sure that it is defined by a myFeature
  myFeature.featureColor                   = myFeatureColor; // override the default feature color if the feature is a 'myFeature'
  myFeature.increment(); 
  
  var dependentFeature                            = findNode(dependency.getString("dependentFeatureId"));
  dependentFeature.name                           = dependency.getString("dependentFeatureName");
  dependentFeature.percentDoneByStoryCount        = dependency.getInt("dependentFeaturePercentDoneByStoryCount");
  dependentFeature.percentDoneByStoryPlanEstimate = dependency.getInt("dependentFeaturePercentDoneByStoryPlanEstimate");
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
  nodeTable.push(n);
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
