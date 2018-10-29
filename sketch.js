var sunSlider;
var sunX;
var sunY;
var colorSlider;

let mountain1;
let mountain2;

function setup() {
  createCanvas(windowWidth, windowHeight);
  sunSlider = createSlider(0, windowWidth, 0);
  sunSlider.position(200, 200);
  colorSlider = createSlider(0, 145);
  colorSlider.position(200, 300);

  mountain1 = new Mountain(120);
  mountain2 = new Mountain(500);
}

function draw() {
  backColor = colorSlider.value();
  background(0, 0, backColor);
  stroke(255);
  fill(0, 0, 255);

  mountain1.display();
  fill(255, 0, 0);
  mountain2.display();

  fill(255, 210, 120)

  sunX = sunSlider.value();
  sunY = -(sunSlider.value());

  ellipse (sunX, (sunY + windowHeight), 100, 100);

  if(sunX > (windowWidth/2)) {
    sunY = -sunY;
  }
}


class Mountain{
  constructor(tempheight) {
    this.h = tempheight;
  }


  display() {
    beginShape();
      // var xoff = 0;
      // for (var x = 0; x < width; x ++) {
      //   stroke(255);
      //   var y = noise(xoff) * (height);
      //   vertex(x, y);
      //   xoff = xoff + 0.004;
      // }

      //starts at bottom left



      curveVertex(0, height);
      curveVertex(0, height);
      //goes to

      curveVertex(width, height);

      curveVertex(width, height/2);

      // var randomx = 0;
      //
      // for (var x = 0; x < width; x ++) {
      //   stroke(255);
      //   var y = noise(randomx) * (height);
      //   curveVertex(x, y);
      //   randomx = randomx + 0.004;
      //  }


      curveVertex(width, this.h);

      curveVertex(0, height/2);

      curveVertex(0, height);
      curveVertex(0, height);

      endShape();
  }
}
