ommunication/README.md

Objetivo: Implementar diferentes estratégias de conectividade.

Subpastas:
WifiShield/ → Arduino WiFi Shield
Esp01/ → ESP8266 via AT
Esp32/ → WiFi nativo

Padrão:
Cada implementação deve: a) implementar Communication; b) encapsular MQTT + conexão

Exemplo
class WifiShieldComm : public Communication {
  ...
};
⚠️ Observações
manter payload pequeno (especialmente no Arduino)
tratar reconexão internamente