config/README

Objetivo: Centralizar configurações. Evita hardcode espalhado e facilita troca de ambiente.
Importante lembrar que o service de Configuração (ler eeprom, etc) não está aqui, mas no core.

Conteúdo
pins.h → definição de pinos por device
network.h → SSID, senha, broker MQTT

Exemplo
#define WIFI_SSID "..."
#define MQTT_HOST "192.168.18.135"
