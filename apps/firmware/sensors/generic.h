
enum SensorType {
    SENSOR_ANALOG,
    SENSOR_DIGITAL,
    SENSOR_DHT11,
};

struct Sensor {
  int pin;
  SensorType type;
  int value;
  bool lastReading;
  unsigned long lastDebounceTime;  
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

    case SENSOR_DHT11:
      // implementar depois
      break;
  }
}