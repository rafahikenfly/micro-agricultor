#include <SPI.h>
#include <WiFi.h>
#include <PubSubClient.h>

// ===== CONFIG =====
char ssid[] = "Ravi";
char pass[] = "ravi2605";

char mqtt_server[] = "192.168.18.135";

WiFiClient wifiClient;
PubSubClient client(wifiClient);

// ===== FUNÇÕES =====

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Mensagem recebida: ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void conectarWiFi() {
  Serial.print("Conectando ao WiFi...");

  while (WiFi.begin(ssid, pass) != WL_CONNECTED) {
    Serial.print(".");
    delay(3000);
  }

  Serial.println("\nWiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando MQTT...");

    if (client.connect("arduinoShield")) {
      Serial.println("conectado!");
      client.subscribe("teste/topico");
    } else {
      Serial.print("falhou, rc=");
      Serial.println(client.state());
      delay(3000);
    }
  }
}

// ===== SETUP =====

void setup() {
  Serial.begin(115200);

  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield não encontrado!");
    while (true);
  }

  conectarWiFi();

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

// ===== LOOP =====

void loop() {
  if (!client.connected()) {
    reconnect();
  }

  client.loop();

  static unsigned long lastMsg = 0;
  unsigned long now = millis();

  if (now - lastMsg > 5000) {
    lastMsg = now;

    const char* msg = "hello from arduino wifi shield";

    Serial.print("Publicando: ");
    Serial.println(msg);

    if (client.publish("teste/topico", msg)) {
      Serial.println("OK");
    } else {
      Serial.println("FALHOU");
    }
  }
}