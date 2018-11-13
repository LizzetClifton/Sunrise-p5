var hostname = "mqtt.colab.duke.edu";
var port = 9001;
var xpos;
var ypos;


var sunSlider;
var sunX;
var sunY;
var colorSlider;

let mountain1;
let mountain2;

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

  sunSlider = createSlider(0, windowWidth, 0);
  sunSlider.position(200, 200);
  colorSlider = createSlider(0, 145);
  colorSlider.position(200, 300);

  mountain1 = new Mountain(600, 1);
  mountain2 = new Mountain(800, 1.5);
  mountain3 = new Mountain(1000, 2);
  mountain4 = new Mountain(1200, 2.5);

  b1 = color(255);
  b2 = color(0);
  c1 = color(239, 124, 139);
  c2 = color(250, 152, 113);

}

function draw() {
  backColor = colorSlider.value();
  background(0, 0, backColor);


  setGradient(0, 0, windowWidth, windowHeight, c1, c2, 1);

  // for (var i = 0; i < 60; i++) {
  //  noStroke();
  //  fill(255, 255, 255);
  //  ellipse(random(windowWidth), random(windowHeight), 3, 3);
  // }

  image(clouds, 100, 40, clouds.width/20, clouds.height/20);
  image(clouds, 450, 160, clouds.width/20, clouds.height/20);
  image(clouds, 675, 75, clouds.width/20, clouds.height/20);
  image(clouds, 815, 135, clouds.width/20, clouds.height/20);
  image(clouds, 990, 90, clouds.width/20, clouds.height/20);


  noStroke();
  fill(255, 210, 120)
  sunX = sunSlider.value();
  sunY = -(sunSlider.value());

  ellipse (sunX, (sunY + windowHeight), 150, 150);

  fill(255, 210, 120, 80);
  ellipse (sunX, (sunY + windowHeight), (sin(frameCount/20) * 180), (sin(frameCount/20) * 180));

  fill(255, 210, 120, 40);
  ellipse (sunX, (sunY + windowHeight), (sin(frameCount/20) * 200), (sin(frameCount/20) * 200));

  if(sunX > (windowWidth/2)) {
    sunY = -sunY;
  }

  fill(217, 34, 96);
  mountain1.display();

  fill(174, 53, 106);
  mountain2.display();

  fill(120, 61, 92);
  mountain3.display();

  fill(67, 45, 60);
  mountain4.display();

  ellipse(xpos, ypos, 100, 100);

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
        xoff = xoff + 0.004;
      }
      vertex(width, height);
    endShape();
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
