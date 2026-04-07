void createMqttMessage(
  char* buffer,
  size_t size,
  const char* deviceId,
  unsigned long msgId,
  int* values,
  int valuesCount,
  int rssi
) {
  unsigned long uptime = millis() / 1000;
  unsigned long ts = uptime;

  int offset = 0;

  // Parte inicial do JSON
  offset += snprintf(
    buffer + offset,
    size - offset,
    "{\"v\":1,\"id\":\"%s\",\"msgId\":%lu,\"uptime\":%lu,\"ts\":%lu,\"rssi\":%d,\"vals\":[",
    deviceId,
    msgId,
    uptime,
    ts,
    rssi
  );
  
  // Itera sobre o array
  for (int i = 0; i < valuesCount; i++) {
    offset += snprintf(
      buffer + offset,
      size - offset,
      "{\"i\":%d,\"v\":%.d}%s",
      i,
      values[i],
      (i < valuesCount - 1) ? "," : ""
    );

    // Segurança contra overflow
    if (offset >= size) break;
  }

  // Fecha JSON
  snprintf(
    buffer + offset,
    size - offset,
    "]}"
  );

}

bool ensureMQTT() {
  if (WiFi.status() != WL_CONNECTED) return false;
  if (client.connected()) return true;

  static unsigned long lastAttempt = 0;
  const unsigned long RETRY_INTERVAL = 5000;

  if (millis() - lastAttempt < RETRY_INTERVAL) return false;

  lastAttempt = millis();

  Serial.print("MQTT conectando...");

  String clientId = "flowerBox_" + String(random(10000));

  if (client.connect(clientId.c_str())) {
    Serial.println("OK");
    return true;
  } else {
    Serial.print("falhou, state=");
    Serial.println(client.state());
    return false;
  }
}