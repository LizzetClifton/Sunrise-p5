#include <SPI.h>
#include <WiFi101.h>
#include <ZX_Sensor.h>
#include <PubSubClient.h>
#include <timer.h>

// Constants
const int ZX_ADDR = 0x10;  // ZX Sensor I2C address

// Global Variables
ZX_Sensor zx_sensor = ZX_Sensor(ZX_ADDR);
uint8_t x_pos;
uint8_t z_pos;
//--------------------------------------
//volatile GestureType gesture;
//volatile bool interrupt_flag;
//uint8_t gesture_speed;
//--------------------------------------

#include "arduino_secrets.h"
char ssid[] = SECRET_SSID;
char pass[] = SECRET_PASS;
int status = WL_IDLE_STATUS; 

WiFiClient WiFiclient;

#define MQTT_BROKER "mqtt.colab.duke.edu"
#define MQTT_PORT 1883

PubSubClient client(WiFiclient);

String device_id = "FeatherM0-";

long lastReconnectAttempt = 0;
long now;

void doSubscriptions() {
  
}

void parseMQTT(char* topic, byte* payload, unsigned int length) {

  payload[length] = '\0';  // important - do not delete

  // print to serial every message, regardless of topic
  // (optional)
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  Serial.print((char*)payload);
  Serial.println();
  
}

auto doPub = timer_create_default();

void setPubIntervals() {
  doPub.every(100, sendCoords);
}


bool sendCoords(void *) {
  String xMsg = String(x_pos);
  String zMsg = String(z_pos);
  char xValue[4];
  char zValue[4];
  xMsg.toCharArray(xValue, 4);
  zMsg.toCharArray(zValue, 4);
  client.publish("/positionX", xMsg.c_str(), true);
  client.publish("/positionZ", zMsg.c_str(), true);
  return true; // repeat? true
}


void setup() {
  // put your setup code here, to run once:
  uint8_t ver;
  //gesture = NO_GESTURE;
  pinMode(x_pos, INPUT);
  pinMode(z_pos, INPUT);

  Serial.begin(9600);

//-----------------------------------------------------
  Serial.println();
  Serial.println("-----------------------------------");
  Serial.println("SparkFun/GestureSense - I2C ZX Demo");
  Serial.println("-----------------------------------");

  // Initialize ZX Sensor (configure I2C and read model ID)
  if ( zx_sensor.init() ) {
    Serial.println("ZX Sensor initialization complete");
  } else {
    Serial.println("Something went wrong during ZX Sensor init!");
  }

  // Read the model version number and ensure the library will work
  ver = zx_sensor.getModelVersion();
  if ( ver == ZX_ERROR ) {
    Serial.println("Error reading model version number");
  } else {
    Serial.print("Model version: ");
    Serial.println(ver);
  }
  if ( ver != ZX_MODEL_VER ) {
    Serial.print("Model version needs to be ");
    Serial.print(ZX_MODEL_VER);
    Serial.print(" to work with this library. Stopping.");
    while(1);
  }

  // Read the register map version and ensure the library will work
  ver = zx_sensor.getRegMapVersion();
  if ( ver == ZX_ERROR ) {
    Serial.println("Error reading register map version number");
  } else {
    Serial.print("Register Map Version: ");
    Serial.println(ver);
  }
  if ( ver != ZX_REG_MAP_VER ) {
    Serial.print("Register map version needs to be ");
    Serial.print(ZX_REG_MAP_VER);
    Serial.print(" to work with this library. Stopping.");
    while(1);
  }


  // Feather M0-specific WiFi pins
  WiFi.setPins(8, 7, 4, 2);

  // check for the presence of the shield:
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi chip not present or accessible");
    // don't continue:
    while (true);
  }

  // attempt to connect to WiFi network:
  while ( status != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    // Connect to WiFi:
    if (sizeof(pass) <= 1) {
      status = WiFi.begin(ssid);
    }
    else {
      status = WiFi.begin(ssid, pass);
    }

    // wait 5 seconds for connection:
    delay(5000);
  }

  // you're connected now, so print out a success message:
  Serial.println("You're connected to the network");

  // print your Feather's IP address and MQTT info:
  IPAddress ip = WiFi.localIP();
  Serial.print("Device IP Address: ");
  Serial.println(ip);

  // get your MAC address:
  byte mac[6];
  WiFi.macAddress(mac);
  String mac_address;
  for (int i = 5; i >= 0; i--) {
    if (mac[i] < 16) mac_address += "0";
    mac_address += String(mac[i], HEX);
    if (i > 0) mac_address += ":";
  }
  // append to device_id
  device_id += mac_address;
  Serial.print("Attempting to connect to MQTT Broker: ");
  Serial.print(MQTT_BROKER);
  Serial.print(":");
  Serial.println(MQTT_PORT);
  lastReconnectAttempt = 0;

    // initiate first connection to MQTT broker
    client.setServer(MQTT_BROKER, MQTT_PORT);

    // specify a function to call upon receipt of a msg
    // on a subscribed channel; in this case parseMQTT()
    client.setCallback(parseMQTT);

  setPubIntervals(); // initalize any publish intervals
  
}

void loop() {
  // put your main code here, to run repeatedly:

  // get the current time
  now = millis();

  // if MQTT connection lost
  if (!client.connected()) {
    // only attempt to reconnect every 5 secs
    if (now - lastReconnectAttempt > 5000) { // 5 secs since last reconnect attempt?
      lastReconnectAttempt = now;
      // Attempt to reconnect
      if (reconnect()) {
        lastReconnectAttempt = 0;
      }
    }
  } else {
    // MQTT client connected
    client.loop();
  }
  doPub.tick(); // tick the doPub timer

  //-------------------------------------------------------

  // If there is position data available, read and print it
  if ( zx_sensor.positionAvailable() ) {
    x_pos = zx_sensor.readX();
    if ( x_pos != ZX_ERROR ) {
      Serial.print("X: ");
      Serial.print(x_pos);
    }
    z_pos = zx_sensor.readZ();
    if ( z_pos != ZX_ERROR ) {
      Serial.print(" Z: ");
      Serial.println(z_pos);
    }
  }

//=====================
//  gesture = zx_sensor.readGesture();
//    gesture_speed = zx_sensor.readGestureSpeed();
//    switch ( gesture ) {
//      case NO_GESTURE:
//        //Serial.println("No Gesture");
//        break;
//      case RIGHT_SWIPE:
//        Serial.print("Right Swipe. Speed: ");
//        Serial.println(gesture_speed, DEC);
//        break;
//      case LEFT_SWIPE:
//        Serial.print("Left Swipe. Speed: ");
//        Serial.println(gesture_speed, DEC);
//        break;
//      
//      default:
//        break;
//    }
//=====================
}

boolean reconnect() {
  if (client.connect(device_id.c_str())) {
    Serial.print(device_id);
    Serial.println(" connected to MQTT broker");
    doSubscriptions();  // (re)subscribe to desired topics
    return client.connected();
  }
  Serial.print("MQTT connection failed, rc=");
  Serial.println(client.state());
  Serial.println("Trying again ...");
  return 0;
}
