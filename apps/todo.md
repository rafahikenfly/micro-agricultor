No frontend:
- ajustar todos os usos de ListaComAcao para usar o render ao inves de outras formas de renderizacao
- eliminar os services individuais e atualizar os imports

No backend:
- (low-priority) monitorar com alguma frequencia definida o cadastro de dispositivos, para publicar alterações via MQTT 
- criar o inspetor de tarefas de monitoramento, que consulta o histórico local para cumprir todas as tarefas que puder, usando o lock/complete de tarefa
- resolver o problema dos acumuladores MIN e MAX do período, que não avalia se há dados suficientes para retornar um min e max (só está implementado o SQL)
- resolver o problema do acumulador CONTAR, que não avalia limite

No firmware:
- reboot periódico de segurança (deixar rodar alguns dias para ver quanto tempo dura o arduino)
- AP de configuração de rede
- Leitura de configurações por MQTT publicada pelo backend

No dominio
- Regras de criação, resolução, aquisição, retry (...) de tarefas
- Aplicação de regra em tarefa (diferente de aplicação de regra em entidade) - há outros objetos similares às tarefas (agrupamentos de necessidades)?