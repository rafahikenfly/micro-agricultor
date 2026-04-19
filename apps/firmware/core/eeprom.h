#include <EEPROM.h>

struct DeviceConfig {
  char ssid[32];
  char password[64];
  char mqtt_server[32];
  int mqtt_port;
  unsigned long publish_interval;
  char client_id[32];
};

DeviceConfig deviceConfig;

void readLine(char* buffer, size_t size) {
  size_t index = 0;

  while (true) {
    if (Serial.available()) {
      char c = Serial.read();

      if (c == '\r') continue;

      if (c == '\n') {
        buffer[index] = '\0';
        return;
      } else if (index < size - 1) {
        buffer[index++] = c;
      }
    }
  }
}
void loadConfig() {
  EEPROM.get(0, deviceConfig);

  Serial.println("Config carregada do EEPROM:");
  Serial.print("SSID: ");
  Serial.println(deviceConfig.ssid);
  Serial.print("MQTT: ");
  Serial.print(deviceConfig.mqtt_server);
  Serial.print(" : ");
  Serial.print(deviceConfig.mqtt_port);
  Serial.print(" /");
  Serial.println(deviceConfig.client_id);
}

bool isConfigValid() {
  return strlen(deviceConfig.ssid) > 0 &&
         strlen(deviceConfig.mqtt_server) > 0 &&
         deviceConfig.mqtt_port > 0;
}

void saveConfig() {
  EEPROM.put(0, deviceConfig);
  Serial.println("Config salva no EEPROM");
}

void configurarViaSerial() {
  while (Serial.available()) {
    char n = Serial.read();
  }

  Serial.println("\n=== MODO CONFIGURACAO ===");

  char buffer[64];
  Serial.print("SSID atual: ");
  Serial.print(deviceConfig.ssid);
  Serial.print(" [enter para manter]: ");
  readLine(buffer, sizeof(buffer));
  Serial.println(buffer);
  if (strlen(buffer) > 0) {
    strncpy(deviceConfig.ssid, buffer, sizeof(deviceConfig.ssid));
    deviceConfig.ssid[sizeof(deviceConfig.ssid) - 1] = '\0';
  }

  Serial.print("Senha WiFi [enter para manter]: ");
  readLine(buffer, sizeof(buffer));
  Serial.println("****");
  if (strlen(buffer) > 0) {
    strncpy(deviceConfig.password, buffer, sizeof(deviceConfig.password));
    deviceConfig.password[sizeof(deviceConfig.password) - 1] = '\0';
  }

  Serial.print("MQTT server atual: ");
  Serial.print(deviceConfig.mqtt_server);
  Serial.print(" [enter para manter]: ");
  readLine(buffer, sizeof(buffer));
  Serial.println(buffer);
  if (strlen(buffer) > 0) {
    strncpy(deviceConfig.mqtt_server, buffer, sizeof(deviceConfig.mqtt_server));
    deviceConfig.mqtt_server[sizeof(deviceConfig.mqtt_server) - 1] = '\0';
  }

  Serial.print("MQTT port: ");
  Serial.print(deviceConfig.mqtt_port);
  Serial.print(" [enter para manter]: ");
  readLine(buffer, sizeof(buffer));
  Serial.println(buffer);
  if (strlen(buffer) > 0) {
    deviceConfig.mqtt_port = atoi(buffer);
  }

  Serial.print("Intervalo de publicação (ms): ");
  Serial.print(deviceConfig.publish_interval);
  Serial.print(" [enter para manter]: ");
  readLine(buffer, sizeof(buffer));
  Serial.println(buffer);
  if (strlen(buffer) > 0) {
    deviceConfig.publish_interval = strtoul(buffer, NULL, 10);
  }

  Serial.print("Client Id: ");
  Serial.print(deviceConfig.client_id);
  Serial.print(" [enter para manter]: ");
  readLine(buffer, sizeof(buffer));
  Serial.println(buffer);
  if (strlen(buffer) > 0) {
    strncpy(deviceConfig.client_id, buffer, sizeof(deviceConfig.client_id));
  deviceConfig.mqtt_server[sizeof(deviceConfig.mqtt_server) - 1] = '\0';
  }

  saveConfig();
  Serial.println("Reinicie o dispositivo para aplicar novas configurações.");
}

void clearEEPROM() {
  for (int i = 0; i < 512; i++) { // ou 1024 dependendo do board
    EEPROM.write(i, 0);
  }
}