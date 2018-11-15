var hostname = "mqtt.colab.duke.edu";
var port = 9001;
var xpos;
var ypos;

var theta = 0;

var sunSlider;
var sunX;
var sunY;
var colorSlider;

//var star;

var numStars = 80;

var stars = [];

// let mountain1;
// let mountain2;

var b1, b2, c1, c2;

let clouds;

function preload() {
  clouds = loadImage('./images/cloud.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  client = new Paho.MQTT.Client(hostname, port, "", "Lizzet");
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived; // msg parsing callback
  // connect the client using SSL and trigger onConnect callback
  client.connect({
    onSuccess: onConnect,
    useSSL: true
  });

  //sunSlider = createSlider(0, windowWidth, 0);
  sunSlider = createSlider(0, 255, 100);
  sunSlider.position(200, 200);
  colorSlider = createSlider(0, 145);
  colorSlider.position(200, 300);

  mountain1 = new Mountain(600, 0.004);
  mountain2 = new Mountain(800, 0.005);
  mountain3 = new Mountain(1000, 0.002);
  mountain4 = new Mountain(1200, 0.003);

  b1 = color(255);
  b2 = color(0);
  c1 = color(239, 124, 139);
  c2 = color(250, 152, 113);

  for (var s = 0; s < numStars; s++) {
   stars[s] = new Star(random(width), random(height));
  }
//star1 = new Star(random(width), random(height));
}

function draw() {
  backColor = colorSlider.value();
  background(0, 0, backColor);


  setGradient(0, 0, windowWidth, windowHeight, c1, c2, 1);

  for(var s = 0; s<numStars; s++){
    stars[s].display();
  }

  // for (var i = 0; i < 60; i++) {
  //  noStroke();
  //  fill(255, 255, 255);
  //  ellipse(random(windowWidth), random(windowHeight), 3, 3);
  // }

  image(clouds, 100, 40, clouds.width/2, clouds.height/2);
  image(clouds, 450, 160, clouds.width/2, clouds.height/2);
  image(clouds, 675, 75, clouds.width/2, clouds.height/2);
  image(clouds, 815, 135, clouds.width/2, clouds.height/2);
  image(clouds, 990, 90, clouds.width/2, clouds.height/2);


  noStroke();
  fill(255, 210, 120)
  //sunX = sunSlider.value();
  //sunY = -(sunSlider.value());

  //THIS IS THE SUN
  push();
  translate(width/2, height/2+300);
  rotate(sunSlider.value()/40);
  translate(550, 0);
  //ellipse(0, 0, 32, 32);
  ellipse(0, 0, 150, 150);
  fill(255, 210, 120, 80);
  ellipse (0, 0, (sin(frameCount/20) * 180), (sin(frameCount/20) * 180));

  fill(255, 210, 120, 40);
  ellipse (0, 0, (sin(frameCount/20) * 200), (sin(frameCount/20) * 200));

  pop();

  fill(217, 34, 96);
  mountain1.display();

  fill(174, 53, 106);
  mountain2.display();

  fill(120, 61, 92);
  mountain3.display();

  fill(67, 45, 60);
  mountain4.display();

  fill(255, 255, 255);



  //star1.display();

  ellipse(xpos, ypos, 100, 100);

  // translate(windowWidth/2, windowHeight/2);
  // fill(255, 200, 50);
  // ellipse(0, 0, 64, 64);
  //
  // // The earth rotates around the sun
  //
  // theta += 0.01;

}

class Mountain{
  constructor(tempheight, variable) {
    this.h = tempheight;
    this.v = variable;
  }

  display() {
    beginShape();
      vertex(0, height);
      //vertex(0, height/2);
      var xoff = 0;
      //for (var x = 50; x < width; x++) {
      for (var x = 0; x < width; x++) {
        var y = noise(xoff) * (this.h);
        //vertex(x * (this.v), y);
        vertex(x, y);
        xoff = xoff + this.v;
      }
      vertex(width, height);
    endShape();
  }
}

class Star{
  constructor(starX, starY) {
    this.x = starX;
    this.y = starY;
  }
  display() {
     noStroke();
     fill(255, 255, 255);
     ellipse(this.x, this.y, 3, 3);
  }
}


function setGradient(x, y, w, h, c1, c2, axis) {
  noFill();
    for (var i = y; i <= y + h; i++) {
      var inter = map(i, y, y + h, 0, 1);
      var c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x + w, i);
  }
}

function onConnect() {
  // Once a connection has been made, make subscription(s).
  console.log("onConnect");
  client.subscribe("/positionX");
  client.subscribe("/positionY");
};

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0)
	console.log("onConnectionLost:"+responseObject.errorMessage);
};

// mqtt incoming message parsing
function onMessageArrived(message) {
  console.log("onMessageArrived:"+message.destinationName+": "+message.payloadString);
  if (message.destinationName == "/positionX"){
    xpos = map(message.payloadString, 10, 1023, 0, windowWidth);
  }
  if (message.destinationName == "/positionY"){
    ypos = map(message.payloadString, 10, 1023, 0, windowHeight);
  }
};
