import { log } from "../core/logger/index.js";
import { executarTesteMovimento } from "../core/mqtt/handleGRBLCNC.js";
import { db } from "../infra/firebase.js";

export function supervisorTarefas() {

    const grblCnc = {
        id: "cnc",
        grbl: {},
        xylema: {},
        atuador: {
            0: {ativo: false, label: "Desativado", estado: 0},
            1: {ativo: true, label: "Motor", estado: 0},
            2: {ativo: true, label: "Solenóide", estado: 0},
            3: {ativo: true, label: "Mini-bomba", estado: 0}
        }
    }


  // Exemplo de listener no Firestore (ex: coleção de comandos ou estado)
  db.collection("tarefas").onSnapshot(
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const dados = change.doc.data();
          log(`Nova tarefa no Firebase: ${change.doc.id}`);
          // Aqui você pode despachar para o seu pipeline ou lógica
        }
        if (change.type === "modified") {
          const dados = change.doc.data();
          log(`Tarefa atualizada no Firebase: ${change.doc.id}`);
          executarTesteMovimento(grblCnc)
          // Aqui você pode despachar para o seu pipeline ou lógica
        }
        if (change.type === "removed") {
          log(`Tarefa removida no firebase: ${docId}`);
          // Lógica opcional para exclusão
        }        
      });
    },
    (error) => {
      log(`Erro no listener do Firestore: ${error.message}`);
    }
  );
  log("Listener de tarefas online");
}