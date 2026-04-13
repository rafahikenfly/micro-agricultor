No frontend:
- ajustar todos os usos de ListaComAcao para usar o render ao inves de outras formas de renderizacao
- eliminar os services individuais e atualizar os imports

No backend:
- (low-priority) monitorar com alguma frequencia definida o cadastro de dispositivos, para publicar alterações via MQTT 
- criar o inspetor de tarefas de monitoramento, que consulta o histórico local para cumprir todas as tarefas que puder, usando o lock/complete de tarefa
- organizar o uso de cache, reiniciando o cache uma vez por hora (?)

No firmware:
- reboot periódico de segurança (deixar rodar alguns dias para ver quanto tempo dura o arduino)
- AP de configuração de rede
- Leitura de configurações por MQTT
- Arrumar blink com fade (tempo de blink, fade suave para ligar e desligar)