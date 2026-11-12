// Bibliothèques à installer (Gestionnaire de bibliothèques Arduino) :
//  - "WebSockets" de Markus Sattler (links2004)
//  - "ArduinoJson" de Benoit Blanchon (version 7.x)
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// ---- À MODIFIER ----
const char* WIFI_SSID = "TON_WIFI";
const char* WIFI_PASS = "TON_MOT_DE_PASSE";
const char* PI_HOST   = "192.168.1.50";   // adresse IP de la Raspberry Pi
const uint16_t PI_PORT = 3000;
const char* KEY       = "change-me";      // identique à ESP_KEY côté serveur
// --------------------

const int LED_PIN = 2;  // LED intégrée sur la plupart des cartes ESP32 DevKit

WebSocketsClient ws;
bool ledState = false;
unsigned long lastSend = 0;

void sendTelemetry() {
  JsonDocument doc;
  doc["type"]   = "telemetry";
  doc["rssi"]   = WiFi.RSSI();
  doc["heap"]   = ESP.getFreeHeap();
  doc["uptime"] = millis() / 1000;
  doc["led"]    = ledState;
  String out;
  serializeJson(doc, out);
  ws.sendTXT(out);
}

void onEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      Serial.println("Connecté au serveur");
      sendTelemetry();
      break;
    case WStype_DISCONNECTED:
      Serial.println("Déconnecté du serveur");
      break;
    case WStype_TEXT: {
      JsonDocument doc;
      if (deserializeJson(doc, payload, length)) return;
      if (doc["type"] == "led") {
        ledState = doc["value"].as<bool>();
        digitalWrite(LED_PIN, ledState ? HIGH : LOW);
        sendTelemetry();  // confirme le nouvel état à l'interface
      }
      break;
    }
    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(400); Serial.print("."); }
  Serial.println();
  Serial.println(WiFi.localIP());

  String path = String("/esp?key=") + KEY;
  ws.begin(PI_HOST, PI_PORT, path);
  ws.onEvent(onEvent);
  ws.setReconnectInterval(3000);
  ws.enableHeartbeat(15000, 3000, 2);
}

void loop() {
  ws.loop();
  if (millis() - lastSend > 2000) {
    lastSend = millis();
    if (ws.isConnected()) sendTelemetry();
  }
}
