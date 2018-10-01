// Code from Visualizing Data, First Edition, Copyright 2008 Ben Fry.
// Based on the GraphLayout example by Sun Microsystems.
// Modified by tlooy24@gmail.com March 2017


class Edge {
  Node myFeature;
  Node dependentFeature;
  float len;
  int count;
  String dependencyType;

  Edge(Node myFeature, Node dependentFeature, String dependencyType) {
    this.myFeature = myFeature;
    this.dependentFeature = dependentFeature;
    this.dependencyType = dependencyType;
    this.len = 150;
  }
  
  
  void increment() {
    count++;
  }
  
  
  void relax() {
    float vx = dependentFeature.x - myFeature.x;
    float vy = dependentFeature.y - myFeature.y;
    float d = mag(vx, vy);
    if (d > 0) {
      float f = (len - d) / (d * 3);
      float dx = f * vx;
      float dy = f * vy;
      dependentFeature.dx += dx;
      dependentFeature.dy += dy;
      myFeature.dx -= dx;
      myFeature.dy -= dy;
    }
  }


  void draw() {
    stroke(edgeColor);
    strokeWeight(1.0);

    if (dependencyType.equals("predecessor")) {
      drawArrow(myFeature.x, myFeature.y, dependentFeature.x, dependentFeature.y, 8, 0, true);
    } else {
      drawArrow(myFeature.x, myFeature.y, dependentFeature.x, dependentFeature.y, 0, 8, true);
    }    
  }
}
