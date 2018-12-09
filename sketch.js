var hostname = "mqtt.colab.duke.edu";
var port = 9001;
var xpos;
var zpos;
var sunpos;

var theta = 0;

var sunSlider;
var sunX;
var sunY;
//var colorSlider;

// let rain = [];
// let numdrops = 250;

var numStars = 80;

var stars = [];

var c1, c2;

let clouds;

var numClouds = 10;

var clouds2 = [];

function preload() {
  clouds = loadImage('./images/cloud.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  client = new Paho.MQTT.Client(hostname, port, "", "DukeOpend");
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived; // msg parsing callback
  // connect the client using SSL and trigger onConnect callback
  client.connect({
    onSuccess: onConnect,
    useSSL: true
  });

  // colorSlider = createSlider(0, 145);
  // colorSlider.position(200, 300);

  mountain1 = new Mountain(600, 0.003);
  mountain2 = new Mountain(800, 0.002);
  mountain3 = new Mountain(1000, 0.0035);
  mountain4 = new Mountain(1200, 0.002);



  for (var s = 0; s < numStars; s++) {
   stars[s] = new Star(random(width), random(height));
  }

  for (var s = 0; s < numClouds; s++) {
   clouds2[s] = new Cloud(random(width), random(0, height/2), random(.1,1), random(1.5, 3.5));
  }

//THESE ARE THE RAIN DROPS
  // for (let i = 0; i < numdrops; i++) {
  //   rain[i] = new Drop(random(0, width), random(-200, 0), 5, 10, random(7, 10))
  // }

}

function draw() {
  // backColor = colorSlider.value();
  // background(0, 0, backColor);

  //c3 = xpos + 10;
  // c1 = color(250, 124, 139);
  // c2 = color(250, 152, 113);

  //sunpos = map(zpos, 0, 240, 0, 255);
  c1 = color(sunpos, sunpos-50, 70);
  c2 = color(200, 50, 90);
  //c2 = color(sunpos, 150, 110);

  setGradient(0, 0, windowWidth, windowHeight, c1, c2, 1);

  for(var s = 0; s<numStars; s++){
    stars[s].display();
  }


  // image(clouds, 100, 40, clouds.width/2, clouds.height/2);
  // image(clouds, 450, 160, clouds.width/2, clouds.height/2);
  // image(clouds, 675, 75, clouds.width/2, clouds.height/2);
  // image(clouds, 815, 135, clouds.width/2, clouds.height/2);
  // image(clouds, 990, 90, clouds.width/2, clouds.height/2);


  noStroke();
  fill(255, 210, 120)
  //sunX = sunSlider.value();
  //sunY = -(sunSlider.value());

  //THIS IS THE SUN
  push();
  translate(width/2, height/2+300);
  rotate(zpos/10);
  translate(550, 0);
  //ellipse(0, 0, 32, 32);
  ellipse(0, -50, 180, 180);
  fill(255, 210, 120, 80);
  ellipse (0, -50, (sin(frameCount/40) * 220), (sin(frameCount/40) * 220));

  fill(255, 210, 120, 40);
  ellipse (0, -50, (sin(frameCount/40) * 260), (sin(frameCount/40) * 260));

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
//THESE ARE THE RAIN DROPS
// for (let i = 0; i < numdrops; i ++) {
//   rain[i].display();
// }

  for(var s = 0; s<numClouds; s++){
    clouds2[s].display();
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
      for (var x = 0; x <= width; x++) {
        var y = noise(xoff) * (this.h);
        y = y + 100;
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

class Cloud{
  constructor(cloudX, cloudY, cloudS, cloudT) {
    this.x = cloudX;
    this.y = cloudY;
    this.s = cloudS;
    this.t = cloudT;
  }
  display() {
    //  noStroke();
    //  fill(255, 255, 255);
    image(clouds, this.x, this.y, clouds.width/this.t, clouds.height/this.t);
    if(this.x < -200) {
      this.x = width;
    }
    this.x = this.x - this.s;
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
  client.subscribe("/positionZ");
};

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0)
	console.log("onConnectionLost:"+responseObject.errorMessage);
};

// mqtt incoming message parsing
function onMessageArrived(message) {
  console.log("onMessageArrived:"+message.destinationName+": "+message.payloadString);
  if (message.destinationName == "/positionZ"){
    zpos = map(message.payloadString, 500, 4355, 0, 240);
    sunpos = map(message.payloadString, 0, 255, 0, 240);
  }
  if (message.destinationName == "/positionX"){
    xpos = map(message.payloadString, 0, 255, 0, 240);
   }
   console.log("onMessageArrived:"+message.destinationName+": "+message.payloadString);
};

// class Drop {
//   constructor(tempx, tempy, tempw, temph, temps) {
//     this.x = tempx;
//     this.y = tempy;
//     this.w = tempw;
//     this.h = temph;
//     this.s = temps;
//   }
//
//
//   display() {
//     this.y = this.y + this.s;
//     if(this.y > height) {
//       this.y = 0;
//     }
//     fill(0, 0, 255);
//     ellipse(this.x, this.y, this.w, this.h)
//   }
// }
