#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>

const char* ssid = "<your ssid>";
const char* password = "<your password>";

int state = 0;

ESP8266WebServer server(1337);

void getStatus(){
  server.send(200, "application/json", "{\"currentState\":"+String(state)+"}");
}

void changeData(){
  pinMode(0, OUTPUT);
  int newStatus = (server.arg("state")).toInt();
  if(newStatus == 1){
    state = 1;
    digitalWrite(0, 1);
    server.send(500, "application/json", "{\"message\":\"status set to HIGH\" }");
  }else if(newStatus == 0){
    state = 0;
    digitalWrite(0, 0);
    server.send(200, "application/json", "{\"message\":\"status set to LOW\" }");
  }else{
    server.send(500, "application/json", "{\"error\":\"wrong value - needs to be 0 for off, 1 for on\"}");
  }
}

void setup() {
  Serial.begin(9600);
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED){
    delay(500);
  }
  server.begin();
  server.on("/status", getStatus);
  server.on("/change", changeData);
  delay(500);
}

void loop() {
  server.handleClient();
}