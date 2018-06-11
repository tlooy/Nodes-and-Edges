// Code from Visualizing Data, First Edition, Copyright 2008 Ben Fry.
// Based on the GraphLayout example by Sun Microsystems.
// Modified by tlooy24@gmail.com March 2017


class Node {
  String featureId;
  String name;
  int percentDoneByStoryCount;
  int percentDoneByStoryPlanEstimate;
  color featureColor;
  
  float x, y;
  float dx, dy;
  boolean fixed;
  boolean selected;
  int count;
  int columnIndex = 0;


  Node(String label) {
    this.featureId = label;
    this.featureColor = defaultFeatureColor;

    switch (columnIndex) {
      case 1:  x = random(0 + margin, (width/3) - margin); break;
      case 2:  x = random((width/3) + margin, (width/1.5) - margin); break;
      case 3:  x = random((width/1.5) + margin, width - margin); break;
      default: x = random(0 + margin, width - margin);
    };
    y = random(0 + topMargin, height - bottomMargin);
  }
    
  void increment() {
    count++;
  }
  
  
  void relax() {
    float ddx = 0;
    float ddy = 0;

    for (int j = 0; j < nodeCount; j++) {
      Node n = nodes[j];
      if (n != this) {
        float vx = x - n.x;
        float vy = y - n.y;
        float lensq = vx * vx + vy * vy;
        if (lensq == 0) {
          ddx += random(1);
          ddy += random(1);
        } else if (lensq < 100*100) {
          ddx += vx / lensq;
          ddy += vy / lensq;
        }
      }
    }
    float dlen = mag(ddx, ddy) / 2;
    if (dlen > 0) {
      dx += ddx / dlen;
      dy += ddy / dlen;
    }
  }


  void update() {
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
  }


  void draw() {
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

  }
}
