User → cria cvJob
        ↓
cvWorker recebe evento
        ↓
Verifica modelo
   ↓             ↓
sem modelo     com modelo
   ↓             ↓
tarefa manual   verifica vencimento
                 ↓
           vencido? ── sim ── cria tarefa train_model
                 ↓ não
        processa inferência
                 ↓
        analisa resultado
      ↓ low conf / none
   tarefa label_image
      ↓
   random 2% ?
      ↓ sim
 tarefa manual_review
      ↓
    else
  arquiva imagem


cvJobSpecs      → descreve
cvJobRun        → executa
cvWorker        → processa
cvTasks         → humanos
cvModels        → inteligência
cvDatasets      → memória
