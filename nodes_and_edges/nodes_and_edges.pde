// Code from Visualizing Data, First Edition, Copyright 2008 Ben Fry.
// Based on the GraphLayout example by Sun Microsystems.
// Modified by tlooy24@gmail.com March 2017
// Added to GitHub repo June 3, 2018
// TODO:
//      Unselect a selected Feature
//      Allow a selected Feature in each column
//      Parse multi level JSON file - parent to contain column data: column number, context and release
//      replace swing message object with text from the selected Feature at the bottom of the column

import static javax.swing.JOptionPane.*;

int nodeCount;
Node[] nodes = new Node[100];
HashMap nodeTable = new HashMap();
int margin = 30; // margin so our Features don't overlap the lines of the columns
int topMargin = 100; // leave room for context and release data
int bottomMargin = 100; // leave room for selected feature details



int edgeCount;
Edge[] edges = new Edge[500];

static final color myFeatureColor      = #63B8FF;
static final color defaultFeatureColor = #F0C070;
static final color selectColor         = #FF3030;
static final color fixedColor          = #FF8080;
static final color edgeColor           = #000000;
static final color arrowHeadColor      = #000000;
static final color labelColor          = #000000;

PFont font;
JSONArray values;

void setup() {
  size(1200, 900);  
  font = createFont("SansSerif", 10);

  strokeWeight(1.5);
  
  stroke(100, 100, 100);
  fill(100, 100, 100);
  loadJSONDataFromFile();
}

void loadJSONDataFromFile() {
  values = loadJSONArray("features.json");
  for (int i = 0; i < values.size(); i++) {
    JSONObject dependency = values.getJSONObject(i); 
    addEdge(dependency);  }
}

void addEdge(JSONObject dependency) {
  String dependencyType                    = dependency.getString("dependencyType");
  int columnIndex                          = dependency.getInt("columnIndex");

  Node myFeature                  = findNode(dependency.getString("myFeatureId"));
  myFeature.name                           = dependency.getString("myFeatureName");
  myFeature.percentDoneByStoryCount        = dependency.getInt("myFeaturePercentDoneByStoryCount");
  myFeature.percentDoneByStoryPlanEstimate = dependency.getInt("myFeaturePercentDoneByStoryPlanEstimate");
  
  myFeature.columnIndex                    = dependency.getInt("columnIndex");  // always override the columnIndex to make sure that it is defined by a myFeature
  myFeature.featureColor                   = myFeatureColor; // override the default feature color if the feature is a 'myFeature'
  myFeature.increment(); 
  
  Node dependentFeature                  = findNode(dependency.getString("dependentFeatureId"));
  dependentFeature.name                           = dependency.getString("dependentFeatureName");
  dependentFeature.percentDoneByStoryCount        = dependency.getInt("dependentFeaturePercentDoneByStoryCount");
  dependentFeature.percentDoneByStoryPlanEstimate = dependency.getInt("dependentFeaturePercentDoneByStoryPlanEstimate");
  if (dependentFeature.columnIndex == 0) {        // only set the columnIndex for a dependent Feature if it doesn't have one yet... 
      dependentFeature.columnIndex = columnIndex; // never override as the Feature my be a myFeature with a different columnIndex
  }
  
// TODO: do I get any value from knowing the number of times a Feature is referenced?  
  dependentFeature.increment();

// TODO: do I get any value from counting the number of times an edge is created?  
  for (int i = 0; i < edgeCount; i++) {
    if (edges[i].myFeature == myFeature && edges[i].dependentFeature == dependentFeature) {
      edges[i].increment();
      return;
    }
  } 
  
  Edge e = new Edge(myFeature, dependentFeature, dependencyType);
  e.increment();
  if (edgeCount == edges.length) {
    edges = (Edge[]) expand(edges);
  }
  edges[edgeCount++] = e;
}


Node findNode(String featureId) {
  Node n = (Node) nodeTable.get(featureId);
  if (n == null) {
    return addNode(featureId);
  }
  return n;
}


Node addNode(String featureId) {
  Node n = new Node(featureId);  
  if (nodeCount == nodes.length) {
    nodes = (Node[]) expand(nodes);
  }
  nodeTable.put(featureId, n);
  nodes[nodeCount++] = n;  
  return n;
}


void draw() {
  background(255);
  textFont(font);  
  smooth();  
  line(width/3,   0, width/3,   height);
  line(width/1.5, 0, width/1.5, height);

  for (int i = 0 ; i < edgeCount ; i++) {
    edges[i].relax();
  }
  for (int i = 0; i < nodeCount; i++) {
    nodes[i].relax();
  }
  for (int i = 0; i < nodeCount; i++) {
    nodes[i].update();
  }
  for (int i = 0 ; i < nodeCount ; i++) {
    nodes[i].draw();
  }
  for (int i = 0 ; i < edgeCount ; i++) {
    edges[i].draw();
  }
}


Node selection; 

void mousePressed() {
  // Ignore anything greater than this distance
  float closest = 20;
  for (int i = 0; i < nodeCount; i++) {
    Node n = nodes[i];
    float d = dist(mouseX, mouseY, n.x, n.y);
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
}

void mouseClicked() {
  // Ignore anything greater than this distance
  float closest = 20;
  for (int i = 0; i < nodeCount; i++) {
    Node n = nodes[i];
    float d = dist(mouseX, mouseY, n.x, n.y);
    if (d < closest) {
      selection = n;
      closest = d;
      selection.selected = true;
      showMessageDialog(null, selection.featureId + ": " + selection.name + 
                              "\nPercent Complete by Story Points: " + selection.percentDoneByStoryPlanEstimate + "%" +
                              "\nPercent Complete by Story Count: "  + selection.percentDoneByStoryCount + "%");
    }
  }
}

void mouseDragged() { 
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
}

void mouseReleased() {
  selection = null;
}
