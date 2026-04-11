core/README.md

Objetivo: Definir interfaces abstratas que padronizam o comportamento do sistema.
Mantém os devices desacoplados da infraestrutura e permite a troca de implementação com facilidade

Conteúdo
Communication.h → interface para comunicação (MQTT, HTTP, etc.)
Sensor.h → interface para sensores

Exemplo
class Communication {
  public:
    virtual void begin() = 0;
    virtual bool connect() = 0;
    virtual bool publish(const char* topic, const char* payload) = 0;
    virtual void loop() = 0;
};

