No frontend:
- ajustar todos os usos de ListaComAcao para usar o render ao inves de outras formas de renderizacao, assim como o lazy caching
   (AUTALIZANDO DE BAIXO PARA CIMA, ATÉ OS MANEJOS)
- eliminar os services individuais e atualizar os imports
- ajustar o perfil
- ajustar o cadastro de ciclo de variedade para usar o standardObjectInput na mesma linguagem viasual do standardArrayInput
- deprecar o ListaArray e usar o standardArrayInput (com render igual do arrayInput!)

No backend:
- (low-priority) monitorar com alguma frequencia definida o cadastro de dispositivos, para publicar alterações via MQTT 
- implementar novas condições de resolução de tarefa (timeout, falha, etc)

No firmware:
- reboot periódico de segurança (deixar rodar alguns dias para ver quanto tempo dura o arduino)
- AP de configuração de rede
- Leitura de configurações por MQTT publicada pelo backend

No dominio
- Aplicação de regra em tarefa (diferente de aplicação de regra em entidade) - há outros objetos similares às tarefas (agrupamentos de necessidades)?
- compatibilizar a apuração de pendências de plantas e canteiros (um le o objeto do ambiente, o outro le o array das tarefas e o objeto da transicao)