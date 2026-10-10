
#include <DHT.h>

enum SensorType {
    SENSOR_ANALOG,
    SENSOR_DIGITAL,
    SENSOR_DHT11_TEMP,
    SENSOR_DHT11_UMID,
};

struct Sensor {
  int pin;
  SensorType type;
  int value;
  bool lastReading;
  unsigned long lastDebounceTime;

  DHT* dht; // ponteiro pro DHT
  int buffer0;
  int buffer1;
};

int lerAnalogico(Sensor &s, int read_count = 10) {
  long soma = 0;

  for(int i=0; i< read_count; i++){
    soma += analogRead(s.pin);
    delay(1);
  }

  s.value = soma / read_count;
  return s.value;
}

bool lerDigital(Sensor &s, unsigned long debounce_time = 15) {
  unsigned long now = millis();
  bool reading = digitalRead(s.pin);

  if (reading != s.lastReading) {
    s.lastDebounceTime = now;
  }

  if ((now - s.lastDebounceTime) > debounce_time) {
    s.value = reading;
  }

  s.lastReading = reading;

  return s.value;
}

void lerSensor(Sensor &s) {
  switch (s.type) {

    case SENSOR_ANALOG:
      lerAnalogico(s);
      break;

    case SENSOR_DIGITAL:
      lerDigital(s);
      break;

    case SENSOR_DHT11_TEMP:
      lerDHT11(s);
      s.value = s.buffer0;
      break;

    case SENSOR_DHT11_UMID:
      lerDHT11(s);
      s.value = s.buffer1;
      break;

  }
}

void initDHT(Sensor &s) {
  s.dht = new DHT(s.pin, DHT11);
  s.dht->begin();
}

void lerDHT11(Sensor &s) {
  unsigned long now = millis();

  float temp = s.dht->readTemperature();
  float hum  = s.dht->readHumidity();

  if (!isnan(temp)) {
    s.buffer0 = (int)(temp * 10.0 + 0.5);
  }

  if (!isnan(hum)) {
    s.buffer1 = (int)(hum * 10.0 + 0.5);
  }

  s.lastReadTime = now;
}