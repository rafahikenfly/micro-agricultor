No frontend:
- concentrar os hooks na pasta correta
- implantar filtros no calendario (mesmo modelo do mapa)
- utilizar o modelo de options que está no PlantaModal (com memo, usando os helpers de formUtils)
- ajustar header dos paineis que não mostram seleção (ex: plantar)

No backend:
- (low-priority) monitorar com alguma frequencia definida o cadastro de dispositivos, para publicar alterações via MQTT 
- implementar novas condições de resolução de tarefa (timeout, falha, etc)
- ajustar novo schema de caracteristicas


No firmware:
- reboot periódico de segurança (deixar rodar alguns dias para ver quanto tempo dura o arduino)
- AP de configuração de rede
- Leitura de configurações por MQTT publicada pelo backend

No dominio
- Nas aplicações, preciso conferir se o estado permite a execução a aplicação. Por exemplo, posso querer criar um novo estado
- Aplicação de regra em tarefa (diferente de aplicação de regra em entidade) - há outros objetos similares às tarefas (agrupamentos de necessidades)?
- compatibilizar a apuração de pendências de plantas e canteiros (um le o objeto do ambiente, o outro le o array das tarefas e o objeto da transicao)

No firebsae
- ajustar o nome das chaves cateogiras_especie, estado_canteiros, estado_plantas, estagio_planta
- apagar chaves sem uso (cvModelos, cvSpecs)
- apagar os índices e recompor apenas os necessários (apaguei plantas, se não der problema provavelmente não são necessários)