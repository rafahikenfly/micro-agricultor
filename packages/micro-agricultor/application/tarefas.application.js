import { resolverTarefa } from "../domain/tarefa.rules";

export async function concluirTarefa({ tarefa, resolucao, user, tarefasService }) {

  const tarefaAtualizada = resolverTarefa({ tarefa, resolucao });

  await tarefasService.update(
    tarefasService.getRefById(tarefa.id),
    tarefaAtualizada,
    user
  );

  return tarefaAtualizada;
}