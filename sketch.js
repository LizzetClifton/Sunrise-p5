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

  mountain1 = new Mountain(600, 1);
  mountain2 = new Mountain(800, 1.5);
  mountain3 = new Mountain(1000, 2);
  mountain4 = new Mountain(1200, 2.5);
}

function draw() {
  backColor = colorSlider.value();
  background(0, 0, backColor);
  noStroke();
  fill(217, 34, 96);
  mountain1.display();

  fill(174, 53, 106);
  mountain2.display();

  fill(120, 61, 92);
  mountain3.display();

  fill(67, 45, 60);
  mountain4.display();

  fill(255, 210, 120)
  sunX = sunSlider.value();
  sunY = -(sunSlider.value());

  ellipse (sunX, (sunY + windowHeight), 100, 100);

  if(sunX > (windowWidth/2)) {
    sunY = -sunY;
  }
}

class Mountain{
  constructor(tempheight, variable) {
    this.h = tempheight;
    this.v = variable;
  }

  display() {
    beginShape();
      vertex(0, height);

      var xoff = 0;
      for (var x = 0; x < width; x++) {
        var y = noise(xoff) * (this.h);
        //vertex(x * (this.v), y);
        vertex(x, y);
        xoff = xoff + 0.004;
      }

      vertex(width, height);
    endShape();
  }
}
