const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const { degradarCaracteristicasCanteiro, montarLogEvento, calcularEfeitosDoEvento } = require("./domainFunctions");
const { Timestamp } = require("@google-cloud/firestore");

admin.initializeApp();
const db = admin.firestore();

/* ---------- Função agendada ---------- */
exports.timeEffect = onSchedule(
  {
    schedule: "every 6 hours",
    timeZone: "America/Sao_Paulo",
  },
  async () => {
    console.log("Iniciando degradação de características");
    const now = Timestamp.now();

    // Carrega catálogo uma única vez
    const catalogoSnap = await db.collection("caracteristicas").get();
    const catalogo = catalogoSnap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    // Busca todas as hortas
    const hortasSnap = await db.collection("hortas").get();

    for (const hortaDoc of hortasSnap.docs) {
      try {
        // Cria o eventoRef imediatamente para obter Id e monta o log (sem efeitos)
        const eventoRef = db.collection("eventos").doc(); // ID gerado aqui
        const evento = montarLogEvento({
          tipoEventoId: "degradacao",
          alvos: [],
          origemId: "scheduler",
          origemTipo: "sistema",
          efeitos: [],
        })

        let batch = db.batch();
        let opCount = 0;

        // Busca todos os canteiros da horta
        const canteirosSnap = await hortaDoc.ref
          .collection("canteiros")
          .get();
    
        for (const canteiroDoc of canteirosSnap.docs) {
          const canteiro = canteiroDoc.data();
  
          // Se não há estado atual, não há atualização
          if (!canteiro.estadoAtual) continue;
  
          // Atualiza conforme função de domínio
          const canteiroAtualizado = await degradarCaracteristicasCanteiro({
            canteiro: canteiro,
            catalogo: catalogo,
            eventoId: eventoRef.id,
          });
    
          // Calcula os efeitos para o canteiro
          const efeitosCanteiro = calcularEfeitosDoEvento({
            entidadeId: eventoRef.id,
            eventoId: eventoRef.id,
            tipoEventoId: "degradação",
            estadoAntes: canteiro.estadoAtual,
            estadoDepois: canteiroAtualizado.estadoAtual,
            tipoEntidade: "Canteiro",
          });
            
          // Se há efeitos no canteiro
          if (efeitosCanteiro.length) {
            // Atualiza somente estadoAtual do canteiro no batch
            batch.update(canteiroDoc.ref, { estadoAtual: canteiroAtualizado.estadoAtual, });
            opCount++;
            // Adiciona o canteiro ao rol de alvos
            if (!evento.alvos.some(alvo => alvo.id === canteiroDoc.id)) {
              evento.alvos.push({ id: canteiroDoc.id, tipo: "Canteiro" });
            }
            // Denormalização efeitos para o histórico
            efeitosCanteiro.forEach((efeito) => {
              const efeitoRef = db.collection("historicoEfeitos").doc();
              batch.set(efeitoRef, {...efeito, createdAt: now});
              opCount++;
            });
          }

          // Adiciona os efeitos do canteiro ao evento
          evento.efeitos = [...evento.efeitos, ...efeitosCanteiro]

          // Commit a cada 450 ops
          if (opCount >= 450) {
            await batch.commit();
            batch = db.batch();
            opCount = 0;
          }
        }
        // Atualiza o evento pelo batch se houver efeitos
        if (evento.efeitos.length > 0) {
          batch.set(eventoRef, {...evento, createdAt: now});
          opCount++;
        }

        //
        if (opCount > 0) await batch.commit();
        console.log(`Degradação finalizada na horta ${hortaDoc.id}`);
      }
      catch (err) {
        console.log (`Erro degradando horta ${hortaDoc.id}:`, err);
      }
    }
  }
);
