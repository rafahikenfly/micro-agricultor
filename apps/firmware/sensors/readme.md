sensors/README.md

Objetivo: Padronizar leitura de diferentes categorias de sensores, retornando sempre
dados em valores inteiros. Torna sensores plugáveis, com fácil troca sem impactar o resto do sistema

Subpastas
DHT/ → temperatura/umidade
Analog/ → sensores analógicos
Digital/ → sensores binários

Interface comum
class Sensor {
  public:
    virtual void begin() = 0;
    virtual float read() = 0;
};