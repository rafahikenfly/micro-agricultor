import { criarMutacao } from "../domain/index.js";

/**
 * Processa uma entidade utilizando um batch, passando uma função.
 * A função recebe como argumentos: {entidade, evento.timestamp, eventoId, ...contexto}
 * @param {tipoEntidadeId, entidade, regra, serviceEntidade, serviceMutacoes, evento, contexto, batch, user} args
 * @returns { processado, before, after } || null se não houver mutações ou erro
 *  - processado: entidade processada com as mutações aplicadas
 *  - before: estadoAtual da entidade antes da aplicação da regra, apenas com as características que sofreram mutação
 *  - after: estadoAtual da entidade após a aplicação da regra, apenas com as características que sofreram mutação
 */
export function aplicarRegraPorBatch({
  tipoEntidadeId,
  entidade,
  regra,
  serviceEntidade,
  serviceMutacoes,
  evento,
  contexto,
  batch,
  user
}) {

  try {
    const results = regra({
      entidade,
      timestamp: evento.timestamp,
      eventoId: evento.id,
      ...contexto,
    });

    switch(results.operacao) {
      case "CREATE":
        // Inclui create da entidade processada no batch, salvando
        // o id da nova entidade
        const newRef = serviceEntidade.getCreateRef();
        results.entidade.id = newRef.id
        batch.add((b)=>serviceEntidade.batchCreate(results.entidade, user, b, newRef));
        break;
      case "UPDATE":
        // Inclui update da entidade processada no batch
        const ref = serviceEntidade.getRefById(entidade.id);
        batch.add((b)=>serviceEntidade.batchUpdate(ref, results.entidade, user, b));
        // Fluxo de aplicação de regra de transformação de uma entidade
        // se há o argumento entidade, é porque a regra transforma. Logo,
        // precisa ter algo em results.after e faz o update da entidade.
        if (entidade) {
          if (!results?.after || !Object.keys(results.after).length) {
            console.warn(`aplicarRegraPorBatch: Nenhuma mutação resultante da aplicação de regra em ${entidade.id}.`)
            return {};
          }
    
          // Inclui create das mutações no batch:
          // - de característica (caracteristicaId)
          // - de propriedade (propriedade)
          for (const key of Object.keys(results.after)) {
            const antes  = results.before[key];
            const depois = results.after[key];
      
            if (depois.tipo === "caracteristica") batch.add((b) =>
              serviceMutacoes.batchAppend(
                criarMutacao({
                  evento,
                  caracteristicaId: key,
                  depois,
                  antes,
                  tipoEntidadeId,
                  entidade,
                }),
                user, b
              ));
            else if (depois.tipo === "propriedade") {
              console.log(depois)
              batch.add((b) => 
              serviceMutacoes.batchAppend(
                criarMutacao({
                  evento,
                  propriedade: key,
                  depois: depois.valor,
                  antes: antes?.valor ?? null,
                  tipoEntidadeId,
                  entidade,
                }),
                user, b
              ));}
            else {
              throw new Error(`Tipo de mutação desconhecido: ${depois.tipo}`);
            };
          }
        }
        break;
      default:
        console.log(`[aplicarRegraPorBatch]: operação de batch ${results.operacao} desconhecida)`);
    }

    return { entidade: results.entidade, before: (results.before ?? {}), after: (results.after ?? {})};

  } catch (err) {
    console.log(`[aplicarRegraPorBatch] Erro processando ${tipoEntidadeId} ${entidade?.id ?? "novo(a)"}:`, err);
    return null;
  }
}