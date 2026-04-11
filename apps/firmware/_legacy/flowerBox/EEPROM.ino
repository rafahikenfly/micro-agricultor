void loadConfig() {
  EEPROM.get(0, config);

  Serial.println("Config carregada do EEPROM:");
  Serial.print("SSID: ");
  Serial.println(config.ssid);
  Serial.print("MQTT: ");
  Serial.println(config.mqtt_server);
}
void saveConfig() {
  EEPROM.put(0, config);
  Serial.println("Config salva no EEPROM");
}

String readLine() {

  while (!Serial.available()) {
    delay(10);
  }

  String input = Serial.readStringUntil('\n');
  input.trim();
  return input;
}
void configurarViaSerial() {

  Serial.println("\n=== MODO CONFIGURACAO ===");

  Serial.print("SSID atual: ");
  Serial.println(config.ssid);
  Serial.print("Novo SSID: ");

  String ssid = readLine();
  Serial.println(ssid);
  ssid.toCharArray(config.ssid, sizeof(config.ssid));

  Serial.print("Senha WiFi: ");
  String pass = readLine();
  Serial.println("****");
  pass.toCharArray(config.password, sizeof(config.password));

  Serial.print("MQTT server: ");
  String mqtt = readLine();
  Serial.println(mqtt);
  mqtt.toCharArray(config.mqtt_server, sizeof(config.mqtt_server));

  Serial.print("MQTT port: ");
  String port = readLine();
  Serial.println(port);
  config.mqtt_port = port.toInt();

  saveConfig();
  Serial.println("Reinicie o dispositivo para aplicar novas configurações.");
}