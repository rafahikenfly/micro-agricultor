São 4 tipos de gatilho para as tarefas:

1. Baseadas em REAÇÃO - pode gerar tarefas a partir do trabalho do inspetor de estado
- mudança de estado ou estágio - inspetor de estado/estágio gera as tarefas conforme o cadastro da espécie/protótipo de entidade
- fora da faixa - inspetor de de estadoAtual gera as tarefas de manejo (sem especificar qual é o manejo, pois não é um padrão do protótipo de entidade)
- dado inexistente/não confiável - inspetor de estadoAtual gera tarefas de monitoramento

2. Baseadas em TEMPO
recorrência - resolvedor de tarefa reconfigura a tarefa para a próxima ocorrência

3. Baseada em PREVISÃO
tendência
anomalia

4. Baseadas em PROCESSO
dependências
workflow
retry / falha