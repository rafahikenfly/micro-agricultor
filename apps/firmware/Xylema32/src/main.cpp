#include <Arduino.h>
#include <Preferences.h>
#include <WiFi.h>
#include <queue>
#include <ArduinoJson.h>

#include <WiFiManager.h>
#include <PubSubClient.h>

#include <grbl.h>

// Constantes de configuração em nível de hardware
const int TOTAL_ACESSORIOS = 8;
const int tamanhoFila = 64;         //instrucoes
const int timeoutGRBLOk   =  60000; //ms
const int timeoutGRBLIdle = 600000; //ms
const int longPushMs   =  2000;     //ms

// Definicao de Pinos
//TODO -- USAR O RGB BUILTIN
const int LED_R_PIN = 42;
const int LED_G_PIN = 41;
const int LED_B_PIN = 40;
const int ACC_PIN[TOTAL_ACESSORIOS] = { 15, 16, 17, 18, 4, 5, 6, 7 };
const int GRBL_RESET_PIN = 9;
const int GRBL_HOLD_PIN = 10;
const int GRBL_ABORT_PIN = 11;
const int GRBL_RESUME_PIN = 12;
const int GRBL_TX = 13;
const int GRBL_RX = 14;
const int PUSH_PIN = 2;

// Canais LED
const int CHANNEL_R = 0;
const int CHANNEL_G = 1;
const int CHANNEL_B = 2;

// Estrutura de MensagemCNC
//TODO: esse nome .data está horrível e deveria ser command ou coisa do tipo
struct MensagemCNC {
    long id;
    String type;
    String data;       // Usado para conteudo da mensagem (gcode line ou outros comandos)
    int value;         // Usado para parâmetro do comando sync e config
    String payload;    // Usado como parâmetro do comando sync e config 
};


// Variáveis de estado
enum EstadoGuiche {
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
EstadoGuiche estadoGuiche = PRONTO;
EstadoGRBL estadoGRBL = DESCONHECIDO;
static String posicaoGRBL = "";
static String endstopGRBL = "";
static int bufferGRBL = 0;
bool pushed = true;
bool estadoAcessorio[TOTAL_ACESSORIOS] ={false, false, false, false, false, false, false, false,};

// Variáveis de timestamp
static unsigned long ultimoEstadoTs = 0;
static unsigned long inicioEsperaTs = 0;
static unsigned long erroLedFimTs = 0;
static unsigned long pushStartTs = 0;
static int delayMs = 0;

// Instâncias globais
Preferences preferences;
WiFiClient espClient;
PubSubClient client(espClient);
std::queue<MensagemCNC> filaCNC;
HardwareSerial SerialGRBL(2); // Porta Serial 2 para o GRBL

// Variáveis de configuração em nível de software
String ssid;
String password;
String mqtt_server;
String mqtt_command_channel;
String mqtt_ack_channel;
String mqtt_status_channel;
String mqtt_event_channel;
int intervaloEstado;
int pwmAcessorio[TOTAL_ACESSORIOS] = {-1, -1, -1, -1, 1024, 1024, 1024, 1024};


// Declarações de funções
void setupPins();
void connectWiFI();
void setupMQTT();
void connectMQTT();
void lerConfig();
void wifiConfig();
void led(int r, int g, int b);
void ledFade(int maxR, int maxG, int maxB, unsigned long tempoFadeMs, unsigned long intervaloMaximosMs);
void loopLED();
void callbackMQTT(char* topic, byte* payload, unsigned int length);
void acknowledgeCompleted(long id);
void acknowledgeError(long id, String errorMsg);
void acknowledgeQueued(long id);
void reportStatusMQTT();
void reportEventMQTT(int tipo, String mensagem, String origem);
void limparFila(String mensagem);
void processarFila();
void serialGRBLReceive();
void serialGRBLSend(String data);
void processarPush(unsigned long duracaoPush);
void loopPush();
void loopAcessorios();


// ==
// SETUP
// == 
void setupPins() {
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

  // Pinos de acessórios
  for (int i = 0; i < TOTAL_ACESSORIOS; i++) {
    pinMode(ACC_PIN[i], OUTPUT);
    if (pwmAcessorio[i] == -1) {
      //Relés (iniciais em HIGH/desligado)
      digitalWrite(ACC_PIN[i], HIGH);
    } else {
      // MOSFETs (iniciais em LOW/desligado)
      digitalWrite(ACC_PIN[i], LOW);
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

  // Pino do Botão (le estado do botao)
  pinMode(PUSH_PIN, INPUT_PULLUP);
  pushed = (digitalRead(PUSH_PIN) == LOW);
}
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

// ===
// CONFIGURAÇÃO
// ===
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
    
    preferences.end();

    Serial.println("==Configurações==");
    Serial.print("ssid: ");
    Serial.println(ssid);
    Serial.print("password: ");
    Serial.println(password);
    Serial.print("mqtt_server: ");
    Serial.println(mqtt_server);
    Serial.print("mqtt_command_channel: ");
    Serial.println(mqtt_command_channel);
    Serial.print("mqtt_ack_channel: ");
    Serial.println(mqtt_ack_channel);
    Serial.print("mqtt_status_channel: ");
    Serial.println(mqtt_status_channel);
    Serial.print("mqtt_event_channel: ");
    Serial.println(mqtt_event_channel);
}
void wifiConfig() {
  Serial.println("Modo de configuração. Acesse a rede xylema32.");
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

  // Inicia o Access Point (Rede "xylema32") e trava aguardando a configuração
  if (!wm.startConfigPortal("xylema32")) {
    Serial.println("Falha ao criar portal de configuração.");
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

  Serial.println("Configurações salvas com sucesso!");
  led(0, 255, 0); 
  delay(1000);
}

// ===
// LED
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
  // (Guiche Bloqueado OU Erro Crítico) -> Vermelho fixo
  // (GRBL em Home) -> Azul fixo
  // (Fila cheia) -> Amarelo fixo
  if (estadoGRBL == HOMING) {
    led(0, 0, 255); 
    return;
  }
  if (estadoGuiche == BLOQUEADO || estadoGuiche == ERRO_CRITICO) {
    led(255, 0, 0); 
    return;
  }
  if (filaCNC.size() >= tamanhoFila) {
    led(255, 255, 0);
    return;
  }

  // 4. Estado do Guiche
  // Aguardando idle -> Branco piscando lento
  // Aguardando ok   -> Amarelo piscando lento 
  // Fluxo normal    -> Verde piscando lento
  // Guiche pronto   -> Azul piscando muito lento
  if (estadoGuiche == AGUARDANDO_GRBL_IDLE) {
    ledFade(255, 255, 255, 1500, 3000);
    return;
  }
  if (estadoGuiche == AGUARDANDO_GRBL_OK) {
    ledFade(0, 255, 255, 1500, 3000);
    return;
  }
  if (filaCNC.size() > 0 || estadoGRBL == ATIVO) {
    ledFade(0, 255, 0, 1500, 3000);
    return;
  }
  if (estadoGuiche == PRONTO) {
    ledFade(0, 0, 255, 1500, 6000);
    return;
  }

  // 5. ESTADO DESCONHECIDO (Fallback): Catch-all -> branco fixo
  led(255, 255, 255);
}

// ===
// MQTT
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

  // 0. Decompõe a instrucao
  long id = doc["id"] | 0;
  String type = doc["type"] | "";
  String data = doc["data"] | "";
  int value = doc["value"] | 0;
  String msgPayload = doc["payload"] | "";
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

  if (estadoGuiche == BLOQUEADO) {
    Serial.println ("Guichê bloqueado");
    acknowledgeError(id, "Guichê bloqueado");
    reportEventMQTT(LEVE, "Bloqueado", "Xylema32");
    return;
  }

  if (filaCNC.size() >= tamanhoFila) {
    Serial.println ("Fila cheia");
    acknowledgeError(id, "Fila cheia");
    reportEventMQTT(LEVE, "Fila Cheia", "Xylema32");
    return;
  }

  // 1. COMANDOS EM TEMPO REAL (RT) - Não entram na fila
  if (type == "rt") {
    if (data == "PAUSE") pulsoGRBL(GRBL_HOLD_PIN);
    else if (data == "ABORT") pulsoGRBL(GRBL_ABORT_PIN);
    else if (data == "RESUME") pulsoGRBL(GRBL_RESUME_PIN);
    else if (data == "RESET") pulsoGRBL(GRBL_RESET_PIN, 100, 2000);
    else if (data == "UNLOCK") estadoGuiche = PRONTO;
    // TODO tratar o SET
    acknowledgeCompleted(id);
    //TRATAR O ERRO DE COMANDO INVALIDO
    return;
  }

  // 2. MENSAGENS QUE VÃO PARA A FILA (gcode, sync, macro, delay, config)
  MensagemCNC msg;
  msg.id = id;
  msg.type = type;
  msg.data = data;
  msg.value = value;
  msg.payload = msgPayload;

  // Adiciona na fila e marca acnowledge
  filaCNC.push(msg);
  acknowledgeQueued(id);
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
  if (millis() - ultimoEstadoTs > intervaloEstado) {
    ultimoEstadoTs = millis();
    serialGRBLSend("?");

    JsonDocument docStatus;
    docStatus["timestamp"] = millis();
    
    JsonObject grblObj = docStatus["grbl"].to<JsonObject>();
    grblObj["estado"] = estadoGRBL;
    grblObj["posicao"] = posicaoGRBL;
    grblObj["disponivel"] = bufferGRBL;
    grblObj["endstops"] = endstopGRBL;
    
    JsonObject filaObj = docStatus["fila"].to<JsonObject>();
    filaObj["guiche"] = estadoGuiche;
    filaObj["disponivel"] = tamanhoFila - filaCNC.size();

    JsonObject acessoriosObj = docStatus["acessorios"].to<JsonObject>();
    acessoriosObj["0"] = estadoAcessorio[0];
    acessoriosObj["1"] = estadoAcessorio[1];
    acessoriosObj["2"] = estadoAcessorio[2];
    acessoriosObj["3"] = estadoAcessorio[3];
    acessoriosObj["4"] = estadoAcessorio[4];
    acessoriosObj["5"] = estadoAcessorio[5];
    acessoriosObj["6"] = estadoAcessorio[6];
    acessoriosObj["7"] = estadoAcessorio[7];

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
void limparFila(String mensagem) {
  estadoGuiche == BLOQUEADO;
  while (!filaCNC.empty()) {
    MensagemCNC m = filaCNC.front();
    acknowledgeError(m.id, mensagem);
    filaCNC.pop();
  }
  while (SerialGRBL.available() > 0) {
    SerialGRBL.read();
  }  
}
void processarFila() {
  // Se a máquina estiver ociosa e houver itens na fila, pega o próximo
  if (estadoGuiche == PRONTO && !filaCNC.empty()) {
    MensagemCNC atual = filaCNC.front();
    Serial.print("Processando: ");
    Serial.print(atual.data);
    if (atual.type == "gcode") {
      Serial.println(" | Enviado para GRBL");
      serialGRBLSend(atual.data);
      inicioEsperaTs = millis();
    }
    else if (atual.type == "sync") {
      Serial.println(" | Aguardando idle");
      // Para o sync, espera o status para saber quando fica Idle
      estadoGuiche = AGUARDANDO_GRBL_IDLE;
      inicioEsperaTs = millis();
    }
    else if (atual.type == "config") {

    }
    else {
      Serial.print("GRAVE: Tipo de instrução inválida.");
      acknowledgeError(atual.id, "Tipo de instrução inválida.");
      reportEventMQTT(GRAVE, "Tipo de instrução inválida", "Xylema32");
    }
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

    // Se receber mensagem de que está trancado, reporta evento, bloqueia o guichê e faz homing.
    if (linha.startsWith("[MSG:'$H'|'$X' to unlock]")) {
      if (estadoGuiche != ERRO_CRITICO) {
        Serial.println("INFO: GRBL em posição desconhecida. Iniciando homing...");
        reportEventMQTT(INFO, "Inicio de homing", "Xylema32");
        serialGRBLSend("$H");
      } else {
        Serial.println("Erro crítico. Reset ignorado.");
      }
      continue;
    }

    // Se receber um alarm
    if (linha.startsWith("ALARM:")) {
      int codigoAlarme = linha.substring(6).toInt();
      // Qualquer alarme bloqueia e muda o estado do GRBL
      estadoGRBL = ALARME;

      switch (codigoAlarme) {
        // TODO: A MENSAGEM NO SERIAL, NO MQTT E NO ERRO DA FILA PODE SER A MESMA DO PARSE.
        // ISSO UNIFICA OS CASOS PELO COMPORTAMENTO, NÁO PELA DESCRIÇÃO
        case 1: // Hard limit
          Serial.println("CRITICO: Limite físico. Reset ignorado.");
          reportEventMQTT(CRITICO, parseAlarmGRBL(codigoAlarme), "GRBL");
          limparFila("Limite físico atingido");
          break;
        case 2: // Soft limit
          Serial.println("GRAVE: Movimento excede a máquina. Recuperando.");
          reportEventMQTT(GRAVE, parseAlarmGRBL(codigoAlarme), "GRBL");
          limparFila("Movimento excede a máquina");
          pulsoGRBL(GRBL_RESET_PIN, 100, 2000);
          //TODO: esse desbloqueio não funciona.
          break;
        case 3:
          Serial.println("INFO: Reset durante movimento.");
          reportEventMQTT(INFO, parseAlarmGRBL(codigoAlarme), "GRBL");
          limparFila("Reset durante movimento");
          pulsoGRBL(GRBL_RESET_PIN, 100, 2000);
        case 6:
          Serial.println("INFO: Reset durante o ciclo de homing.");
          reportEventMQTT(INFO, parseAlarmGRBL(codigoAlarme), "GRBL");
          limparFila("Reset durante o ciclo de homing");
          pulsoGRBL(GRBL_RESET_PIN, 100, 2000);
        case 7:
        case 8:
        case 9:
          estadoGuiche = ERRO_CRITICO;
          Serial.println("CRITICO: Falha no Homing. Reset ignorado.");
          reportEventMQTT(CRITICO, parseAlarmGRBL(codigoAlarme), "GRBL");
          break;
        default:
          Serial.println("LEVE: Alarme no GRBL. Tentando reset.");
          reportEventMQTT(LEVE, parseAlarmGRBL(codigoAlarme), "GRBL");
          limparFila(parseAlarmGRBL(codigoAlarme));
          pulsoGRBL(GRBL_RESET_PIN, 100, 2000);
          break;
      }
    }

    // Se receber um status em tempo real (<...>)
    if (linha.startsWith("<")) {
      estadoGRBL = interpretarEstadoGRBL(linha);
      posicaoGRBL = interpretarPosicaoGRBL(linha);
      bufferGRBL = interpretarBufferGRBL(linha);
      endstopGRBL = interpretarEndstopGRBL(linha);
      if (estadoGuiche == BLOQUEADO && estadoGRBL == OCIOSO) {
        // Recuperou via homing!
        Serial.println("Guichê pronto");
        estadoGuiche = PRONTO;
      }
      if (estadoGuiche != ERRO_CRITICO && estadoGuiche != BLOQUEADO && estadoGRBL == ALARME) {
        Serial.println("Alarme desconhecido identificado no GRBL");
        estadoGuiche = BLOQUEADO;
      }
    }

    // Se receber uma linha de configuração:
    if (linha.startsWith("$")) {
      //Serial.println(linha);
    }

    // Se o guiche está esperando o GRBL ficar Idle para executar um sync, aguarda OCIOSO ou TIMEOUT
    if (estadoGuiche == AGUARDANDO_GRBL_IDLE) {
      if (estadoGRBL == OCIOSO) {
        MensagemCNC atual = filaCNC.front();
        if (atual.data == "DELAY") {
          delayMs = atual.value;
          //TODO
          filaCNC.pop();
        }
        else if (atual.data == "SET") {
          if (atual.value >= 0 && atual.value < TOTAL_ACESSORIOS) {
            int indice = atual.value;
            if (pwmAcessorio[indice] == -1) {
              // É um Relé (-1)
              estadoAcessorio[indice] = atual.payload == "ON";
            }
            else {
              // É um MOSFET (0-1024): verifica o PWM
              if (atual.payload == "ON") estadoAcessorio[indice] = true;
              else if (atual.payload == "OFF") estadoAcessorio[indice] = false;
              else {
                // Se mandou um número novo como payload (ex: "250"), atualiza a calibração
                int novoPwm = atual.payload.toInt();
                pwmAcessorio[indice] = novoPwm;
                estadoAcessorio[indice] = true;
              }              
            }
            filaCNC.pop();
            acknowledgeCompleted(atual.id);
            estadoGuiche = PRONTO; // Libera para o próximo
          }
          else {
            // Índice inválido
            Serial.println("GRAVE: Acessório inexistente");
            reportEventMQTT(GRAVE, "Acessório inexistente " + String(atual.value), "Xylema32");
            filaCNC.pop();
            acknowledgeError(atual.id, "Indice de acessório inexistente");
            estadoGuiche = BLOQUEADO;
          }
        }
        else if (atual.data == "REPORT") {
          reportEventMQTT(INFO, atual.payload, "Xylema32");
        }
        else if (atual.data == "MACRO") {
          //TODO
          filaCNC.pop();
        }
      }
      // Timeout de segurança
      else if (millis() - inicioEsperaTs > timeoutGRBLIdle) {
        MensagemCNC atual = filaCNC.front();
        acknowledgeError(atual.id, "timeout aguardando idle");
        //TODO: REPORT EVENT?
        estadoGuiche = BLOQUEADO;
        pulsoGRBL(GRBL_HOLD_PIN);
      }
    }
    // Se o guiche está esperando o GRBL dar ACK para um G-code, aguardo OK, ERROR ou TIMEOUT
    if (estadoGuiche == AGUARDANDO_GRBL_OK) {
      if (linha == "ok") {
        MensagemCNC atual = filaCNC.front();
        acknowledgeCompleted(atual.id);
        filaCNC.pop();
        estadoGuiche = PRONTO; // Libera para o próximo
      }
      else if (linha.startsWith("error")) {
        MensagemCNC atual = filaCNC.front();
        acknowledgeError(atual.id, linha);
        limparFila("Erro em comando.");
        pulsoGRBL(GRBL_HOLD_PIN);
      }
      // Timeout de segurança
      else if (millis() - inicioEsperaTs > timeoutGRBLOk) {
        MensagemCNC atual = filaCNC.front();
        acknowledgeError(atual.id, "timeout aguardando ack GRBL");
        //REPORT EVENT?
        estadoGuiche = BLOQUEADO;
        pulsoGRBL(GRBL_HOLD_PIN);
      }
    }
  }
}
void serialGRBLSend(String data) {
  Serial.print(data);
  Serial.println(" --> GRBL");
  // Comando homing
  if (data.startsWith("$H")) {
    SerialGRBL.print("$H\n");
    estadoGRBL = HOMING;
    estadoGuiche = BLOQUEADO;
    return;
  }
  // RT Commands
  if (data == "?" || data == "~" || data == "!" || data == "\x18") {
    SerialGRBL.print(data);
    return;
  }
  SerialGRBL.print(data + "\n");
  estadoGuiche = AGUARDANDO_GRBL_OK;
}

// ===
// PUSH BUTTON
// ===
void processarPush(unsigned long duracaoPush) {
  bool eLongPush = (duracaoPush >= longPushMs);

  // Caso 1: Guiche Bloqueado
  if (estadoGuiche == BLOQUEADO || estadoGuiche == ERRO_CRITICO) {
    if (eLongPush) {
      Serial.println("Reiniciando GRBL manualmente...");
      limparFila("Reset manual");
      pulsoGRBL(GRBL_RESET_PIN, 100, 2000);
      reportEventMQTT(INFO, "Desbloqueio manual com reset", "Xylema32");
    }
    else {
      Serial.println("Guichê bloqueado");
    }
    return;
  }
  // CASO 2: Guichê em execução normal / pronto
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

// ===
// ACESSORIOS
// ===
void loopAcessorios() {
  for (int i = 0; i < TOTAL_ACESSORIOS; i++) {
    if (pwmAcessorio[i] == -1) {
      // É Relé: estado true = ligado (LOW), false = desligado (HIGH)
      // Ajuste o LOW/HIGH de acordo com o seu módulo de relé
      digitalWrite(ACC_PIN[i], estadoAcessorio[i] ? LOW : HIGH);
    } 
    else {
      // É MOSFET: se estiver ligado, aplica o PWM salvo; se desligado, envia 0
      int valorFinal = estadoAcessorio[i] ? pwmAcessorio[i] : 0;
      analogWrite(ACC_PIN[i], valorFinal);
    }
  }
}

// ======================
// SETUP E LOOP PRINCIPAL
// ======================
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
  if (!client.connected()) {
    connectMQTT();
  }
  client.loop();
  serialGRBLReceive();
  processarFila();
  loopLED();
  loopPush();
  loopAcessorios();
  reportStatusMQTT();
}