export async function inspecionarTarefa(task, necessidades = []) {
    try {

        if (!necessidades.length) {
            //usar resolve da tarefa!
            await tarefasService.update(task.id, {
                estado: ESTADO_TAREFA.FEITO.id
            });
            console.log(`Tarefa ${task.id} marcada como resolvida`);
        }
    } catch (error) {
        log(`Erro ao processar tarefa ${task.id}:`, error);
        throw error;
    }
}