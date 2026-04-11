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
        if (index > 0) {
          buffer[index] = '\0';
          return;
        }
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

  DeviceConfig test;
  EEPROM.get(0, test);

  Serial.println("DEBUG apos salvar:");
  Serial.println(test.ssid);
  Serial.println(test.mqtt_server);
  Serial.println(test.mqtt_port);
  Serial.println(test.publish_interval);
  Serial.println(test.client_id);
}

void configurarViaSerial() {
  while (Serial.available()) {
    char n = Serial.read();
  }

  Serial.println("\n=== MODO CONFIGURACAO ===");

  char buffer[64];
  Serial.print("SSID atual: ");
  Serial.println(deviceConfig.ssid);
  Serial.print("Novo SSID: ");
  readLine(buffer, sizeof(buffer));
  Serial.println(buffer);
  strncpy(deviceConfig.ssid, buffer, sizeof(deviceConfig.ssid));

  Serial.print("Senha WiFi: ");
  readLine(buffer, sizeof(buffer));
  Serial.println("****");
  strncpy(deviceConfig.password, buffer, sizeof(deviceConfig.password));

  Serial.print("MQTT server: ");
  readLine(buffer, sizeof(buffer));
  Serial.println(buffer);
  strncpy(deviceConfig.mqtt_server, buffer, sizeof(deviceConfig.mqtt_server));

  Serial.print("MQTT port: ");
  readLine(buffer, sizeof(buffer));
  Serial.println(buffer);
  deviceConfig.mqtt_port = atoi(buffer);

  Serial.print("Intervalo máximo de publicação (ms): ");
  readLine(buffer, sizeof(buffer));
  Serial.println(buffer);
  deviceConfig.publish_interval = strtoul(buffer, NULL, 10);

  Serial.print("Client Id atual: ");
  Serial.println(deviceConfig.client_id);
  Serial.print("Novo Client Id: ");
  readLine(buffer, sizeof(buffer));
  Serial.println(buffer);
  strncpy(deviceConfig.client_id, buffer, sizeof(deviceConfig.client_id));

  saveConfig();
  Serial.println("Reinicie o dispositivo para aplicar novas configurações.");
}

void clearEEPROM() {
  for (int i = 0; i < 512; i++) { // ou 1024 dependendo do board
    EEPROM.write(i, 0);
  }
}