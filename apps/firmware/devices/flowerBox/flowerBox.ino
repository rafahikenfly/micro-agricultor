// includes via symlink (ln -s [relativePath] [name])
#include "mqtt.h"
#include "arduinoShieldWiFi.h"
#include "rgbLed.h"
#include "generic.h"
#include "eeprom.h"

// ===== DEVICE CONFIG =====
#define DEVICE_ID "flowerBox"
#define TOPIC "dispositivos"
#define MAX_SENSORS 8 // Definido conforme a capacidade da mensagem

//#define deviceConfig.ssid "Ravi"
//#define deviceConfig.password "ravi2605"
//#define deviceConfig.mqtt_server "192.168.18.135"
//#define deviceConfig.mqtt_port 1883
//#define deviceConfig.client_id "frrP4FbcFFQEbN6oCiggI"
//#define deviceConfig.publish_interval 1000

// ===== SENSOR CONFIG =====
Sensor sensors[MAX_SENSORS];
int sensorCount = 2;


// ===== PINS =====
#define LED_R_PIN 3
#define LED_G_PIN 6
#define LED_B_PIN 5
#define CONFIG_PIN 8



// ===== SETUP =====
void setup() {
  pinMode(CONFIG_PIN, INPUT_PULLUP);

  Serial.begin(115200);
  Serial.println("[DEVICE] Iniciando setup");

  ledStart(LED_R_PIN, LED_G_PIN, LED_B_PIN);

  // CARREGA O DEVICE CONFIG DO EEPROM
  ledYellow();
  loadConfig();
  delay(2000);
  if (digitalRead(CONFIG_PIN) == LOW || !isConfigValid())  {
    configurarViaSerial();
    while(true); // fica parado até reiniciar
  }

  // MQTT
  mqttStart(deviceConfig.client_id, DEVICE_ID, deviceConfig.mqtt_server, deviceConfig.mqtt_port, ledWaiting);
  
  // WIFI
  wifiStart(deviceConfig.ssid, deviceConfig.password, ledWaiting);
  ledWaiting();
  Serial.println("[DEVICE] Setup concluído");

  // TODO: CARREGA O SENSORS CONFIG DO EEPROM 
  if (sensorCount > MAX_SENSORS) {
    sensorCount = MAX_SENSORS;
  }
  sensors[0] = {A0, SENSOR_ANALOG, 0, 0, 0};
  sensors[1] = {A1, SENSOR_ANALOG, 0, 0, 0};
}

// ===== LOOP =====
void loop() {
  // mantém periféricos
  wifiLoop();
  mqttLoop();
  ledLoop();

  // ===== PUBLISH TESTE =====
  static unsigned long lastSend = 0;
  unsigned long now = millis();
  int values[MAX_SENSORS];
  
  if (now - lastSend >= deviceConfig.publish_interval) {
    lastSend = now;

    for (int s=0; s< sensorCount; s++) {
      lerSensor(sensors[s]);
      values[s] = sensors[s].value;
    }

    Serial.print("[DEVICE] Publicando: ");

    char fullTopic[64];

    if (strlen(TOPIC) + strlen(deviceConfig.client_id) + 2 > sizeof(fullTopic)) {
      Serial.println("Topic muito grande");
      ledError();
      ledBlinkStart(ledBlue,200);
      return;
    }

    if (!mqttConnect(3000)) {
      Serial.println("Sem conexão");
      ledError();
      ledBlinkStart(ledBlue,200);
      return;
    }
    
    snprintf(
      fullTopic,
      sizeof(fullTopic),
      "%s/%s",
      TOPIC,
      deviceConfig.client_id
    );

    bool ok = mqttPublish(
      fullTopic,
      values,
      sensorCount
    );

    if (!ok) {
      Serial.println("Falha");
      ledError();
      ledBlinkStart(ledBlue, 5000, 1000, 1000);
    } else {
      Serial.println("OK");
      ledSuccess();
      ledBlinkStart(ledBlue, 5000, 1000, 1000);
    }
  }
}