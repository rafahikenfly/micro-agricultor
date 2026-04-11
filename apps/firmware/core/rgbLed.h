#ifndef LED_H
#define LED_H

#include <Arduino.h>

// ===== Tipos =====
typedef void (*LedColorFunc)();

// ===== Estado interno =====
static uint8_t _pinR, _pinG, _pinB;

// blink
static LedColorFunc _blinkColor = nullptr;
static unsigned long _blinkInterval = 0;
static bool _blinkState = false;
static bool _blinkActive = false;
static unsigned long _lastToggle = 0;

// fade
static unsigned long _fadeInterval = 0; // velocidade do fade
static int _fadeValue = 0;
static int _fadeDirection = 1; // 1 = sobe, -1 = desce
static unsigned long _lastFade = 0;


// ===== Setup =====
static inline void ledStart(uint8_t pinR, uint8_t pinG, uint8_t pinB) {
  _pinR = pinR;
  _pinG = pinG;
  _pinB = pinB;

  pinMode(_pinR, OUTPUT);
  pinMode(_pinG, OUTPUT);
  pinMode(_pinB, OUTPUT);

  digitalWrite(_pinR, LOW);
  digitalWrite(_pinG, LOW);
  digitalWrite(_pinB, LOW);
}

// ===== Cores =====
static inline void ledOff() {
  digitalWrite(_pinR, LOW);
  digitalWrite(_pinG, LOW);
  digitalWrite(_pinB, LOW);
}
static inline void ledRed() {
  digitalWrite(_pinR, HIGH);
  digitalWrite(_pinG, LOW);
  digitalWrite(_pinB, LOW);
}
static inline void ledYellow() {
  digitalWrite(_pinR, HIGH);
  digitalWrite(_pinG, HIGH);
  digitalWrite(_pinB, LOW);
}
static inline void ledGreen() {
  digitalWrite(_pinR, LOW);
  digitalWrite(_pinG, HIGH);
  digitalWrite(_pinB, LOW);
}
static inline void ledBlue() {
  digitalWrite(_pinR, LOW);
  digitalWrite(_pinG, LOW);
  digitalWrite(_pinB, HIGH);
}

static inline void ledFadeBlue() {
  digitalWrite(_pinR, LOW);
  digitalWrite(_pinG, LOW);
  analogWrite(_pinB, _fadeValue);
}

// ===== Blink =====
static inline void ledBlinkStart(
  LedColorFunc color,
  unsigned long blinkInterval,
  unsigned long fadeInterval = 0
) {
  _blinkColor = color;
  _blinkInterval = blinkInterval;
  _fadeInterval = fadeInterval;

  _lastToggle = millis();
  _lastFade = millis();
  _blinkState = true;
  _blinkActive = true;
  _fadeValue = 0;
  _fadeDirection = 1;

  if (_blinkColor) _blinkColor();
}

static inline void ledBlinkStop() {
  _blinkActive = false;
  ledOff();
}

static inline void ledLoop() {
  if (!_blinkActive) return;
  
  unsigned long now = millis();

  //FADE
  if (_fadeInterval > 0) {
    if (now - _lastFade >= _fadeInterval) {
      _lastFade = now;

      _fadeValue += _fadeDirection * 5;

      if (_fadeValue >= 255) {
        _fadeValue = 255;
        _fadeDirection = -1;
      } else if (_fadeValue <= 0) {
        _fadeValue = 0;
        _fadeDirection = 1;
      }
      //TODO: OUTRAS CORES
      ledFadeBlue();
    }
    return;
  }

  //BLINK
  if (now - _lastToggle >= _blinkInterval) {
    _lastToggle = now;
    _blinkState = !_blinkState;

  if (_blinkState && _blinkColor)
    _blinkColor();
  else
    ledOff();
  }
}

// ===== Callback padrão =====
static inline void ledWaiting(unsigned long now) {
  static unsigned long last = 0;
  static bool state = false;

  if (now - last >= 300) {
    last = now;
    state = !state;

    if (state)
      ledBlue();
    else
      ledOff();
  }
}

// ===== ERROR =====
static inline void ledError() {
  ledBlinkStop();
  for(int i=0; i<4; i++) {
    ledRed();
    delay(250);
    ledOff();
    delay(250);
  }
}
// ===== SUCCESS =====
static inline void ledSuccess() {
  ledBlinkStop();
  for(int i=0; i<4; i++) {
    ledGreen();
    delay(250);
    ledOff();
    delay(250);
  }
}
// ===== IDLE =====

#endif