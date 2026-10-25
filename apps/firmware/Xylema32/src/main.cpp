#include <Arduino.h>
#include <Preferences.h>
#include <WiFi.h>
#include <queue>
#include <ArduinoJson.h>

#include <WiFiManager.h>
#include <PubSubClient.h>

#include <grbl.h>

// ==== DEFINIÇÕES
#define CONFIG_NETWORK "xylema32"
#define VERSION "0.01"

// === ENUM E CLASSES
enum TipoEvento {
  INFO,
  LEVE,
  GRAVE,
  CRITICO,
};
enum DebugLevel {
    DEBUG_ALWAYS = 0,
    DEBUG_ERROR = 1,
    DEBUG_EVENT = 2,
    DEBUG_INFO = 3,
    DEBUG_VERBOSE = 4
};
enum EstadoXylema {
    PRONTO,               // Pronto para receber novas instruções
    AGUARDANDO_GRBL_OK,   // Esperando o 'ok' de um comando enviado
    AGUARDANDO_GRBL_IDLE, // Esperando o GRBL voltar ao estado IDLE (ex: para executar um sync)
    AGUARDANDO,
    BLOQUEADO,
    ERRO_CRITICO          // Falha crítica: requer intervenção
};
struct ComandoCNC {
    long id;
    String data;
    String job;
    bool rt;
};

// Constantes de configuração em nível de hardware
const int TOTAL_ATUADORES = 4;      // MAX = 5 (8 DO ESP - 3 DO RGB)
const int TOTAL_DOCKS = 4;          // R, S, T e U
const int tamanhoFila = 64;         // instrucoes
const int timeoutGRBLOk   =  60000; // ms
const int timeoutGRBLIdle = 600000; // ms
const int longPushMs   =  2000;     // ms
const bool verbose = false;

// Definicao de Pinos
const int LED_R_PIN = 6;
const int LED_G_PIN = 5;
const int LED_B_PIN = 4;
const int GRBL_TX = 9;
const int GRBL_RX = 10;
const int GRBL_RESET_PIN = 11;
const int GRBL_RESUME_PIN = 12;
const int GRBL_HOLD_PIN = 13;
const int GRBL_ABORT_PIN = 14;
const int PUSH_PIN = 7;
const int ATUADOR_PIN[TOTAL_ATUADORES] = { 15, 16, 17, 18};


// Canais LED
const int CHANNEL_R = 5;
const int CHANNEL_G = 6;
const int CHANNEL_B = 7;


// Variáveis de configuração em nível de software
String ssid;
String password;
String mqtt_server;
String mqtt_command_channel;
String mqtt_ack_channel;
String mqtt_status_channel;
String mqtt_event_channel;
int intervaloEstado;
int pwmMax[TOTAL_ATUADORES] = { 255,  255, 255, 255};
int pwmMin[TOTAL_ATUADORES] = {   0,   0,    0,   0};
float parkPos[3]    = {-5, -5, -5};
float dockPos[TOTAL_DOCKS][3] = {
    {-50, -100, -550},
    {-50, -200, -550},
    {-50, -300, -550},
    {-50, -400, -550} 
};
int debugLevel = DEBUG_VERBOSE;

// Instâncias globais
Preferences preferences;
WiFiClient espClient;
PubSubClient client(espClient);
std::queue<ComandoCNC> filaCNC;
HardwareSerial SerialGRBL(2); // Porta Serial 2 para o GRBL

// Variáveis de estado
bool pushed = true;
EstadoXylema estadoXylema = PRONTO;
EstadoGRBL estadoGRBL = DESCONHECIDO;
int intervaloStatusGRBL = 1000;
PosicaoCNC posicaoGRBL = {0.0, 0.0, 0.0};
static String endstopGRBL = "";
static int bufferGRBL = 0;
int estadoAtuadorMapeado[TOTAL_ATUADORES] ={ 0, 0, 0, 0,};
int estadoAtuadorNormalizado[TOTAL_ATUADORES] ={ 0, 0, 0, 0,};
String jobAtual = "";

// Variáveis de timestamp
static unsigned long ultimoStatusGRBLTs = 0;
static unsigned long ultimoEstadoMQTTTs = 0;
static unsigned long inicioEsperaTs = 0;
static unsigned long erroLedFimTs = 0;
static unsigned long pushStartTs = 0;
static int delayMs = 0;


// Declarações de funções
void setupPins();
void wifiConfig();
void lerConfig();
void connectWiFI();
void setupMQTT();
void connectMQTT();
void serialGRBLSend(String data);
void serialGRBLReceive();

void ledFade(int maxR, int maxG, int maxB, unsigned long tempoFadeMs, unsigned long intervaloMaximosMs);
void led(int r, int g, int b);
void loopLED();
void processarPush(unsigned long duracaoPush);
void loopPush();
void logDebug(int level, const char* formato, ...);
void logWaiting(int level);

void callbackMQTT(char* topic, byte* payload, unsigned int length);
void acknowledgeCompleted(long id);
void acknowledgeError(long id, const String& errorMsg);
void acknowledgeQueued(long id);
void reportStatusMQTT();
void reportEventMQTT(int tipo, String mensagem, String origem);

bool handleComandoXylema(ComandoCNC comando, bool popQueue);
bool handleComandoEMERGENCY();
bool handleComandoHEARTBEAT();
bool handleComandoHOME_CYCLE();
bool handleComandoON(ComandoCNC comando);
bool handleComandoOFF(ComandoCNC comando);
bool handleComandoSET(ComandoCNC comando);
bool handleComandoJOB(ComandoCNC comando);
bool handleComandoPARK(ComandoCNC comando);
bool handleComandoPICK(ComandoCNC comando);
bool handleComandoDROP(ComandoCNC comando);
bool handleComandoDELAY(ComandoCNC comando);
bool handleComandoUNLOCK(ComandoCNC comando);

void limparFila(String mensagem);
void updateGRBLStatus();
void processarFila();

void handleGRBLStatusMsg(String linha);
void handleGRBLAlarm(String linha);
void handleGRBLError(String linha);
void handleGRBLTimeout(String msgTimeout);

void loopAtuadores();
void loopDelay();
void loopIdleTimeout();
void loopOkTimeout();

// ==
// SETUP
// == 
void setupPins() {
  logDebug(DEBUG_VERBOSE, "setupPins iniciado em %lu ms", millis());
  // Pinos RGB
  pinMode(LED_R_PIN, OUTPUT);
  pinMode(LED_G_PIN, OUTPUT);
  pinMode(LED_B_PIN, OUTPUT);

  // Configuração do PWM do ESP32 (Frequência de 5000Hz, resolução de 8 bits = 0 a 255)
  //ledcSetup(CHANNEL_R, 5000, 8);
  //ledcAttachPin(LED_R_PIN, CHANNEL_R);
  //ledcSetup(CHANNEL_G, 5000, 8);
  //ledcAttachPin(LED_G_PIN, CHANNEL_G);
  //ledcSetup(CHANNEL_B, 5000, 8);
  //ledcAttachPin(LED_B_PIN, CHANNEL_B);
  ledcAttach(LED_R_PIN, 5000, 8);
  ledcAttach(LED_G_PIN, 5000, 8);
  ledcAttach(LED_B_PIN, 5000, 8);
  // Pino do Botão (le estado do botao)
  pinMode(PUSH_PIN, INPUT_PULLUP);
  pushed = (digitalRead(PUSH_PIN) == LOW);

  // Pinos de atuadores
  for (int i = 0; i < TOTAL_ATUADORES; i++) {
    pinMode(ATUADOR_PIN[i], OUTPUT);
    if (pwmMax[i] == -1) {
      // Digital puro HIGH == desligado
      digitalWrite(ATUADOR_PIN[i], HIGH);
    } else if (pwmMax[i] == 1) {
      // Digital puro LOW == desligado
      digitalWrite(ATUADOR_PIN[i], LOW);
    } else {
      // Analógico
      //ledcSetup(i, 5000, 8);             // Frequência de 5kHz, 8 bits (0-255)
      //ledcAttachPin(ATUADOR_PIN[i], i);  // Associa o pino ao canal 'i'
      ledcAttach(ATUADOR_PIN[i], 5000, 8);
      ledcWrite(ATUADOR_PIN[i], 0);                   // Garante que inicia desligado (PWM = 0)    }
    }
  }

  // Pinos do GRBL (manda pulso)
  pinMode(GRBL_RESET_PIN, OUTPUT);
  digitalWrite(GRBL_RESET_PIN, HIGH);
  pinMode(GRBL_HOLD_PIN, OUTPUT);
  digitalWrite(GRBL_HOLD_PIN, HIGH);
  pinMode(GRBL_ABORT_PIN, OUTPUT);
  digitalWrite(GRBL_ABORT_PIN, HIGH);
  pinMode(GRBL_RESUME_PIN, OUTPUT);
  digitalWrite(GRBL_RESUME_PIN, HIGH);
}
void wifiConfig() {
  logDebug(DEBUG_EVENT, "Xylema em mode de configuração Wi-fi. Acesse a rede %s", CONFIG_NETWORK);
  led(255,120,0);
  WiFiManager wm;
  
  // Campos customizados para o MQTT
  WiFiManagerParameter custom_mqtt_server("server", "IP do Raspberry Pi (MQTT)", "192.168.18.15", 40);
  WiFiManagerParameter custom_cmd_ch("cmd", "Canal MQTT Comandos", "cnc/comandos", 40);
  WiFiManagerParameter custom_ack_ch("ack", "Canal MQTT ACK", "cnc/ack", 40);
  WiFiManagerParameter custom_status_ch("status", "Canal MQTT Estado", "cnc/estado", 40);
  WiFiManagerParameter custom_event_ch("status", "Canal MQTT Evento", "cnc/evento", 40);

  wm.addParameter(&custom_mqtt_server);
  wm.addParameter(&custom_cmd_ch);
  wm.addParameter(&custom_ack_ch);
  wm.addParameter(&custom_status_ch);
  wm.addParameter(&custom_event_ch);

  // Inicia o Access Point e trava aguardando a configuração
  if (!wm.startConfigPortal(CONFIG_NETWORK)) {
    logDebug(DEBUG_ERROR, "Falha ao criar portal de configuração. Reiniciando ESP.");
    delay(3000);
    ESP.restart();
    return;
  }

  // Se configurou com sucesso, pega os valores preenchidos e salva no Preferences
  preferences.begin("xylema-cfg", false);
  preferences.putString("ssid", wm.getWiFiSSID());
  preferences.putString("password", wm.getWiFiPass());
  preferences.putString("mqtt_srv", custom_mqtt_server.getValue());
  preferences.putString("cmd_ch", custom_cmd_ch.getValue());
  preferences.putString("ack_ch", custom_ack_ch.getValue());
  preferences.putString("status_ch", custom_status_ch.getValue());
  preferences.putString("event_ch", custom_event_ch.getValue());
  preferences.end();

  logDebug(DEBUG_INFO, "Configurações salvas com sucesso.");
  led(0, 255, 0); 
  delay(1000);
}
void lerConfig() {
  preferences.begin("xylema-cfg", true); // Modo leitura (read-only)
  
  // Carrega os valores salvos, ou usa um padrão caso estejam vazios
  ssid = preferences.getString("ssid", "DEFAULT_SSID");
  password = preferences.getString("password", "DEFAULT_PASS");
  mqtt_server = preferences.getString("mqtt_srv", "192.168.18.15");
  mqtt_command_channel = preferences.getString("cmd_ch", "cnc/comandos");
  mqtt_ack_channel = preferences.getString("ack_ch", "cnc/ack");
  mqtt_status_channel = preferences.getString("status_ch", "cnc/estado");
  mqtt_event_channel = preferences.getString("event_ch", "cnc/evento");
  intervaloEstado = preferences.getInt("intervalo", 1000);
  debugLevel = preferences.getInt("dbg_level", 2); // Padrão 2 (INFO) se não existir

  // Tenta ler o pwmMax. Se a chave "pwmMax" existir, o getBytes preenche o array.
  size_t bytesMax = preferences.getBytes("pwmMax", pwmMax, sizeof(pwmMax));
  if (bytesMax == 0) {
    // Se não existir nada salvo ainda, definimos os padrões no array local
    int padraoMax[TOTAL_ATUADORES] = { 255, 255, 255, 255 };
    memcpy(pwmMax, padraoMax, sizeof(pwmMax));
  }

  // Tenta ler o pwmMin
  size_t bytesMin = preferences.getBytes("pwmMin", pwmMin, sizeof(pwmMin));
  if (bytesMin == 0) {
    int padraoMin[TOTAL_ATUADORES] = { 0, 0, 0, 0 };
    memcpy(pwmMin, padraoMin, sizeof(pwmMin));
  }  

  // Tenta ler o parkPos.
  size_t bytesParkPos = preferences.getBytes("parkPos", parkPos, sizeof(parkPos));
  if (bytesParkPos == 0) {
    // Se não existir nada salvo ainda, definimos os padrões no array local
    float padraoPos[3] = { -5.0f, -5.0f, -5.0f };
    memcpy(parkPos, padraoPos, sizeof(parkPos));
  }

  // Tenta ler o dockPos
  size_t bytesDockPos = preferences.getBytes("dockPos", dockPos, sizeof(dockPos));
  if (bytesDockPos == 0) {
    // Se não existir nada salvo ainda, define os padrões no array local
    float padraoDocks[TOTAL_DOCKS][3] = {
      {-5.0f, -100.0f, -550.0f},
      {-5.0f, -200.0f, -550.0f},
      {-5.0f, -300.0f, -550.0f},
      {-5.0f, -400.0f, -550.0f}
    };
    memcpy(dockPos, padraoDocks, sizeof(dockPos));
  }

  preferences.end();

  logDebug(DEBUG_EVENT, "Configurações lidas com sucesso.");
  logDebug(DEBUG_INFO, "SSID %s", ssid);
  logDebug(DEBUG_INFO, "PASSWORD %s", password);
  logDebug(DEBUG_INFO, "MQTT SERVER: %s", mqtt_server);
  logDebug(DEBUG_INFO, "CMD: %s, ACK: %s, STATUS: %s, EVENTOS: %s", 
           mqtt_command_channel.c_str(), 
           mqtt_ack_channel.c_str(), 
           mqtt_status_channel.c_str(), 
           mqtt_event_channel.c_str());

  // Exibindo os arrays PWM no Serial Monitor
  for (int i = 0; i < TOTAL_ATUADORES; i++) {
    logDebug(DEBUG_INFO, "Atuador %d: Min=%d, Max=%d", i, pwmMin[i], pwmMax[i]);
  }

  // Posições salvas
  logDebug(DEBUG_INFO, "Estacionamento: %.2f, %.2f, %.2f", parkPos[0], parkPos[1], parkPos[2]);
  for (int d = 0; d < TOTAL_DOCKS; d++) {
    logDebug(DEBUG_INFO, "Doca %d: %.2f, %.2f, %.2f", d, dockPos[d][0], dockPos[d][1], dockPos[d][2]);
  }
}

// ==
// CONECTIVIDADE
// ==
void connectWiFI() {
  delay(10);
  led(255, 120, 0); // Indica tentativa de conexão
  logDebug(DEBUG_EVENT, "Conectando ao WiFi...");
  WiFi.begin(ssid, password);

  unsigned long startTime = millis();
  const unsigned long timeout = 30000; // 30 segundos em milissegundos
    while (WiFi.status() != WL_CONNECTED) {
      logWaiting(DEBUG_VERBOSE);
      // Verifica se o tempo limite de 30s foi atingido
      if (millis() - startTime >= timeout) {
        // TIMEOUT: Não conectou
        logDebug(DEBUG_ERROR, "Timeout conectando WiFi");
        led(255, 0, 0); // Vermelho
        delay(1000);
        led(0, 0, 0);
        return;
      }
      delay(200);
    }
    led(0,255,0);
    logDebug(DEBUG_EVENT, "Conectado a %s", ssid);
    delay(1000);
}
void setupMQTT() {
    client.setServer(mqtt_server.c_str(), 1883);
    client.setCallback(callbackMQTT);  
}
void connectMQTT() {
  led(64, 30, 0);
  logDebug(DEBUG_EVENT, "Conectando ao MQTT...");

  unsigned long startTime = millis();
  const unsigned long timeout = 30000; // 30 segundos em milissegundos

  while (!client.connected()) {
    logWaiting(DEBUG_VERBOSE);
    // Tenta conectar ao broker MQTT
    if (millis() - startTime >= timeout) {
      // TIMEOUT: Não conectou
      led(255, 0, 0); // Vermelho
      logDebug(DEBUG_ERROR, "Timeout conectando MQTT");
      delay(1000);
      led(0, 0, 0);   // Apaga
      return;
    }
    if (client.connect("ESP32_GRBL_Bridge")) {
      client.subscribe(mqtt_command_channel.c_str());
      // CONECTADO COM SUCESSO!
      led(0, 255, 0); // Verde
      logDebug(DEBUG_EVENT, "Conectado a %s", mqtt_server);
      delay(1000);
      led(0, 0, 0);   // Apaga
    }
    reportEventMQTT(INFO, "Xylema32 conectado", "Xylema");
    delay(200);
  }
}
void serialGRBLSend(String data) {
  // Reporta no Serial
  if (data == "?"){
    logWaiting(DEBUG_VERBOSE);
  } else {
    logDebug(DEBUG_INFO, "--> GRBL: %s ", data.c_str());
  }

  // Comandos especiais: rt commands - não muda estado ne usa linha no final
  if (data == "?" || data == "~" || data == "!" || data == "\x18") SerialGRBL.print(data);
    // Todos os outros comandos
  else {
    SerialGRBL.print(data + "\n");
    estadoXylema = AGUARDANDO_GRBL_OK;
  }
}
void serialGRBLReceive() {
  while (SerialGRBL.available()) {
    String linha = SerialGRBL.readStringUntil('\n');
    linha.trim();

    // MENSAGEM DE ESTADO
    if (linha.startsWith("<")) {
      logDebug(DEBUG_VERBOSE, "<-- GRBL: %s ", linha.c_str());
      handleGRBLStatusMsg(linha);
      continue;
    }

    // OK DO GRBL
    if (linha == "ok") {
      logDebug(DEBUG_VERBOSE, "<-- GRBL: %s ", linha.c_str());
      if (estadoXylema == AGUARDANDO_GRBL_OK) {
        ComandoCNC atual = filaCNC.front();
        acknowledgeCompleted(atual.id);
        filaCNC.pop();
        estadoXylema = PRONTO;
      }
      continue;
    }

    // MENSAGENS IGNORADAS:
    if (linha.length() == 0 ||                        //linha vazia
        linha.startsWith("Grbl 1.1") ||               //linha de inicio
        linha.startsWith("[MSG:Caution: Unlocked]")) {//alerta de unlock
      logDebug(DEBUG_VERBOSE, "<-- GRBL: %s ", linha.c_str());
      continue;
    }

    // GRBL TRANCADO
    if (linha.startsWith("[MSG:'$H'|'$X' to unlock]")) {
      logDebug(DEBUG_EVENT, "<-- GRBL: %s ", linha.c_str());
      if (estadoXylema == ERRO_CRITICO) {
        // Em ERRO_CRITICO, precisa de intervenção humana.
        logDebug(DEBUG_ERROR, "Erro crítico no Xylema32. Verificar manualmente.");
      } else {
        // Ou, tenta fazer o homing.
        logDebug(DEBUG_INFO, "Recuperando por homing.");
        handleComandoHOME_CYCLE();
      }
      continue;
    }

    // ERROS E ALARMES SÃO GERENCIADOS PELO HANDLER
    if (linha.startsWith("ALARM:")) handleGRBLAlarm(linha);
    if (linha.startsWith("error:")) handleGRBLError(linha);

    // LINHA DE CONFIGURAÇÃO
    if (linha.startsWith("$")) {
      logDebug(DEBUG_INFO, linha.c_str());
    }
  }
}


// ===
// INTERFACE (LED E PUSH)
// ===
void led(int r, int g, int b) {
  ledcWrite(LED_R_PIN, r);
  ledcWrite(LED_G_PIN, g);
  ledcWrite(LED_B_PIN, b);
}
void ledFade(int maxR, int maxG, int maxB, unsigned long tempoFadeMs, unsigned long intervaloMaximosMs) {
  unsigned long agora = millis();
  
  // Calcula em qual momento do ciclo atual nós estamos (de 0 até intervaloMaximosMs)
  unsigned long tempoNoCiclo = agora % intervaloMaximosMs;

  int brilhoAjustado = 0;

  // Se o tempo atual estiver dentro da janela do fade
  if (tempoNoCiclo < tempoFadeMs) {
      // Mapeia o tempo do fade para o intervalo de 0 a PI (180 graus), que é a metade positiva da onda seno
      // sin(0) = 0 (apagado), sin(PI/2) = 1 (máximo), sin(PI) = 0 (apagado)
      float angulo = (float)tempoNoCiclo / tempoFadeMs * 3.14159265;
      
      // Aplica a função seno e multiplica pelo valor máximo da cor (0 a 255)
      float senoide = sin(angulo);
      brilhoAjustado = (int)(senoide * 255);
  } 
  else {
      // Se passou do tempo do fade, o LED fica totalmente desligado até o próximo ciclo
      brilhoAjustado = 0;
  }

  // Aplica a intensidade proporcional em cada canal RGB
  // (Se a cor máxima for 255, ele usa o brilho cheio. Se for 0, fica apagado).
  int r = (maxR > 0) ? (maxR * brilhoAjustado / 255) : 0;
  int g = (maxG > 0) ? (maxG * brilhoAjustado / 255) : 0;
  int b = (maxB > 0) ? (maxB * brilhoAjustado / 255) : 0;

  led(r, g, b);
}
void loopLED() {
  unsigned long agora = millis();
  // 1. Prioridade máxima: Alerta de erro temporário (veio do acknowledgeError)
  if (agora < erroLedFimTs) {
    ledFade(255, 0, 0, 150, 300);
    return;
  }
  // 2. Erro de Rede (MQTT desconectado OU WIFI desconectado) -> Vermelho piscando lento
  if (!client.connected() || WiFi.status() != WL_CONNECTED) {
    ledFade(255, 0, 0, 1500, 3000);
    return;
  }
  // 3. Estados críticos que bloqueiam o envio de mensagens para o GRBL
  // (Xylema Bloqueado OU Erro Crítico) -> Vermelho fixo
  // (GRBL em Home) -> Azul fixo
  // (Fila cheia) -> Amarelo fixo
  if (estadoGRBL == HOMING) {
    led(0, 0, 255); 
    return;
  }
  if (estadoXylema == BLOQUEADO || estadoXylema == ERRO_CRITICO) {
    led(255, 0, 0); 
    return;
  }
  if (filaCNC.size() >= tamanhoFila) {
    led(255, 255, 0);
    return;
  }

  // 4. Estado do Xylema
  // Aguardando idle -> Branco piscando lento
  // Aguardando ok   -> Amarelo piscando lento 
  // Fluxo normal    -> Verde piscando lento
  // Xylema pronto   -> Azul piscando muito lento
  if (estadoXylema == AGUARDANDO_GRBL_IDLE) {
    ledFade(255, 255, 255, 1500, 3000);
    return;
  }
  if (estadoXylema == AGUARDANDO_GRBL_OK) {
    ledFade(0, 255, 255, 1500, 3000);
    return;
  }

  int atuadorLigado = 0;
  for (int i = 0; i<TOTAL_ATUADORES; i++) {
    atuadorLigado += estadoAtuadorMapeado[i];
  }
  if (filaCNC.size() > 0 || estadoGRBL == ATIVO || atuadorLigado > 0) {
    ledFade(0, 255, 0, 1500, 3000);
    return;
  }

  if (estadoXylema == PRONTO) {
    ledFade(0, 0, 255, 1500, 6000);
    return;
  }

  // 5. ESTADO DESCONHECIDO (Fallback): Catch-all -> branco fixo
  led(255, 255, 255);
}
void processarPush(unsigned long duracaoPush) {
  bool eLongPush = (duracaoPush >= longPushMs);

  // Caso 1: Xylema Bloqueado
  if (estadoXylema == BLOQUEADO || estadoXylema == ERRO_CRITICO) {
    if (eLongPush) {
      logDebug(DEBUG_EVENT, "Reset GRBL manual");
      reportEventMQTT(INFO, "Reset GRBL manual", "Xylema32");
      limparFila("Reset manual");
      pulsoGRBL(GRBL_RESET_PIN, 100, 2000);
    }
    else {
      logDebug(DEBUG_ERROR, "Push curto sem ação com Xylema32 bloqueado");
    }
    return;
  }
  // CASO 2: Xylema Desbloqueado (normal/pronto)
  else {
    if (eLongPush) {
      logDebug(DEBUG_EVENT, "Cycle GRBL manual");
      reportEventMQTT(INFO, "Cycle GRBL manual", "Xylema32");
      pulsoGRBL(GRBL_RESUME_PIN);
    } 
    else {
      logDebug(DEBUG_EVENT, "Hold GRBL manual");
      reportEventMQTT(INFO, "Hold GRBL manual", "Xylema32");
      pulsoGRBL(GRBL_HOLD_PIN);
    }
  }
}
void loopPush() {
  // Como usa INPUT_PULLUP, o botão pressionado lê LOW
  int leituraBotao = digitalRead(PUSH_PIN);

  // Botao acabou de ser apertado
  if (leituraBotao == LOW && !pushed) {
    delay(30); // Debounce simples
    if (digitalRead(PUSH_PIN) == LOW) {
      logDebug(DEBUG_VERBOSE, "Botão pressionado.");
      pushed = true;
      pushStartTs = millis();
    }
  }

  // Botao acabou de ser solto
  if (leituraBotao == HIGH && pushed) {
    delay(30); // Debounce
    if (digitalRead(PUSH_PIN) == HIGH) {
      unsigned long duracao = millis() - pushStartTs;
      logDebug(DEBUG_VERBOSE, "Botão solto após %lu ms.", duracao);
      pushed = false;
      // Executa a lógica com base no tempo que ficou pressionado
      processarPush(duracao);
    }
  }
}
void logDebug(int level, const char* formato, ...) {
  if (debugLevel >= level) {
    char loc_buf[256];
    va_list args;
    va_start(args, formato);
    vsnprintf(loc_buf, sizeof(loc_buf), formato, args);
    va_end(args);
    Serial.println(loc_buf);
  }
}
void logWaiting(int level) {
  if (debugLevel >= level) {
    Serial.print(".");
  }
}
// ===
// COMUNICACAO MQTT
// ==
void callbackMQTT(char* topic, byte* payload, unsigned int length) {
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, payload, length);

  logDebug(DEBUG_INFO, "<-- MQTT: %.*s", length, payload);
  if (error) {
    logDebug(DEBUG_ERROR, "Erro deserializando: %s", error.c_str());
    return;
  }

  // 1. Recebimento do comando
  long id = doc["id"] | 0;
  String data = doc["data"] | "";
  String job = doc["job"] | "";
  bool rt = doc["rt"] | false;

  ComandoCNC comando;
  comando.id = id;
  comando.data = data;
  comando.rt = rt;
  comando.job = job;

  // 2. Erros de recebimento
  if (estadoXylema == BLOQUEADO && !data.startsWith("UNLOCK") && !data.startsWith("RESET")) {
    logDebug(DEBUG_ERROR, "Xylema bloqueado");
    acknowledgeError(id, "Xylema bloqueado");
    reportEventMQTT(LEVE, "Bloqueado", "XYLEMA32");
    return;
  }

  if (filaCNC.size() >= tamanhoFila) {
    logDebug(DEBUG_ERROR, "Fila cheia");
    acknowledgeError(id, "Fila cheia");
    reportEventMQTT(LEVE, "Fila Cheia", "XYLEMA32");
    return;
  }

  if (!comando.rt && comando.job != jobAtual) {
    logDebug(DEBUG_ERROR, "Xylema ocupado com outra tarefa: %s", jobAtual);
    acknowledgeError(id, "Xylema ocupado");
    reportEventMQTT(LEVE, "Xylema ocupado", "XYLEMA32");
    return;
  }

  // 3. Processa ou inclui na fila
  if (comando.rt) handleComandoXylema(comando, false);
  else {
    // Adiciona na fila e marca acnowledge
    filaCNC.push(comando);
    acknowledgeQueued(id);
  }
}
void acknowledgeQueued(long id) {
  char payload[64];
  snprintf(payload, sizeof(payload), "{\"id\":%ld,\"status\":\"QUEUED\"}", id);
  logDebug(DEBUG_VERBOSE, "--> MQTT: %s", payload);
  if (!client.publish(mqtt_ack_channel.c_str(), payload)) logDebug(DEBUG_ERROR, "Erro publicando ack (estado MQTT: %d", client.state());
}
void acknowledgeError(long id, const String& errorMsg) {
  char payload[256];
  int maxErrorLen = sizeof(payload) - 50; // Reserva espaço no buffer para a estrutura fixa do JSON (ID, status, chaves, aspas e chaves de fechamento)
  snprintf(payload, sizeof(payload), "{\"id\":%ld,\"status\":\"ERROR\",\"data\":\"%.*s\"}", id, maxErrorLen, errorMsg.c_str());    
  logDebug(DEBUG_VERBOSE, "--> MQTT: %s", payload);
  if (!client.publish(mqtt_ack_channel.c_str(), payload)) logDebug(DEBUG_ERROR, "Erro publicando ack (estado MQTT: %d", client.state());
  erroLedFimTs = millis() + 3000;
}
void acknowledgeCompleted(long id) {
  char payload[64];
  snprintf(payload, sizeof(payload), "{\"id\":%ld,\"status\":\"COMPLETED\"}", id);   
  logDebug(DEBUG_VERBOSE, "--> MQTT: %s", payload);
  if (!client.publish(mqtt_ack_channel.c_str(), payload)) logDebug(DEBUG_ERROR, "Erro publicando ack (estado MQTT: %d", client.state());
}
void reportStatusMQTT() {
  if (millis() - ultimoEstadoMQTTTs > intervaloEstado) {
    ultimoEstadoMQTTTs = millis();

    JsonDocument docStatus;
    docStatus["timestamp"] = millis();
    
    JsonObject grblObj = docStatus["grbl"].to<JsonObject>();
    grblObj["est"] = estadoGRBL;
    grblObj["bf"] = bufferGRBL;
    grblObj["fdc"] = endstopGRBL;
    JsonObject posObj = grblObj["pos"].to<JsonObject>();
    posObj["x"] = posicaoGRBL.x;
    posObj["y"] = posicaoGRBL.y;
    posObj["z"] = posicaoGRBL.z;
    
    JsonObject xylemaObj = docStatus["xylema"].to<JsonObject>();
    xylemaObj["est"] = estadoXylema;
    xylemaObj["bf"] = tamanhoFila - filaCNC.size();

    JsonObject atuadoresObj = docStatus["at"].to<JsonObject>();
    for (int i = 0; i < TOTAL_ATUADORES; i++) {
      char chaveStr[4];
      itoa(i, chaveStr, 10); // Transforma o índice em string ("0", "1", etc.)
      atuadoresObj[chaveStr] = estadoAtuadorNormalizado[i]; // Reporta o valor de 0 a 255
    }

    char buffer[256];
    serializeJson(docStatus, buffer);
    logDebug(DEBUG_VERBOSE, "--> MQTT: %s", buffer);
    if (!client.publish(mqtt_status_channel.c_str(), buffer, true)) logDebug(DEBUG_ERROR, "Erro publicando estado (estado MQTT: %d", client.state());
  }
}
void reportEventMQTT(int tipo, String mensagem, String origem) {
  JsonDocument docEvent;
  docEvent["ts"] = millis();
  docEvent["tipo"] = tipo;
  docEvent["msg"] = mensagem;
  docEvent["origem"] = origem;

  char buffer[256];
  serializeJson(docEvent, buffer);
  logDebug(DEBUG_VERBOSE, "--> MQTT: %s", buffer);
  if (!client.publish(mqtt_event_channel.c_str(), buffer, true)) logDebug(DEBUG_ERROR, "Erro publicando evento (estado MQTT: %d", client.state());
}

// ===
// FILA
// ===
bool handleComandoXylema(ComandoCNC comando, bool popQueue = true) {
  bool ok = false;
  logDebug(DEBUG_VERBOSE, "Processando: %s", comando.data.c_str());
  if (comando.data == "HOLD")        { pulsoGRBL(GRBL_HOLD_PIN); ok = true;}
  else if (comando.data == "ABORT")  { pulsoGRBL(GRBL_ABORT_PIN); ok = true;}
  else if (comando.data == "CYCLE")  { pulsoGRBL(GRBL_RESUME_PIN); ok = true;}
  else if (comando.data == "RESET")  { pulsoGRBL(GRBL_RESET_PIN, 100, 2000); ok = true;}
  else if (comando.data == "HEARTBEAT")   ok = handleComandoHEARTBEAT();
  else if (comando.data == "EMERGENCY")   ok = handleComandoEMERGENCY();
  else if (comando.data == "HOME_CYCLE")  ok = handleComandoHOME_CYCLE();
  else if (comando.data.startsWith("ON"))     ok = handleComandoON(comando);
  else if (comando.data.startsWith("OFF"))    ok = handleComandoOFF(comando);
  else if (comando.data.startsWith("SET"))    ok = handleComandoSET(comando);
  else if (comando.data.startsWith("JOB"))    ok = handleComandoJOB(comando);
  else if (comando.data.startsWith("PARK"))   ok = handleComandoPARK(comando);
  else if (comando.data.startsWith("PICK"))   ok = handleComandoPICK(comando);
  else if (comando.data.startsWith("DROP"))   ok = handleComandoDROP(comando);
  else if (comando.data.startsWith("DELAY"))  ok = handleComandoDELAY(comando);
  else if (comando.data.startsWith("UNLOCK")) ok = handleComandoUNLOCK(comando);
  else {
    char bufferErro[128];
    snprintf(bufferErro, sizeof(bufferErro), "Comando Xylema %s desconhecido", comando.data.c_str());
    logDebug(DEBUG_ERROR, bufferErro);
    acknowledgeError(comando.id, bufferErro);
  }
  if (ok) {
    logDebug(DEBUG_VERBOSE, "Ok: %s", comando.data.c_str());
    acknowledgeCompleted(comando.id);
    if (popQueue) filaCNC.pop();
  }
  return ok;
}
bool handleComandoHEARTBEAT() {
  bool ok = true;
  logDebug(DEBUG_ALWAYS, "Heartbeat: %lu", millis());
  reportEventMQTT(INFO, "Heartbeat", "XYLEMA");
  return ok;
}
bool handleComandoEMERGENCY() {
  logDebug(DEBUG_ALWAYS, "PARADA DE EMERGÊNCIA VIA SOFTWARE");
  bool ok = true;
  // Bloqueia o Xylema
  estadoXylema = ERRO_CRITICO;
  // Reseta o GRBL (reset)
  serialGRBLSend("\x18");
  pulsoGRBL(GRBL_RESET_PIN, 100, 2000);
  // Desliga Atuadores
  for (int i = 0; i<TOTAL_ATUADORES; i++) {
    estadoAtuadorNormalizado[i] = 0;
    estadoAtuadorMapeado[i] = 0;
    ledcWrite(ATUADOR_PIN[i], pwmMax[i] == -1 ? 255 : 0);
  }
  return ok;
}
bool handleComandoHOME_CYCLE() {
  if (estadoXylema == ERRO_CRITICO) return false;
  if (estadoGRBL == HOMING) return false;
  logDebug(DEBUG_EVENT, "Iniciando ciclo de homing...");
  reportEventMQTT(INFO, "Inicio de homing", "Xylema32");
  serialGRBLSend("$H");
  estadoGRBL = HOMING;
  estadoXylema = BLOQUEADO;
  return true;
}

int extrairParametro(const char* comando, char letra, int valorPadrao = -1) {
    // Procura a primeira ocorrência da letra na string
    const char* pos = strchr(comando, toupper(letra));
    
    if (pos == NULL) {
        return valorPadrao; // Retorna o valor padrão se a letra não existir
    }
    
    pos++; // Avanca para logo apos a letra (ex: pula o 'A' ou 'L')
    
    // O atoi lê o número a partir do ponteiro, ignorando espaços iniciais automaticamente
    return atoi(pos); 
}
String extrairParametroStr(const char* comando, char letra, String valorPadrao = "") {
  return valorPadrao;
}

bool handleComandoON(ComandoCNC comando) {
  // Obtém parâmetros
  int index = extrairParametro(comando.data.c_str(), 'I');
  if (index < 0 || index >= TOTAL_ATUADORES) {
    acknowledgeError(comando.id, "Comando ON com índice de atuador inválido");
    logDebug(DEBUG_ERROR, "Comando ON com índice de atuador inválido: %d", index);
    return false;
  }
  int pwm = extrairParametro(comando.data.c_str(), 'F') | pwmMax[index];

  // Atualiza os estados
  int pwmMapeado = map(pwm, 1, 255, pwmMin[index], pwmMax[index]);
  estadoAtuadorNormalizado[index] = pwm;
  estadoAtuadorMapeado[index] = pwmMax[index] == 1 ? 1 : pwmMapeado;

  // Reporta
  logDebug(DEBUG_EVENT, "Atuador %d ligado em %d (%d).", index, estadoAtuadorNormalizado[index], estadoAtuadorMapeado[index]);
  return true;
}
bool handleComandoOFF(ComandoCNC comando) {
  // Obtém parâmetros
  int index = extrairParametro(comando.data.c_str(), 'I');
  if (index < 0 || index >= TOTAL_ATUADORES) {
    acknowledgeError(comando.id, "Comando OFF com índice de atuador inválido");
    logDebug(DEBUG_ERROR, "Comando OFF com índice de atuador inválido: %d", index);
    return false;
  }

  // Atualiza os estados
  estadoAtuadorNormalizado[index] = 0;
  estadoAtuadorMapeado[index] = 0;

  // Reporta
  logDebug(DEBUG_EVENT, "Atuador %d desligado.", index);
  return true;
}
bool handleComandoSET(ComandoCNC comando) {
  int index = extrairParametro(comando.data.c_str(), 'I');
  if (comando.data.indexOf("MAX") != -1) {
    if (index < 0 && index >= TOTAL_ATUADORES) {
      acknowledgeError(comando.id, "Índice de atuador inválido.");
      logDebug(DEBUG_ERROR, "Índice de atuador %d inválido.", index);
      return false;
    }
    int novoPwm = extrairParametro(comando.data.c_str(), 'F');
    // Atualiza o array pwmMax
    pwmMax[index] = novoPwm;
    logDebug(DEBUG_EVENT, "PWM máximo do atuador %d atualizado para %d.", index, novoPwm);
    // Salva o array pwmMax atualizado na NVS
    preferences.begin("xylema-cfg", false); // false = modo de escrita
    preferences.putBytes("pwmMax", pwmMax, sizeof(pwmMax));
    preferences.end();
    return true;
  }
  else if (comando.data.indexOf("MIN") != -1) {
    if (index < 0 && index >= TOTAL_ATUADORES) {
      acknowledgeError(comando.id, "Índice de atuador inválido.");
      logDebug(DEBUG_ERROR, "Índice de atuador %d inválido.", index);
      return false;
    }
    int novoPwm = extrairParametro(comando.data.c_str(), 'F');
    // Atualiza o array pwmMax
    pwmMin[index] = novoPwm;
    logDebug(DEBUG_EVENT, "PWM mínimo do atuador %d atualizado para %d.", index, novoPwm);

    // Salva o array pwmMin atualizado na NVS
    preferences.begin("xylema-cfg", false); // false = modo de escrita
    preferences.putBytes("pwmMin", pwmMin, sizeof(pwmMin));
    preferences.end();
    return true;
  }
  else if (comando.data.indexOf("PARK") != -1) {
    // Atualiza o array parkPos
    parkPos[0] = posicaoGRBL.x;
    parkPos[1] = posicaoGRBL.y;
    parkPos[2] = posicaoGRBL.z;
    // Salva o array parkPos atualizado na NVS
    preferences.begin("xylema-cfg", false); // false = modo de escrita
    preferences.putBytes("parkPos", parkPos, sizeof(parkPos));
    preferences.end();
    logDebug(DEBUG_EVENT, "Posição de estacionamento salva em %.3f, %.3f, %.3f", parkPos[0], parkPos[1], parkPos[2]);
    return true;
  }
  else if (comando.data.indexOf("DOCK") != -1) {
    if (index < 0 && index >= TOTAL_DOCKS) {
      acknowledgeError(comando.id, "Índice de doca inválido.");
      logDebug(DEBUG_ERROR, "Índice de doca %d inválido.", index);
      return false;
    }
    // Atualiza o array dockPos
    dockPos[index][0] = posicaoGRBL.x;
    dockPos[index][1] = posicaoGRBL.y;
    dockPos[index][2] = posicaoGRBL.z;
    // Salva o array dockPos atualizado na NVS
    preferences.begin("xylema-cfg", false); // false = modo de escrita
    preferences.putBytes("dockPos", dockPos, sizeof(dockPos));
    preferences.end();
    logDebug(DEBUG_EVENT, "Posição da doca %d salva em %.3f, %.3f, %.3f", index, dockPos[index][0], dockPos[index][1], dockPos[index][2]);
    return true;
  }
  else if (comando.data.indexOf("DEBUG_LEVEL") != -1) {
    if (index < 0 && index >= 5) { // 5 É O NÚMERO MÁXIMO DO ENUM
      acknowledgeError(comando.id, "Índice de atuador inválido.");
      logDebug(DEBUG_ERROR, "Nível de. debug %d inválido.", index);
      return false;
    }
    preferences.begin("xylema-cfg", false);
    preferences.putInt("dbg_level", index);
    preferences.end();
    logDebug(DEBUG_ALWAYS, "Nível de debug alterado para %d", index);
    return true;
  }
  else {
    acknowledgeError(comando.id, "Comando SET sem parâmetro de configuração válido.");
    logDebug(DEBUG_ERROR, "Comando SET sem parâmetro de configuração válido: %s", comando.data);
    return false;
  }
}
bool handleComandoJOB(ComandoCNC comando) {
  bool ok = false;
  if (comando.data.indexOf("F") != -1)  {
    String job = extrairParametroStr(comando.data.c_str(), 'F');
    logDebug(DEBUG_EVENT, "Finalizada a tarefa %s.", job.c_str());
    reportEventMQTT(INFO, "Finalizada a tarefa " + jobAtual, "XYLEMA");
    jobAtual = "";
    ok = true;
  }
  if (comando.data.indexOf("S") != -1 && jobAtual == "")  {
    String job = extrairParametroStr(comando.data.c_str(), 'S');
    logDebug(DEBUG_EVENT, "Iniciando a tarefa %s.", job.c_str());
    reportEventMQTT(INFO, "Iniciando a tarefa " + job, "XYLEMA");
    jobAtual = job;
    ok = true;
  }
  return ok;
}
bool handleComandoDELAY(ComandoCNC comando) {
  pulsoGRBL(GRBL_HOLD_PIN);
  inicioEsperaTs = millis();
  delayMs = 1000 * extrairParametro(comando.data.c_str(), 'S', 0) + extrairParametro(comando.data.c_str(), 'M', 0);
  estadoGRBL = PAUSA;
  estadoXylema = AGUARDANDO;
  logDebug(DEBUG_INFO, "Pausa em %lu por %d ms", inicioEsperaTs, delayMs);
  reportEventMQTT(INFO, "Pausa", "Xylema32");
  return true;
}
bool handleComandoUNLOCK(ComandoCNC comando) {
  int index = extrairParametro(comando.data.c_str(), 'I');
  if (index == 0) { estadoXylema = PRONTO; return true; }
  else if (index == 1) { serialGRBLSend("$X"); return true; }
  else {
    acknowledgeError(comando.id, "Parâmetro inválido para comando UNLOCK.");
    logDebug(DEBUG_ERROR, "Parâmetro %d inválido para comando UNLOCK.", index);
    return false;
  }
}

// ESSAS 3 FUNÇÕES ABAIXO TÊM ALGUNS EFEITOS COLATERAIS A SEREM REPENSADOS
// - MANDA 3 OU MAIS COMANDOS G PARA O GRBL DE UMA SÓ VEZ (GERA 3 OKS QUE SÃO IGNORADOS)
// - USA "FORÇA BRUTA PARA FAZER UM OVERRIDE DO ESTADO AGUARDANDO OK", O QUE PODE BAGUNÇAR O FLUXO DE COMUNICAÇÃO
bool handleComandoPARK(ComandoCNC comando) {
  char buffer[64];
  snprintf(buffer, sizeof(buffer), "G90 G0 Z-2\nG0 X%.3f Y%.3f\nG0 Z%.3f", parkPos[0], parkPos[1], parkPos[2]);
  serialGRBLSend(buffer); // GERA NA MARRA O STRING
  estadoXylema = PRONTO; //OVERRIDE DO AGUARDA OK!
  return true;
}
bool handleComandoPICK(ComandoCNC comando) {
  int index = extrairParametro(comando.data.c_str(), 'I');
  if (index < 0 && index >= TOTAL_DOCKS) {
    acknowledgeError(comando.id, "Índice de doca inválido.");
    logDebug(DEBUG_ERROR, "Índice de doca %d inválido.", index);
    return false;
  }
  char buffer[64];
  snprintf(buffer, sizeof(buffer), "G90 G0 Z-2\nG0 X%.3f Y%.3f\nG0 Z%.3f\nG91 G1 X-100 F500\nG90", dockPos[index][0], dockPos[index][1], dockPos[index][2]);
  serialGRBLSend(buffer); // GERA NA MARRA O STRING
  estadoXylema = PRONTO;  //OVERRIDE DO AGUARDA OK!
  return true;
}
bool handleComandoDROP(ComandoCNC comando) {
  int index = extrairParametro(comando.data.c_str(), 'I');
  if (index < 0 || index >= TOTAL_DOCKS) {
    acknowledgeError(comando.id, "Índice de doca inválido.");
    logDebug(DEBUG_ERROR, "Índice de doca %d inválido.", index);
    return false;
  }
  char buffer[128];
  snprintf(buffer, sizeof(buffer), "G90 G0 Z-2\nG0 X%.3f Y%.3f\nG0 Z%.3f\nG91 G1 X100 F500\nG1 Z-100 F500\nG90", dockPos[index][0], dockPos[index][1], dockPos[index][2]);
  serialGRBLSend(buffer); // GERA NA MARRA O STRING
  estadoXylema = PRONTO;  //OVERRIDE DO AGUARDA OK!
  return true;
}

void limparFila(String mensagem) {
  logDebug(DEBUG_INFO, "Limpando a fila de comandos.");
  estadoXylema = BLOQUEADO;
  while (!filaCNC.empty()) {
    ComandoCNC m = filaCNC.front();
    acknowledgeError(m.id, mensagem);
    filaCNC.pop();
  }
  while (SerialGRBL.available() > 0) {
    SerialGRBL.read();
  }  
}
void updateGRBLStatus() {
  if (millis() - ultimoStatusGRBLTs > intervaloStatusGRBL) {
    ultimoStatusGRBLTs = millis();
    serialGRBLSend("?");
  }
}
void processarFila() {
  // Só processa a fila se estiver ocioso e com itens na fila
  if (filaCNC.empty()) return;
  // Chama o próximo
  ComandoCNC atual = filaCNC.front();
  
  if (estadoXylema != PRONTO && !atual.data.startsWith("UNLOCK")) return;
  
  // Gcode manda para o buffer do GRBL
  if (atual.data.startsWith("G")) {
    logDebug(DEBUG_VERBOSE, "Processando: %s", atual.data.c_str());
    serialGRBLSend(atual.data.c_str());
    inicioEsperaTs = millis();
  }

  // Outros comando não RT, aguarda Idle
  else {
    if (estadoGRBL == OCIOSO) {
      handleComandoXylema(atual, true);
    }
    else {
      logDebug(DEBUG_VERBOSE, "Aguardando GRBL ocioso.");
      estadoXylema = AGUARDANDO_GRBL_IDLE;
      inicioEsperaTs = millis();
    }
  }
}

// ===
// Erros e Recuperação
// ===
void handleGRBLStatusMsg(String linha) {
  EstadoGRBL novoEstado = interpretarEstadoGRBL(linha);

  // Processa casos de homing
  if (estadoGRBL == HOMING && novoEstado != OCIOSO) return;
  if (estadoGRBL == HOMING && novoEstado == OCIOSO) {
    logDebug(DEBUG_EVENT, "Homing realizado com sucesso.", "Xylema");
    reportEventMQTT(INFO, "Homing realizado com sucesso.", "Xylema");
    estadoXylema = PRONTO;
  }

  // Processa espera de idle
  if (estadoXylema == AGUARDANDO_GRBL_IDLE && novoEstado == OCIOSO) {
    logDebug(DEBUG_VERBOSE, "GRBL ocioso.");
    estadoXylema = PRONTO;
  }

  // Processa estados bloqueantes
  if (novoEstado == ALARME) {
    if (estadoXylema != ERRO_CRITICO && estadoXylema != BLOQUEADO) {
      logDebug(DEBUG_EVENT, "Xylema bloqueado por alarme no GRBL");
      estadoXylema = BLOQUEADO;
    }
  }

  // Salva informações
  estadoGRBL = novoEstado;
  interpretarPosicaoGRBL(linha, posicaoGRBL);
  bufferGRBL = interpretarBufferGRBL(linha);
  endstopGRBL = interpretarEndstopGRBL(linha);
  reportStatusMQTT();
  
  // Atualiza a frequencia de consulta do GRBL
  switch (estadoGRBL) {
    case ATIVO: intervaloStatusGRBL = 100; break;
    case HOMING: intervaloStatusGRBL = 5000; break;
    default: intervaloStatusGRBL = 1000;
  }
}

void handleGRBLAlarm(String linha) {
  bool eCritico = false;
  int codigoAlarme = linha.substring(6).toInt();
  String msgAlarme = parseAlarmGRBL(codigoAlarme);

  switch (codigoAlarme) {
    case 0: // Alarme desconhecido
    case 2: // Limite de software
    case 3: // Reset durante o movimento
    case 6: // Reset durante o ciclo de homing
      eCritico = false; // Não é crítico, o robo pode tentar se recuperar.
      break;
    case 1: // Limite físico (checar os limites).
    case 7: // Porta de segurança aberta (checar abertura da porta)
    case 8: // Falha no homing após encontrar o fim-de-curso (verificar sistema de tração e posição.)
    case 9: // Falha no homing antes de achar o fim-de-curso (verificar sistema de tração.)
      eCritico = true;
      break;
    case 4: //return "Probe fail. The probe is not in the expected initial state before starting probe cycle, where G38.2 and G38.3 is not triggered and G38.4 and G38.5 is triggered.";
    case 5: //return "Probe fail. Probe did not contact the workpiece within the programmed travel for G38.2 and G38.4.";
    case 10: //return "Spindle control failed or system used to control spindle reported an error. This typically could be RS485 errors reported from your controller. Suggest using 0-10V signals instead if this occurs regularly.";
    default:
      eCritico = true;
      break;
  }

  // Qualquer alarme bloqueia e muda o estado do GRBL
  estadoGRBL = ALARME;
  logDebug(DEBUG_ERROR, "ALARME GRBL: %s", msgAlarme.c_str());
  if (eCritico) {
    logDebug(DEBUG_EVENT, "Xylema bloqueado por alarme no GRBL");
    reportEventMQTT(CRITICO, msgAlarme, "GRBL");
    limparFila(msgAlarme);
    estadoXylema = ERRO_CRITICO;
  }
  else {
    logDebug(DEBUG_INFO, "Tentando recuperação via RESET.");
    reportEventMQTT(GRAVE, msgAlarme, "GRBL");
    limparFila(msgAlarme);
    pulsoGRBL(GRBL_RESET_PIN, 100, 2000);
  }
}
void handleGRBLError(String linha) {
  bool eCritico = false;
  int codigoErro = linha.substring(6).toInt();
  String msgErro = parseErrorGRBL(codigoErro);

  // Verifica se o erro é crítico
  switch (codigoErro) {
    //TODO: classificar os erros do GRBL a partir do 13
    case 0: // "No case - Possible crash dump of your controller. Please seek advice from your controller vendor."
    case 1: // "G-code words consist of a letter and a value. Letter was not found."
    case 2: // "Numeric value format is not valid or missing an expected value."
    case 4: // "Negative value received for an expected positive value."
    case 7: // "EEPROM read failed. Reset and restored to default values."
    case 11: // "Max characters per line exceeded. Line was not processed and executed."
      // É crítico pois houve perda de comando já acknowledged, não adianta tentar recuperar.
      eCritico = true;
      break;
    case 3: // "Machine ‘$’ system command was not recognized or supported."
    case 5: // "Homing cycle is not enabled via settings."
    case 6: // "Minimum step pulse time must be greater than 3usec"
    case 8: // "Machine ‘$’ command cannot be used unless Machine is IDLE. Ensures smooth operation during a job."
    case 9: // "G-code locked out during alarm or jog state"
    case 10: // "Soft limits cannot be enabled without homing also enabled."
    case 12: // "‘$’ setting value exceeds the maximum step rate supported."
      // Não é crítico, é apenas informativo, o robo pode tentar se recuperar.
      eCritico = false;
      break;
    default:
      eCritico = true;
      break;
  }
  logDebug(DEBUG_ERROR, "ERRO GRBL: %s", linha.c_str());

  // Avisa o backend via acnowledge
  if (estadoXylema == AGUARDANDO_GRBL_OK) {
    ComandoCNC atual = filaCNC.front();
    acknowledgeError(atual.id, msgErro);
  }

  // Erro critico bloqueia o Xylema
  if (eCritico) {
    logDebug(DEBUG_EVENT, "Xylema bloqueado por erro em mensagem enviada ao GRBL");
    reportEventMQTT(GRAVE, msgErro, "GRBL");
    limparFila(msgErro);
    estadoXylema = BLOQUEADO;
  }
  // Erro não crítico segue a fila
  else {
    logDebug(DEBUG_INFO, "Seguindo a fila.");
    reportEventMQTT(LEVE, msgErro, "GRBL");
  }


}
void handleGRBLTimeout(String msgTimeout) {
  estadoXylema = BLOQUEADO;
  ComandoCNC atual = filaCNC.front();
  logDebug(DEBUG_ERROR, msgTimeout.c_str());
  acknowledgeError(atual.id, msgTimeout);
  reportEventMQTT(GRAVE, msgTimeout, "GRBL");
  pulsoGRBL(GRBL_HOLD_PIN);
  limparFila(msgTimeout);
}

// ===
// Atuadores
// ===
void loopAtuadores() {
  for (int i = 0; i < TOTAL_ATUADORES; i++) {
    if (pwmMax[i] == -1) {
      // Estado ligado é LOW, desligado é HIGH
      ledcWrite(ATUADOR_PIN[i], estadoAtuadorNormalizado[i] ? 0 : 255); // Nunca escrever variável para não queimar bobinas!!
    }
    else if (pwmMax[i] == 1) {
      // Estado desligado é LOW, ligado é HIGH
      ledcWrite(ATUADOR_PIN[i], estadoAtuadorNormalizado[i] ? 255 : 0); // Nunca escrever variável para não queimar bobinas!!
    }
    else {
      // É MOSFET: Usa ledcWrite
      int pwm = estadoAtuadorNormalizado[i] ? estadoAtuadorMapeado[i] : 0;
      ledcWrite(ATUADOR_PIN[i], pwm);
    }
  }
}
void loopDelay() {
  if (millis() - inicioEsperaTs > delayMs) {
    logDebug(DEBUG_INFO, "Fim da pausa.");
    estadoXylema = PRONTO;
    pulsoGRBL(GRBL_RESUME_PIN);
  }
  else {
    logWaiting(DEBUG_VERBOSE);
    delay(100);
  }
}
void loopIdleTimeout() {
  if (millis() - inicioEsperaTs > timeoutGRBLIdle) handleGRBLTimeout("Timeout aguardando GRBL idle");
}
void loopOkTimeout() {
  if (millis() - inicioEsperaTs > timeoutGRBLOk) handleGRBLTimeout("Timeout aguardando GRBL ok");
}

// ==
// LOOP PRINCIPAL
// ==
void setup() {
  Serial.begin(115200);
  SerialGRBL.begin(115200, SERIAL_8N1, GRBL_TX, GRBL_RX);
  logDebug(DEBUG_ALWAYS, "Xylema32 %s", VERSION);
  setupPins();
  delay(500);

  // Verifica se o pino está em HIGH ao ligar
  if (pushed) {
      wifiConfig();
  } else {
    lerConfig();
    connectWiFI();
    setupMQTT();
  }
}
void loop() {
  if (!client.connected()) connectMQTT();
  client.loop();
  updateGRBLStatus();
  processarFila();
  loopLED();
  loopPush();
  loopAtuadores();
  if (estadoXylema == AGUARDANDO) loopDelay();
  if (estadoXylema == AGUARDANDO_GRBL_IDLE) loopIdleTimeout();
  if (estadoXylema == AGUARDANDO_GRBL_OK) loopOkTimeout();
  serialGRBLReceive();
  reportStatusMQTT();
}