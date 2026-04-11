No frontend:


No backend:
- receber a mensagem no mqtt, anexar o timestamp (da hora da mensagem mesmo) e a entidade (do cadatro do dispositivo) e salvar o dado histórico bruto localmente para inspeção.
- (low-priority) monitorar com alguma frequencia definida o cadastro de dispositivos, para publicar alterações via MQTT 
- criar o inspetor de tarefas de monitoramento, que consulta o histórico local para cumprir todas as tarefas que puder, usando o lock/complete de tarefa

No firmware:
- reboot periódico de segurança
- AP de configuração de rede
- Leitura de configurações por MQTT