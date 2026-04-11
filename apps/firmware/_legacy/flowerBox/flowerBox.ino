#include <SPI.h>
#include <EEPROM.h>
#include <WiFi.h>
#include <PubSubClient.h>

// ===== CONFIG =====
struct Config {
  char ssid[32];
  char password[64];
  char mqtt_server[32];
  int mqtt_port;
};

// ===== WIFI =====
int wiFiStatus = WL_IDLE_STATUS;

// ===== MQTT =====
int mqttStatus = 0;

WiFiClient wifiClient;
PubSubClient client(wifiClient);
Config config;

// ===== PINOS =====
const int PIN_LDR = A0;
const int PIN_SOIL = A1;
const int PIN_CONFIG_BUTTON = 8;
const int LED_R = 3;
const int LED_G = 6;
const int LED_B = 5;

// ===== TIMER =====
unsigned long lastRead = 0;
unsigned long lastPub = 0;
const long intervaloRead = 30000;
const unsigned long intervaloPub = 1800000;
unsigned long lastHeartbeat = 0;
const unsigned long heartbeatInterval = 1000; // 1s
unsigned long lastMQTTReset = 0;
const unsigned long MQTT_RESET_INTERVAL = 3600000; // 1h
const unsigned long REBOOT_INTERVAL = 86400000; // 1 dia
// ===== BLINK =====
unsigned long ledBlinkInicio = 0;
unsigned long ledBlinkDuracao = 0;
unsigned long ledBlinkIntervalo = 0;
unsigned long ledBlinkUltimaTroca = 0;
bool ledBlinkEstado = false;
bool ledBlinkAtivo = false;
void (*ledBlinkCor)();

// ===== DELTAS MÍNIMOS E PUBLICACAO =====
const int DELTA_LUZ = 30;
const int DELTA_UMIDADE = 50;
int lastLuminosidade = -1;
int lastUmidadeSolo = -1;

void checkWifi() {
  if (WiFi.status() == WL_CONNECTED) {
    if (!ledBlinkEstado) ledBlue();
    return;
  }
  ledRed();
  Serial.println("Reconectando wifi...");

  ledRed();
  WiFi.disconnect();
  delay(200);
  wiFiStatus = WiFi.begin(config.ssid, config.password);
  if (wiFiStatus == WL_CONNECTED) {
    Serial.print(" Reconectado. IP:");
    Serial.println(WiFi.localIP());

    client.disconnect();   // força reset MQTT
    delay(50);
//    wifiClient.stop();     // mata socket TCP
  
    ledBlue();
  } else {
    Serial.println(" Falha WiFi");
    iniciarBlink(ledRed, 2000, 200);
  }
}

void setup_wifi() {
  ledRed();
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield não encontrada");
    while (true);
  }

  Serial.print("Conectando WiFi");
  wiFiStatus = WiFi.begin(config.ssid, config.password);
  if (wiFiStatus == WL_CONNECTED) {
    Serial.print(" Conectado. IP:");
    Serial.println(WiFi.localIP());
    ledBlue();
  } else {
    Serial.println(" Falha WiFi");
    iniciarBlink(ledRed, 2000, 200);
  }
}

void setup_tcp() {
  Serial.println("Testando TCP real...");

  if (wifiClient.connect(config.mqtt_server, config.mqtt_port)) {
    Serial.println("TCP abriu");

    wifiClient.print("TESTE\r\n"); // força tráfego real
    delay(100);

    if (wifiClient.connected()) {
      Serial.println("TCP válido");
    } else {
      Serial.println("TCP falso positivo");
    }

    wifiClient.stop();
  } else {
    Serial.println("TCP falhou");
  }

  client.setServer(config.mqtt_server, config.mqtt_port);
  client.setBufferSize(256);
}

int lerAnalogico(int pino) {
  long soma = 0;

  for(int i=0;i<10;i++){
    soma += analogRead(pino);
    delay(3);
  }

  return soma / 10;
}

const unsigned long DEBOUNCE_TIME = 50;
bool state = HIGH;
bool lastReading = HIGH;
unsigned long lastDebounceTime = 0;

bool lerDigital(int pino) {
  bool reading = digitalRead(pino);

  if (reading != lastReading) {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > DEBOUNCE_TIME) {
    state = reading;
  }

  lastReading = reading;

  return state;
}

void heartbeat() {
  unsigned long now = millis();

  if (now - lastHeartbeat >= heartbeatInterval) {
    Serial.print(".");
    lastHeartbeat = now;
  }
}

void setup() {
  pinMode(PIN_CONFIG_BUTTON, INPUT_PULLUP);
  pinMode(LED_R, OUTPUT);
  pinMode(LED_G, OUTPUT);
  pinMode(LED_B, OUTPUT);

  ledGreen();
  Serial.begin(9600);
  delay(2000);
  if (digitalRead(PIN_CONFIG_BUTTON) == LOW) {
    configurarViaSerial();

    while(true); // fica parado até reiniciar
  }
 

  loadConfig();
  setup_wifi();
  setup_tcp();
}

void loop() {
  heartbeat();
  atualizarBlink();
  checkWifi();

  unsigned long now = millis();

  if (now > REBOOT_INTERVAL) {
    Serial.println("Reboot preventivo...");
    asm volatile ("  jmp 0"); // AVR
  }
  
  if (!client.connected()) {
    ledYellow();
    mqttStatus = 0;
    ensureMQTT();
  }

  if (now - lastMQTTReset > MQTT_RESET_INTERVAL) {
    Serial.println("Reset preventivo MQTT...");
  
    client.disconnect();
    wifiClient.stop();
  
    lastMQTTReset = millis();
  }

  client.loop();
 

  if (now - lastRead > intervaloRead) {
    lastRead = now;

    // ===== LER SENSORES =====
    int luminosidade = lerAnalogico(PIN_LDR);
    int umidadeSolo = lerAnalogico(PIN_SOIL);

    bool mudou = false;

    int deltaLum = abs(luminosidade - lastLuminosidade);
    int deltaUm = abs(umidadeSolo - lastUmidadeSolo);

    if (lastLuminosidade == -1 || deltaLum > DELTA_LUZ) {
      mudou = true;
    }
  
    if (lastUmidadeSolo == -1 || deltaUm > DELTA_UMIDADE) {
      mudou = true;
    }
    
    bool forcarPub = (now - lastPub) > intervaloPub;
  
    if (!mudou && !forcarPub) {
      char msg[120];
      snprintf(
        msg,
        sizeof(msg),
        "Sem mudança relevante (%d, %d)",
        deltaLum,
        deltaUm
      );
      iniciarBlink(ledGreen, 1000, 100);
      Serial.println(msg);
      
      return;
    }

    // salva novos valores
    lastLuminosidade = luminosidade;
    lastUmidadeSolo = umidadeSolo;
    lastPub = now;

    

    // ===== PAYLOAD =====
    char payload[128];

    int leituras[] = {
      lastLuminosidade,
      lastUmidadeSolo,
      1 // exemplo: estado digital
    };

    int qtd = sizeof(leituras) / sizeof(leituras[0]);

    static unsigned long msgId = 0;

    createMqttMessage(
      payload,
      sizeof(payload),
      "flowerBox",
      msgId++,
      leituras,
      qtd,
      WiFi.RSSI()
    );

    if (!client.connected()) {
      Serial.println("MQTT caiu antes do publish");
      return;
    }
    
    if (client.publish("micro-agricultor/flowerBox", payload)) {
      Serial.print("MQTT ok: ");
      iniciarBlink(ledGreen, 2000, 200);
    } else {
      Serial.print("state=");
      Serial.print(client.state());
      Serial.print(" connected=");
      Serial.print(client.connected());
      Serial.print("MQTT server=");
      Serial.println(config.mqtt_server);
      iniciarBlink(ledYellow, 2000, 200);
    }

    Serial.println(payload);
    
    Serial.println(strlen(payload));
  }
}