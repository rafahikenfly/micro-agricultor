#ifndef MQTT_INFRA_H
#define MQTT_INFRA_H

#include <WiFi.h>
#include <PubSubClient.h>

// ===== CONFIG =====
typedef void (*MqttCallback)(char*, byte*, unsigned int);
typedef void (*MqttWaitCallback)(unsigned long now);
#define MQTT_BUFFER_SIZE 128

// ===== ESTADOS =====
WiFiClient _wifiClient;
PubSubClient _mqttClient(_wifiClient);
const char* _client_id;
const char* _device_id;
const char* _mqtt_server;
unsigned long _msg_id = 0;
char _mqttBuffer[MQTT_BUFFER_SIZE];
static MqttWaitCallback _mqtt_onWait = nullptr;

// ===== START =====
void mqttStart(
  const char* client_id,
  const char* device_id,
  const char* server,
  int port = 1883,
  MqttWaitCallback onWait = nullptr,
  MqttCallback mqttCallback = nullptr
) {
  _client_id = client_id;
  _device_id = device_id;
  _mqtt_server = server;
  _msg_id = 0;
  _mqtt_onWait = onWait;

  if (mqttCallback) {
    _mqttClient.setCallback(mqttCallback);
  } 

  _mqttClient.setServer(_mqtt_server, port);
  _mqttClient.setBufferSize(MQTT_BUFFER_SIZE);
  Serial.println("[MQTT] MQTT iniciado.");
}

// ===== MQTT CONNECT =====
bool mqttConnect(
  unsigned long timeoutMs = 10000
) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[MQTT] WiFi não conectado");
    return false;
  }

  if (_mqttClient.connected()) {
    return true;
  }

  Serial.print("[MQTT] Conectando: ");

  unsigned long start = millis();

  while (!_mqttClient.connected()) {
    unsigned long now = millis();
    if (_mqttClient.connect(_client_id)) {
      Serial.println("OK");
      return true;
    }

    // callback customizado
    if (_mqtt_onWait) {
      _mqtt_onWait(now);
    } else {
      delay(500); // fallback padrão
    }

    // timeout
    if (now - start >= timeoutMs) {
      Serial.println("Timeout");
      Serial.print("[MQTT] rc=");
      Serial.println(_mqttClient.state());
      return false;
    }
  }

  return true;
}


// ===== LOOP =====
void mqttLoop() {
  if (!_mqttClient.connected()) {
    return; // não tenta conectar aqui
  }

  _mqttClient.loop();
}

// ===== STATUS =====
enum MqttStatus {
  MQTT_STATUS_DISCONNECTED,
  MQTT_STATUS_CONNECTED,
  MQTT_STATUS_CONNECTING,
  MQTT_STATUS_ERROR
};
MqttStatus mqttStatus() {
  if (_mqttClient.connected()) {
    return MQTT_STATUS_CONNECTED;
  }

  int state = _mqttClient.state();

  switch (state) {
    case MQTT_CONNECT_FAILED:
    case MQTT_CONNECTION_TIMEOUT:
      return MQTT_STATUS_ERROR;

    default:
      return MQTT_STATUS_DISCONNECTED;
  }
}

// internal ===== MESSAGE BUILDER =====
void _createMqttMessage(
  char* buffer,
  size_t size,
  unsigned long msgId,
  int* values,
  int valuesCount
) {
  unsigned long uptime = millis() / 1000;
  unsigned long ts = uptime;

  int offset = 0;
  int written = 0;

  // header
  written = snprintf(
    buffer,
    size,
    "{\"%lu\":[",
    msgId
  );

  if (written < 0 || written >= size) {
    buffer[0] = '\0';
    return;
  }

  offset = written;

  // valores (formato: [1,2,3])
  for (int i = 0; i < valuesCount; i++) {
    written = snprintf(
      buffer + offset,
      size - offset,
      "%d%s",
      values[i],
      (i < valuesCount - 1) ? "," : ""
    );

    if (written < 0 || written >= size - offset) {
      buffer[0] = '\0';
      return;
    }

    offset += written;
  }

  // fechamento
  written = snprintf(buffer + offset, size - offset, "]}");

  if (written < 0 || written >= size - offset) {
    buffer[0] = '\0';
    return;
  }

  // garante null-termination
  buffer[size - 1] = '\0';
}

// internal ===== CALLBACK PADRAO =====
void _mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("[MQTT] Recebido (");
  Serial.print(topic);
  Serial.print("): ");

  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

// ===== SETTERS =====
void mqttSetServer(const char* server, int port = 1883) {
  _mqtt_server = server;
  _mqttClient.setServer(_mqtt_server, port);
}


// ===== PUBLISH =====
bool mqttPublish(
  const char* topic,
  int* values,
  int valuesCount
) {
  if (!_mqttClient.connected()) {
    Serial.println("[MQTT] Não conectado para publicação");
    return false;
  }
  _msg_id++;
  _createMqttMessage(
    _mqttBuffer,
    MQTT_BUFFER_SIZE,
    _msg_id,
    values,
    valuesCount
  );

  Serial.print(topic);
  Serial.print("/");
  Serial.print(_mqttBuffer);
  Serial.print(" ");

  if (strlen(_mqttBuffer) == 0) {
    Serial.println("[MQTT] Overflow de mensagem.");
    return false;
  }

  return _mqttClient.publish(
    topic,
    (uint8_t*)_mqttBuffer
//    strlen(_mqttBuffer)
  );
}

void mqttDisconnect(bool force = false) {
  if (_mqttClient.connected() || force) {
    Serial.println("[MQTT] Desconectado");

    _mqttClient.disconnect();

    // limpar buffer
    memset(_mqttBuffer, 0, MQTT_BUFFER_SIZE);
  }
}

#endif