User → cria imagem
   ↓
backend → inspeciona imagem e identifica modelos aplicáveis (mediaTaskInspector)
↓                                                                  ↓
com modelo                                                      sem modelo
↓                                                                  ↓
backend → itera modelos aplicaveis (executarModeloPython)       marca tarefa feita
   ↓
if (classe de entidade ex: especie) → testa detector generalista do tipoEntidadeId
else → usa detector generalista para classe de entidade
   ↓
modelo segmentador especialista
(monitora caracteristicas de segmentação/contagem - ex: contar frutos de morangueiro)
   ↓
if (arucos) → modelo medidor especialista
(mede tamanho e posição da entidade no contexto - ex: tamanho do morangueiro)
   ↓
modelo comparador especialista (compara a classe de entidade com um cadastro - ex: posicao do morangueiro na horta; posicao do morango no morangueiro)


Para cada modelo:
processa inferência
      ↓
analisa resultado
      ↓ 
   if (low conf / none) → vai para label_image
      ↓
   if random 2% → vai para manual_review
      ↓
   else arquiva imagem