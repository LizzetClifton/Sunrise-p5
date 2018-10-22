var sunSlider;
var sunX;
var sunY;
var colorSlider;

function setup() {
  createCanvas(windowWidth, windowHeight);
  sunSlider = createSlider(0, windowWidth, 0);
  sunSlider.position(200, 200);
  colorSlider = createSlider(0, 145);
  colorSlider.position(200, 300);
}

function draw() {
  backColor = colorSlider.value();
  background(0, 0, backColor);
  stroke(255);
  noFill();
  beginShape();
  var xoff = 0;
  for (var x = 0; x < width; x ++) {
    stroke(255);
    var y = noise(xoff) * (height);
    vertex(x, y);
    xoff = xoff + 0.004;
  }
  endShape();


  sunX = sunSlider.value();
  sunY = -(sunSlider.value());

  ellipse (sunX, (sunY + windowHeight), 100, 100);

  if(sunX > (windowWidth/2)) {
    sunY = -sunY;
  }

}
