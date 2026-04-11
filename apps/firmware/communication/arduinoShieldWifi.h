#ifndef WIFI_INFRA_H
#define WIFI_INFRA_H

#include <WiFi.h>

// ===== TIPOS =====
typedef void (*WifiWaitCallback)(unsigned long now);

const char* _wifi_ssid;
const char* _wifi_pass;
unsigned long _wifi_retryIntervalMs = 5000;
static WifiWaitCallback _wifi_onWait = nullptr;

// ===== START =====
void wifiStart(
  const char* ssid,
  const char* pass,
  WifiWaitCallback onWait = nullptr,
  unsigned long retryIntervalMs = 5000
) {
  _wifi_ssid = ssid;
  _wifi_pass = pass;
  _wifi_retryIntervalMs = retryIntervalMs;
  _wifi_onWait = onWait;
  Serial.print("[WiFi] Arduino WiFi Shield iniciado. ");
  WiFi.begin(_wifi_ssid, _wifi_pass);
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

// ===== WIFI CONNECT =====
bool wifiConnect(
  unsigned long timeoutMs = 10000
) {
  if (WiFi.status() == WL_CONNECTED) {
    return true;
  }

  Serial.print("[WiFi] Conectando: ");

  WiFi.disconnect();
  delay(100);

  Serial.println(WiFi.status());

  unsigned long start = millis();

  while (WiFi.status() != WL_CONNECTED) {
    unsigned long now = millis();
    if (_wifi_onWait) {
      _wifi_onWait(now);
    } else {
      delay(500);
      Serial.print(".");
    }

    if (now - start >= timeoutMs) {
      Serial.println("Timeout");
      Serial.print("[WiFi] rc=");
      Serial.println(WiFi.status());

      return false;
    }
    delay(1);
  }

  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  return true;
}

// ===== STATUS =====
enum WifiStatus {
  WIFI_STATUS_DISCONNECTED,
  WIFI_STATUS_CONNECTED,
  WIFI_STATUS_CONNECTING,
  WIFI_STATUS_ERROR
};



// ===== LOOP (reconnect leve) =====
void wifiLoop() {
  static unsigned long lastAttempt = 0;

  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  unsigned long now = millis();

  if (now - lastAttempt >= _wifi_retryIntervalMs) {
    lastAttempt = now;
    if (_wifi_onWait) {
      _wifi_onWait(now);
    }
  }
}

// ===== STATUS =====
WifiStatus wifiStatus() {
  wl_status_t status = WiFi.status();

  switch (status) {
    case WL_CONNECTED:
      return WIFI_STATUS_CONNECTED;

    case WL_IDLE_STATUS:
      return WIFI_STATUS_CONNECTING;

    case WL_CONNECT_FAILED:
    case WL_CONNECTION_LOST:
    case WL_DISCONNECTED:
      return WIFI_STATUS_DISCONNECTED;

    default:
      return WIFI_STATUS_ERROR;
  }
}

// ===== SETTERS =====
void wifiSetRetryInterval(unsigned long ms) {
  _wifi_retryIntervalMs = ms;
}

// ===== UTILS =====
int wifiRSSI() {
  return WiFi.RSSI();
}

IPAddress wifiIP() {
  return WiFi.localIP();
}

bool wifiIsConnected() {
  return WiFi.status() == WL_CONNECTED;
}

void wifiDisconnect(bool force = false) {
  if (WiFi.status() == WL_CONNECTED || force) {
    Serial.println("[MQTT] Desconectado");
    WiFi.disconnect();
  }
}

#endif