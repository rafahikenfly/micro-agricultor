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

// === ENUM E CLASSES
enum estadoXylema {
    PRONTO,               // Pronto para receber novas instruções
    AGUARDANDO_GRBL_OK,   // Esperando o 'ok' de um comando enviado
    AGUARDANDO_GRBL_IDLE, // Esperando o GRBL voltar ao estado IDLE (ex: para executar um sync)
    AGUARDANDO,
    BLOQUEADO,
    ERRO_CRITICO          // Falha crítica: requer intervenção
};
enum TipoEvento {
  INFO,
  LEVE,
  GRAVE,
  CRITICO,
};
enum DebugLevel {
    DEBUG_OFF = 0,
    DEBUG_ERROR = 1,
    DEBUG_EVENT = 2,
    DEBUG_INFO = 3,
    DEBUG_VERBOSE = 4
};
struct ComandoCNC {
    long id;
    String type;
    String data;       // Usado para conteudo da mensagem (gcode line ou outros comandos)
    int value;         // Usado para parâmetro do comando sync e config
    String payload;    // Usado como parâmetro do comando sync e config 
};

// Constantes de configuração em nível de hardware
const int TOTAL_ATUADORES = 4;      // MAX = 5 (8 DO ESP - 3 DO RGB)
const int TOTAL_EIXOS = 3;          // X, Y e Z
const int TOTAL_DOCKS = 4;          // R, S, T e U
const int tamanhoFila = 64;         // instrucoes
const int timeoutGRBLOk   =  60000; // ms
const int timeoutGRBLIdle = 600000; // ms
const int longPushMs   =  2000;     // ms

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
float parkPos[TOTAL_EIXOS]    = {-5, -5, -5};
float dockPos[TOTAL_DOCKS][TOTAL_EIXOS] = {
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
estadoXylema estadoXylema = PRONTO;
EstadoGRBL estadoGRBL = DESCONHECIDO;
int intervaloStatusGRBL = 1000;
PosicaoCNC posicaoGRBL = {0.0, 0.0, 0.0};
static String endstopGRBL = "";
static int bufferGRBL = 0;
int estadoAtuadorMapeado[TOTAL_ATUADORES] ={ 0, 0, 0, 0,};
int estadoAtuadorNormalizado[TOTAL_ATUADORES] ={ 0, 0, 0, 0,};

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

void callbackMQTT(char* topic, byte* payload, unsigned int length);
void acknowledgeCompleted(long id);
void acknowledgeError(long id, String errorMsg);
void acknowledgeQueued(long id);
void reportStatusMQTT();
void reportEventMQTT(int tipo, String mensagem, String origem);

bool handleComandoXylema(ComandoCNC comando, bool popQueue);
bool handleComandoSET(ComandoCNC comando);
bool handleComandoDELAY(ComandoCNC comando);
bool handleComandoHEARTBEAT();
bool handleComandoHOME_CYCLE();
bool handleComandoUNLOCK(ComandoCNC comando);
bool handleComandoPARK(ComandoCNC comando);
bool handleComandoPICK(ComandoCNC comando);
bool handleComandoDROP(ComandoCNC comando);
bool handleComandoEMERGENCY();

void limparFila(String mensagem);
void updateGRBLStatus();
void processarFila();

void handleGRBLStatusMsg(String linha);
void handleGRBLAlarm(String linha);
void handleGRBLError(String linha);
void handleGRBLTimeout(String msgTimeout);
void handleXYLEMAError(String msgError);

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
  ledcSetup(CHANNEL_R, 5000, 8);
  ledcAttachPin(LED_R_PIN, CHANNEL_R);
  ledcSetup(CHANNEL_G, 5000, 8);
  ledcAttachPin(LED_G_PIN, CHANNEL_G);
  ledcSetup(CHANNEL_B, 5000, 8);
  ledcAttachPin(LED_B_PIN, CHANNEL_B);
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
      ledcSetup(i, 5000, 8);             // Frequência de 5kHz, 8 bits (0-255)
      ledcAttachPin(ATUADOR_PIN[i], i);  // Associa o pino ao canal 'i'
      ledcWrite(i, 0);                   // Garante que inicia desligado (PWM = 0)    }
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
    float padraoPos[TOTAL_EIXOS] = { -5.0f, -5.0f, -5.0f };
    memcpy(parkPos, padraoPos, sizeof(parkPos));
  }

  // Tenta ler o dockPos
  size_t bytesDockPos = preferences.getBytes("dockPos", dockPos, sizeof(dockPos));
  if (bytesDockPos == 0) {
    // Se não existir nada salvo ainda, define os padrões no array local
    float padraoDocks[TOTAL_DOCKS][TOTAL_EIXOS] = {
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
  Serial.print("Conectando ao WiFi");
  WiFi.begin(ssid, password);

  unsigned long startTime = millis();
  const unsigned long timeout = 30000; // 30 segundos em milissegundos
    while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    // Verifica se o tempo limite de 30s foi atingido
      if (millis() - startTime >= timeout) {
        // TIMEOUT: Não conectou
        led(255, 0, 0); // Vermelho
        Serial.println("Erro");
        delay(1000);
        led(0, 0, 0);   // Apaga
        return;
      }
      delay(200);
    }
    led(0,255,0);
    Serial.println("OK");
    delay(1000);
}
void setupMQTT() {
    client.setServer(mqtt_server.c_str(), 1883);
    client.setCallback(callbackMQTT);  
}
void connectMQTT() {
  led(64, 30, 0); // Âmbar
  Serial.print("Conectando ao MQTT");

  unsigned long startTime = millis();
  const unsigned long timeout = 30000; // 30 segundos em milissegundos

  while (!client.connected()) {
    Serial.print(".");
    // Tenta conectar ao broker MQTT
    if (millis() - startTime >= timeout) {
      // TIMEOUT: Não conectou
      led(255, 0, 0); // Vermelho
      Serial.println("Erro");
      delay(1000);
      led(0, 0, 0);   // Apaga
      return;
    }
    if (client.connect("ESP32_GRBL_Bridge")) {
      client.subscribe(mqtt_command_channel.c_str());
      // CONECTADO COM SUCESSO!
      led(0, 255, 0); // Verde
      Serial.println("OK");
      delay(1000);
      led(0, 0, 0);   // Apaga
    }
    delay(200);
  }
}
void serialGRBLSend(String data) {
  // Reporta no Serial
  if (data == "?"){
    Serial.print(".");
  } else {
    Serial.print(data);
    Serial.println(" --> GRBL");
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
    Serial.print("GRBL -->");
    Serial.println(linha);
    // Se receber uma das mensagens abaixo, ignora
    if (linha.length() == 0) continue;                        //linha vazia
    if (linha.startsWith("Grbl 1.1")) continue;               //linha de inicio
    if (linha.startsWith("[MSG:Caution: Unlocked]")) continue;//alerta de unlock

    // Se receber mensagem de que está trancado, reporta evento, bloqueia o Xylema e faz homing.
    if (linha.startsWith("[MSG:'$H'|'$X' to unlock]")) {
      if (estadoXylema != ERRO_CRITICO) {
        Serial.println("INFO: GRBL em posição desconhecida.");
        handleComandoHOME_CYCLE();
      } else {
        Serial.println("Xylema em estado de erro crítico. Reset ignorado.");
      }
      continue;
    }

    if (linha.startsWith("ALARM:")) handleGRBLAlarm(linha);
    if (linha.startsWith("error:")) handleGRBLError(linha);
    if (linha.startsWith("<")) handleGRBLStatusMsg(linha);
    // Se receber uma linha de configuração:
    if (linha.startsWith("$")) {
      //Serial.println(linha);
    }

    // Se o Xylema está esperando o GRBL dar ACK para um G-code,
    // Aguarda OK ou TIMEOUT (error: já foi tratado acima)
    if (estadoXylema == AGUARDANDO_GRBL_OK && linha == "ok") {
      ComandoCNC atual = filaCNC.front();
      acknowledgeCompleted(atual.id);
      filaCNC.pop();
      estadoXylema = PRONTO;
    }
  }
}


// ===
// INTERFACE (LED E PUSH)
// ===
void led(int r, int g, int b) {
    ledcWrite(CHANNEL_R, r);
    ledcWrite(CHANNEL_G, g);
    ledcWrite(CHANNEL_B, b);
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
  if (filaCNC.size() > 0 || estadoGRBL == ATIVO) {
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
      Serial.println("Reiniciando GRBL manualmente...");
      limparFila("Reset manual");
      pulsoGRBL(GRBL_RESET_PIN, 100, 2000);
      reportEventMQTT(INFO, "Desbloqueio manual com reset", "Xylema32");
    }
    else {
      Serial.println("Xylema bloqueado");
    }
    return;
  }
  // CASO 2: Xylema em execução normal / pronto
  if (eLongPush) {
    Serial.println("Continuando trabalho");
    pulsoGRBL(GRBL_RESUME_PIN);
  } 
  else {
    Serial.println("Pausando trabalho");
    pulsoGRBL(GRBL_HOLD_PIN);
  }
}
void loopPush() {
  // Como usamos INPUT_PULLUP, o botão pressionado lê LOW
  int leituraBotao = digitalRead(PUSH_PIN);

  // Botao acabou de ser apertado
  if (leituraBotao == LOW && !pushed) {
    delay(30); // Debounce simples
    if (digitalRead(PUSH_PIN) == LOW) {
      Serial.println("Botão pressionado.");
      pushed = true;
      pushStartTs = millis();
    }
  }

  // Botao acabou de ser solto
  if (leituraBotao == HIGH && pushed) {
    delay(30); // Debounce
    if (digitalRead(PUSH_PIN) == HIGH) {
      Serial.println("Botão solto.");
      unsigned long duracao = millis() - pushStartTs;
      pushed = false;
      // Executa a lógica com base no tempo que ficou pressionado
      processarPush(duracao);
    }
  }
}
void logDebug(int level, const char* formato, ...) {
    if (currentDebugLevel >= level) {
        char loc_buf[256];
        va_list args;
        va_start(args, formato);
        vsnprintf(loc_buf, sizeof(loc_buf), formato, args);
        va_end(args);
        Serial.println(loc_buf);
    }
}
// ===
// COMUNICACAO MQTT
// ==
void callbackMQTT(char* topic, byte* payload, unsigned int length) {
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, payload, length);

  Serial.print("Mensagem recebida. ");
  if (error) {
    Serial.print ("Erro deserializando!");
    Serial.println(error.c_str());
    return;
  }

  // 1. Recebimento do comando
  long id = doc["id"] | 0;
  String type = doc["type"] | "";
  String data = doc["data"] | "";
  int value = doc["value"] | 0;
  String msgPayload = doc["payload"] | "";

  ComandoCNC comando;
  comando.id = id;
  comando.type = type;
  comando.data = data;
  comando.value = value;
  comando.payload = msgPayload;

  Serial.print("id: ");
  Serial.print(id);
  Serial.print("; type: ");
  Serial.print(type);
  Serial.print("; data: ");
  Serial.print(data);
  Serial.print("; value: ");
  Serial.print(value);
  Serial.print("; payload: ");
  Serial.println(msgPayload);

  // 2. Erros de recebimento
  if (estadoXylema == BLOQUEADO) {
    Serial.println ("Xylema bloqueado");
    acknowledgeError(id, "Xylema bloqueado");
    reportEventMQTT(LEVE, "Bloqueado", "Xylema32");
    return;
  }

  if (filaCNC.size() >= tamanhoFila) {
    Serial.println ("Fila cheia");
    acknowledgeError(id, "Fila cheia");
    reportEventMQTT(LEVE, "Fila Cheia", "Xylema32");
    return;
  }

  if (type == "rt") handleComandoXylema(comando, false);
  else {
    // Adiciona na fila e marca acnowledge
    filaCNC.push(comando);
    acknowledgeQueued(id);
  }
}
void acknowledgeQueued(long id) {
    String ackPayload = "{\"id\":" + String(id) + ",\"status\":\"QUEUED\"}";
    client.publish(mqtt_ack_channel.c_str(), ackPayload.c_str());
}
void acknowledgeError(long id, String errorMsg) {
    String ackPayload = "{\"id\":" + String(id) + ",\"status\":\"ERROR\",\"data\":\"" + errorMsg + "\"}";
    client.publish(mqtt_ack_channel.c_str(), ackPayload.c_str());
    erroLedFimTs = millis() + 3000;
}
void acknowledgeCompleted(long id) {
    String ackPayload = "{\"id\":" + String(id) + ",\"status\":\"COMPLETED\"}";
    client.publish(mqtt_ack_channel.c_str(), ackPayload.c_str());
}
void reportStatusMQTT() {
  if (millis() - ultimoEstadoMQTTTs > intervaloEstado) {
    ultimoEstadoMQTTTs = millis();

    JsonDocument docStatus;
    docStatus["timestamp"] = millis();
    
    JsonObject grblObj = docStatus["grbl"].to<JsonObject>();
    grblObj["estado"] = estadoGRBL;
    grblObj["disponivel"] = bufferGRBL;
    grblObj["endstops"] = endstopGRBL;
    JsonObject posObj = grblObj["pos"].to<JsonObject>();
    posObj["x"] = posicaoGRBL.x;
    posObj["y"] = posicaoGRBL.y;
    posObj["z"] = posicaoGRBL.z;
    
    JsonObject xylemaObj = docStatus["fila"].to<JsonObject>();
    xylemaObj["Xylema"] = estadoXylema;
    xylemaObj["disponivel"] = tamanhoFila - filaCNC.size();

    JsonObject atuadoresObj = docStatus["acessorios"].to<JsonObject>();
    for (int i = 0; i < TOTAL_ATUADORES; i++) {
      char chaveStr[4];
      itoa(i, chaveStr, 10); // Transforma o índice em string ("0", "1", etc.)
      atuadoresObj[chaveStr] = estadoAtuadorNormalizado[i]; // Reporta o valor de 0 a 255
    }

    char buffer[256];
    serializeJson(docStatus, buffer);

    if (!client.publish(mqtt_status_channel.c_str(), buffer, true)) {
      Serial.print("Erro publicando estado! Estado do client MQTT: ");
      Serial.println(client.state()); // Mostra o código de erro interno
    }
  }
}
void reportEventMQTT(int tipo, String mensagem, String origem) {
  JsonDocument docEvent;
  docEvent["timestamp"] = millis();
  docEvent["tipo"] = tipo;
  docEvent["mensagem"] = mensagem;
  docEvent["origem"] = origem;

  char buffer[256];
  serializeJson(docEvent, buffer);

  client.publish(mqtt_event_channel.c_str(), buffer, true); // Retain = true
}

// ===
// FILA
// ===
bool handleComandoXylema(ComandoCNC comando, bool popQueue = true) {
  bool ok = false;
  if (comando.data == "HOLD")        {pulsoGRBL(GRBL_HOLD_PIN); ok = true;}
  else if (comando.data == "ABORT")  {pulsoGRBL(GRBL_ABORT_PIN); ok = true;}
  else if (comando.data == "CYCLE")  {pulsoGRBL(GRBL_RESUME_PIN); ok = true;}
  else if (comando.data == "RESET")  {pulsoGRBL(GRBL_RESET_PIN, 100, 2000); ok = true;}
  else if (comando.data.startsWith("SET")) ok = handleComandoSET(comando);
  else if (comando.data.startsWith("PARK")) ok = handleComandoPARK(comando);
  else if (comando.data == "DELAY") ok = handleComandoDELAY(comando);
  else if (comando.data == "HEARTBEAT") ok = handleComandoHEARTBEAT();
  else if (comando.data == "HOME_CYCLE") ok = handleComandoHOME_CYCLE();
  else if (comando.data == "UNLOCK") ok = handleComandoUNLOCK(comando);
  else if (comando.data == "PICK") ok = handleComandoPICK(comando);
  else if (comando.data == "DROP") ok = handleComandoDROP(comando);
  else if (comando.data == "EMERGENCY") ok = handleComandoEMERGENCY();
  if (ok) {
    acknowledgeCompleted(comando.id);
    if (popQueue) filaCNC.pop();
    return true;
  }
  char bufferErro[128];
  snprintf(bufferErro, sizeof(bufferErro), "Comando Xylema %s inválido", comando.data.c_str());
  acknowledgeError(comando.id, bufferErro);
  return false;
}
bool handleComandoSET(ComandoCNC comando) {
  bool ok = false;

  int indice = comando.value;
  if (comando.data.indexOf("MAX_PWM") != -1) {
    if (indice >= 0 && indice < TOTAL_ATUADORES) {
      int novoPwm = comando.payload.toInt();
      // Atualiza o array pwmMax
      pwmMax[indice] = novoPwm;
      ok = true;
      // Salva o array pwmMax atualizado na NVS
      preferences.begin("xylema-cfg", false); // false = modo de escrita
      preferences.putBytes("pwmMax", pwmMax, sizeof(pwmMax));
      preferences.end();
    }
  }
  else if (comando.data.indexOf("MIN_PWM") != -1) {
    if (indice >= 0 && indice < TOTAL_ATUADORES) {
      int novoPwm = comando.payload.toInt();
      // Atualiza o array pwmMax
      pwmMin[indice] = novoPwm;
      ok = true;
      // Salva o array pwmMin atualizado na NVS
      preferences.begin("xylema-cfg", false); // false = modo de escrita
      preferences.putBytes("pwmMin", pwmMin, sizeof(pwmMin));
      preferences.end();
    }
  }
  else if (comando.data.indexOf("ON") != -1)  {
    estadoAtuadorNormalizado[indice] = comando.payload.toInt();
    int pwmMapeado = map(estadoAtuadorNormalizado[indice], 1, 255, pwmMin[indice], pwmMax[indice]);
    estadoAtuadorMapeado[indice] = pwmMax[indice] == 1 ? 1 : pwmMapeado;
    Serial.print("Atuador ");
    Serial.print(indice);
    Serial.print(" ligado em ");
    Serial.print(estadoAtuadorNormalizado[indice]);
    Serial.print(" (");
    Serial.print(estadoAtuadorMapeado[indice]);
    Serial.println(")");
    ok = true;
  }
  else if (comando.data.indexOf("OFF") != -1) {
    estadoAtuadorNormalizado[indice] = 0;
    estadoAtuadorMapeado[indice] = 0;
    ok = true; 
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
    Serial.print("Nova posição de estacionamento: ");
    Serial.print(parkPos[0]);
    Serial.print(", ");
    Serial.print(parkPos[1]);
    Serial.print(", ");
    Serial.println(parkPos[2]);
    ok = true;
  }
  else if (comando.data.indexOf("DOCK") != -1) {
    if (indice >= 0 && indice < TOTAL_ATUADORES) {
      // Atualiza o array dockPos
      dockPos[indice][0] = posicaoGRBL.x;
      dockPos[indice][1] = posicaoGRBL.y;
      dockPos[indice][2] = posicaoGRBL.z;
      // Salva o array dockPos atualizado na NVS
      preferences.begin("xylema-cfg", false); // false = modo de escrita
      preferences.putBytes("dockPos", dockPos, sizeof(dockPos));
      preferences.end();
      Serial.print("Nova posição da doca ");
      Serial.print(indice);
      Serial.print(": ");
      Serial.print(dockPos[indice][0]);
      Serial.print(", ");
      Serial.print(dockPos[indice][1]);
      Serial.print(", ");
      Serial.println(dockPos[indice][2]);
      ok = true;
    }
  }
  else if (comando.data.indexOf("DEBUG_LEVEL") != -1) {
    currentDebugLevel = comando.payload.toInt();
    preferences.begin("xylema-cfg", false);
    preferences.putInt("dbg_level", currentDebugLevel);
    preferences.end();
    Serial.printf("Nível de debug alterado para: %d\n", currentDebugLevel);
    ok = true;
  }
  return ok;
}
bool handleComandoDELAY(ComandoCNC comando) {
  bool ok = true;
  pulsoGRBL(GRBL_HOLD_PIN);
  inicioEsperaTs = millis();
  delayMs = comando.value;
  estadoGRBL = PAUSA;
  estadoXylema = AGUARDANDO;
  Serial.print("Xylema delay");
  return ok;
}
bool handleComandoHEARTBEAT() {
  bool ok = true;
  Serial.print("Heartbeat <3: ");
  Serial.println(millis());
  return ok;
}
bool handleComandoHOME_CYCLE() {
  bool ok = true;
  if (estadoXylema == ERRO_CRITICO) return false;
  if (estadoGRBL == HOMING) return false;
  reportEventMQTT(INFO, "Inicio de homing", "Xylema32");
  estadoGRBL = HOMING;
  estadoXylema = BLOQUEADO;
  serialGRBLSend("$H");
  return ok;
}
bool handleComandoUNLOCK(ComandoCNC comando) {
  bool ok = false;
  if (comando.payload = "GRBL") {
    ok = true;
    serialGRBLSend("$X");
  }
  if (comando.payload = "XYLEMA") {
    ok = true;
    estadoXylema = PRONTO;
  }
  return ok;
}
bool handleComandoPARK(ComandoCNC comando) {
  bool ok = true;
  char buffer[64];
  // 1. Recua o Z para altura de segurança (absoluto G90)
  serialGRBLSend("G0 Z-2");
  // 2. Move para a posição X, Y da dock
  snprintf(buffer, sizeof(buffer), "G90 G0 X%.3f Y%.3f", parkPos[0], parkPos[1]);
  serialGRBLSend(buffer);
  // 3. Baixa o Z para a altura de encaixe da dock
  snprintf(buffer, sizeof(buffer), "G90 G0 Z%.3f", parkPos[2]);
  serialGRBLSend(buffer);
  return ok;
}
bool handleComandoPICK(ComandoCNC comando) {
  bool ok = false;

  int indice = comando.value;
  if (indice >= 0 && indice < TOTAL_DOCKS) {
    char buffer[64];
    // 1. Recua o Z para altura de segurança (absoluto G90)
    serialGRBLSend("G90 G0 Z-2");
    // 2. Move para a posição X, Y da dock
    snprintf(buffer, sizeof(buffer), "G90 G0 X%.3f Y%.3f", dockPos[indice][0], dockPos[indice][1]);
    serialGRBLSend(buffer);
    // 3. Baixa o Z para a altura de encaixe da dock
    snprintf(buffer, sizeof(buffer), "G90 G0 Z%.3f", dockPos[indice][2]);
    serialGRBLSend(buffer);
    // 4. Recua X em -100mm de forma relativa e lenta
    serialGRBLSend("G91 G1 X-100 F500");
    // 5. Volta para o modo absoluto para os próximos comandos
    serialGRBLSend("G90");
    ok = true;
  }
  return ok;
}
bool handleComandoDROP(ComandoCNC comando) {
  bool ok = false;

  int indice = comando.value;
  if (indice >= 0 && indice < TOTAL_DOCKS) {
    char buffer[64];
    // 1. Recua o Z para altura de segurança (absoluto G90)
    serialGRBLSend("G90 G0 Z-2");
    // 2. Move para a posição X, Y da dock
    snprintf(buffer, sizeof(buffer), "G90 G0 X%.3f Y%.3f", dockPos[indice][0], dockPos[indice][1]);
    serialGRBLSend(buffer);
    // 5. Recua X em -100mm
    serialGRBLSend("G91 G0 X-100");
    // 4. Baixa o Z para a altura de encaixe da dock
    snprintf(buffer, sizeof(buffer), "G90 G0 Z%.3f", dockPos[indice][2]);
    serialGRBLSend(buffer);
    // 5. Avança X em 100mm de forma relativa e lenta
    serialGRBLSend("G91 G1 X100 F500");
    // 6. Avança Z em -100mm de forma relativa e lenta
    serialGRBLSend("G91 G1 Z-100 F500");
    // 7. Volta para o modo absoluto para os próximos comandos
    serialGRBLSend("G90");
    ok = true;
  }
  return ok;
}
bool handleComandoEMERGENCY() {
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
    ledcWrite(i, pwmMax[i] == -1 ? 255 : 0);
  }
  return ok;
}

void limparFila(String mensagem) {
  estadoXylema == BLOQUEADO;
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
  
  if (estadoXylema != PRONTO && atual.data !="UNLOCK" && atual.payload !="XYLEMA") return;
  
  Serial.print("Processando: ");
  Serial.print(atual.data);

  // Gcode manda para o GRBL
  if (atual.type == "gcode") {
    Serial.println(" | Enviado para GRBL");
    serialGRBLSend(atual.data);
    inicioEsperaTs = millis();
  }

  // Sync aguarda Idle se necessário
  else if (atual.type == "sync") {
    if (estadoGRBL == OCIOSO) {
      Serial.println(" | Enviado sync para GRBL/Xylema");
      handleComandoXylema(atual, true);
    }
    else {
      // Para o sync, espera o status para saber quando fica Idle
      Serial.println(" | Aguardando idle");
      estadoXylema = AGUARDANDO_GRBL_IDLE;
      inicioEsperaTs = millis();
    }
  }

  else {
    Serial.print("GRAVE: Tipo de instrução inválida.");
    acknowledgeError(atual.id, "Tipo de instrução inválida.");
    reportEventMQTT(GRAVE, "Tipo de instrução inválida", "Xylema32");
    handleXYLEMAError("Tipo de instrução inválida");
  }
}

// ===
// Erros e Recuperação
// ===
void handleGRBLStatusMsg(String linha) {
  EstadoGRBL novoEstado = interpretarEstadoGRBL(linha);

  // Se o estado atual for HOMING, ignora mensagens que não sejam OCIOSO (Idle)
  if (estadoGRBL == HOMING && novoEstado != OCIOSO) {
    return;
  }

  estadoGRBL = novoEstado;
  interpretarPosicaoGRBL(linha, posicaoGRBL);
  bufferGRBL = interpretarBufferGRBL(linha);
  endstopGRBL = interpretarEndstopGRBL(linha);
  reportStatusMQTT();
  
  switch (estadoGRBL) {
    case ATIVO: intervaloStatusGRBL = 100; break;
    case HOMING: intervaloStatusGRBL = 5000; break;
    default: intervaloStatusGRBL = 1000;
  }
  if (estadoXylema == BLOQUEADO && estadoGRBL == OCIOSO) {
    // Recuperou via homing!
    Serial.println("Xylema pronto");
    estadoXylema = PRONTO;
  }
  if (estadoXylema == AGUARDANDO_GRBL_IDLE && estadoGRBL == OCIOSO) {
    estadoXylema = PRONTO;
  }
  if (estadoXylema != ERRO_CRITICO && estadoXylema != BLOQUEADO && estadoGRBL == ALARME) {
    Serial.println("Alarme desconhecido identificado no GRBL");
    estadoXylema = BLOQUEADO;
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
    case 1: // Limite físico (checar os limites).
    case 7: // Porta de segurança aberta (checar abertura da porta)
    case 8: // Falha no homing após encontrar o fim-de-curso (verificar sistema de tração e posição.)
    case 9: // Falha no homing antes de achar o fim-de-curso (verificar sistema de tração.)
      eCritico = true;
    case 4: //return "Probe fail. The probe is not in the expected initial state before starting probe cycle, where G38.2 and G38.3 is not triggered and G38.4 and G38.5 is triggered.";
    case 5: //return "Probe fail. Probe did not contact the workpiece within the programmed travel for G38.2 and G38.4.";
    case 10: //return "Spindle control failed or system used to control spindle reported an error. This typically could be RS485 errors reported from your controller. Suggest using 0-10V signals instead if this occurs regularly.";
    default:
      eCritico = true;
  }
  // Qualquer alarme bloqueia e muda o estado do GRBL
  estadoGRBL = ALARME;
  Serial.print(msgAlarme);
  if (eCritico) {
    estadoXylema = ERRO_CRITICO;
    reportEventMQTT(CRITICO, msgAlarme, "GRBL");
    limparFila(msgAlarme);
  }
  else {
    Serial.println(msgAlarme + " Recuperando...");
    reportEventMQTT(GRAVE, msgAlarme, "GRBL");
    limparFila(msgAlarme);
    pulsoGRBL(GRBL_RESET_PIN, 100, 2000);
  }
}
void handleGRBLError(String linha) {
  bool eCritico = false;
  int codigoErro = linha.substring(6).toInt();
  String msgErro = parseErrorGRBL(codigoErro);

  // Avisa o backend via acnowledge
  if (estadoXylema == AGUARDANDO_GRBL_OK) {
    ComandoCNC atual = filaCNC.front();
    acknowledgeError(atual.id, msgErro);
  }

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
    case 3: // "Machine ‘$’ system command was not recognized or supported."
    case 5: // "Homing cycle is not enabled via settings."
    case 6: // "Minimum step pulse time must be greater than 3usec"
    case 8: // "Machine ‘$’ command cannot be used unless Machine is IDLE. Ensures smooth operation during a job."
    case 9: // "G-code locked out during alarm or jog state"
    case 10: // "Soft limits cannot be enabled without homing also enabled."
    case 12: // "‘$’ setting value exceeds the maximum step rate supported."
      // Não é crítico, é apenas informativo, o robo pode tentar se recuperar.
      eCritico = false;
    default:
      eCritico = true;
  }
  Serial.print(msgErro);

  // Erro critico bloqueia o Xylema
  if (eCritico) {
    estadoXylema = BLOQUEADO;
    reportEventMQTT(GRAVE, msgErro, "GRBL");
    limparFila(msgErro);
  }
  // Erro não crítico segue a fila
  else {
    Serial.println(msgErro + " Recuperando...");
    reportEventMQTT(LEVE, msgErro, "GRBL");
  }


}
void handleGRBLTimeout(String msgTimeout) {
  estadoXylema = BLOQUEADO;
  ComandoCNC atual = filaCNC.front();
  acknowledgeError(atual.id, msgTimeout);
  reportEventMQTT(GRAVE, msgTimeout, "GRBL");
  limparFila(msgTimeout);
  pulsoGRBL(GRBL_HOLD_PIN);
}
void handleXYLEMAError(String msgErro) {
  estadoXylema = BLOQUEADO;
  reportEventMQTT(GRAVE, msgErro, "XYLEMA");
  limparFila(msgErro);
}

// ===
// Atuadores
// ===
void loopAtuadores() {
  for (int i = 0; i < TOTAL_ATUADORES; i++) {
    if (pwmMax[i] == -1) {
      // Estado ligado é LOW, desligado é HIGH
      ledcWrite(i, estadoAtuadorNormalizado[i] ? 0 : 255); // Nunca escrever variável para não queimar bobinas!!
    }
    else if (pwmMax[i] == 1) {
      // Estado desligado é LOW, ligado é HIGH
      ledcWrite(i, estadoAtuadorNormalizado[i] ? 255 : 0); // Nunca escrever variável para não queimar bobinas!!
    }
    else {
      // É MOSFET: Usa ledcWrite usando o índice 'i' como canal
      int pwm = estadoAtuadorNormalizado[i] ? estadoAtuadorMapeado[i] : 0;
      ledcWrite(i, pwm);
    }
  }
}
void loopDelay() {
  if (millis() - inicioEsperaTs > delayMs) {
    estadoXylema = PRONTO;
    pulsoGRBL(GRBL_RESUME_PIN);
    Serial.println();
  }
  else Serial.print(".");
}
void loopIdleTimeout() {
  if (millis() - inicioEsperaTs > timeoutGRBLIdle) handleGRBLTimeout("idle não recebido");
}
void loopOkTimeout() {
  if (millis() - inicioEsperaTs > timeoutGRBLOk) handleGRBLTimeout("ok não recebido");
}

// ==
// LOOP PRINCIPAL
// ==
void setup() {
  Serial.begin(115200);
  SerialGRBL.begin(115200, SERIAL_8N1, GRBL_TX, GRBL_RX);
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