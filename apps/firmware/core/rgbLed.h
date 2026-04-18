#ifndef LED_H
#define LED_H

#include <Arduino.h>

// ===== Tipos =====
typedef void (*LedColorFunc)(uint8_t);

// ===== Estado interno =====
static uint8_t _pinR, _pinG, _pinB;

// blink
static LedColorFunc _blinkColor = nullptr;
static unsigned long _blinkInterval = 0;
static bool _blinkActive = false;
static uint8_t _maxInterval = 0;
static uint8_t _maxIntensity = 255;
static unsigned long _fadeInterval = 0;
static unsigned long _cycleStart = 0;
//static bool _blinkState = false;
//static unsigned long _lastToggle = 0;

// fade
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
static inline void ledOff(uint8_t fadeValue = 255) {
  digitalWrite(_pinR, LOW);
  digitalWrite(_pinG, LOW);
  digitalWrite(_pinB, LOW);
}
static inline void ledRed(uint8_t fadeValue = 255) {
  analogWrite(_pinR, fadeValue);
  digitalWrite(_pinG, LOW);
  digitalWrite(_pinB, LOW);
}
static inline void ledYellow(uint8_t fadeValue = 255) {
  analogWrite(_pinR, fadeValue);
  analogWrite(_pinG, fadeValue);
  digitalWrite(_pinB, LOW);
}
static inline void ledGreen(uint8_t fadeValue = 255) {
  digitalWrite(_pinR, LOW);
  analogWrite(_pinG, fadeValue = 255);
  digitalWrite(_pinB, LOW);
}
static inline void ledBlue(uint8_t fadeValue = 255) {
  digitalWrite(_pinR, LOW);
  digitalWrite(_pinG, LOW);
  analogWrite(_pinB, fadeValue);
}

// ===== Blink =====
static inline void ledBlinkStart(
  LedColorFunc color,
  unsigned long blinkInterval,
  unsigned long fadeInterval = 0,
  unsigned long maxInterval = 0,
  uint8_t maxIntensity = 255
) {
  _blinkColor = color;
  _blinkInterval = blinkInterval;
  _fadeInterval = fadeInterval;
  _maxInterval = maxInterval;
  _maxIntensity = maxIntensity;

  _cycleStart = millis();
  _blinkActive = true;
}

static inline void ledBlinkStop() {
  _blinkActive = false;
  ledOff();
}

static inline void ledLoop() {
  if (!_blinkActive || !_blinkColor) return;
  
  unsigned long now = millis();
  unsigned long t = now - _cycleStart;

  // calcula ciclo
  unsigned long fadeInStart  = _blinkInterval;
  unsigned long fadeInEnd    = fadeInStart + _fadeInterval;
  unsigned long fadeOutStart = fadeInEnd + _maxInterval;
  unsigned long fadeOutEnd   = fadeOutStart + _fadeInterval;

  // reinicia ciclo
  if (t >= fadeOutEnd) {
    _cycleStart = now;
    t = 0;
  }
  uint8_t value = 0;

  // --- FADE IN ---
  if (_fadeInterval > 0 && t >= fadeInStart && t < fadeInEnd) {
    unsigned long fadeTime = t - fadeInStart;
    float progress = (float)fadeTime / _fadeInterval;
    value = progress * _maxIntensity;
  }
  // --- ON (PLENO) ---
  else if (t >= fadeInEnd && t < fadeOutStart) {
    value = _maxIntensity;
  }
  // --- FADE OUT ---
  else if (_fadeInterval > 0 && t >= fadeOutStart && t < fadeOutEnd) {
    unsigned long fadeTime = t - fadeOutStart;
    float progress = (float)fadeTime / _fadeInterval;
    value = _maxIntensity * (1.0 - progress);
  }
  // --- OFF ---
  else {
    value = 0;
  }

  _blinkColor(value);
}

// ===== PADROES DE LED =====
// ===== WAITING =====
static inline void ledWaiting() {
  ledBlinkStart(ledBlue, 10000, 2000, 1000, 170);
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