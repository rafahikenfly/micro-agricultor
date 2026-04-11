
// ===== LED COLORS =====
void ledOff() {
  digitalWrite(LED_R, LOW);
  digitalWrite(LED_G, LOW);
  digitalWrite(LED_B, LOW);
}
void ledRed() {
  digitalWrite(LED_R, HIGH);
  digitalWrite(LED_G, LOW);
  digitalWrite(LED_B, LOW);
}
void ledYellow() {
  digitalWrite(LED_R, HIGH);
  digitalWrite(LED_G, HIGH);
  digitalWrite(LED_B, LOW);
}
void ledGreen() {
  digitalWrite(LED_R, LOW);
  digitalWrite(LED_G, HIGH);
  digitalWrite(LED_B, LOW);
}
void ledBlue() {
  digitalWrite(LED_R, LOW);
  digitalWrite(LED_G, LOW);
  digitalWrite(LED_B, HIGH);
}

void iniciarBlink(void (*cor)(), unsigned long duracao, unsigned long intervalo) {
  ledBlinkCor = cor;
  ledBlinkDuracao = duracao;
  ledBlinkIntervalo = intervalo;

  ledBlinkInicio = millis();
  ledBlinkUltimaTroca = millis();

  ledBlinkEstado = true;
  ledBlinkAtivo = true;

  cor();
}
void atualizarBlink() {

  if (!ledBlinkAtivo) return;

  unsigned long now = millis();

  // terminou duração
  if (now - ledBlinkInicio >= ledBlinkDuracao) {
    ledOff();
    ledBlinkAtivo = false;
    return;
  }

  // hora de alternar
  if (now - ledBlinkUltimaTroca >= ledBlinkIntervalo) {
    ledBlinkUltimaTroca = now;
    ledBlinkEstado = !ledBlinkEstado;
    if (ledBlinkEstado)
      ledBlinkCor();
    else
      ledOff();
  }
}