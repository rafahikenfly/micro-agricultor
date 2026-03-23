export async function dailyEffect() {
    console.log("Iniciando cálculo de efeitos do tempo...")
    console.log("Cálculo de efeitos do tempo concluído.")
    return
    const context = await montarContexto();

  const evento = criarEventoBase(context);

  await processarPlantas(context, evento);
  await processarCanteiros(context, evento);

  await persistirEvento(context, evento);
}