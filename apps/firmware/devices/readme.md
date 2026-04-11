devices/README.md

Objetivo: Representam os dispositivos reais (casos de uso), em sketch compilável e carregável do arduino.
Os sketches consomem Communication, Sensor e outros serviços do core, mas não implementam nenhuma lógica de baixo nível.

Exemplos
bedBox → monitoramento de canteiro
greenhouseBox → estufa
cyberlavrador → unidade central

Responsabilidade de cada device:
a) escolhe sensores
b) escolhe comunicação
c) define tópicos MQTT
c) orquestrar o loop principal