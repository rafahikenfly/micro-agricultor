import mqtt from "mqtt";
import { log } from "../logger/index.js";
import { filaDispositivo, handleDispositivo } from "../devices/handleDispositivo.js";
import { handleGRBLCNC, } from "../devices/handleGRBLCNC.js";

const BROKER_URL = "mqtt://localhost:1883";

let client;
let fila = {};

export function startMQTT(dispositivos) {
  if (client) {
    log("[startMQTT]: MQTT já iniciado, ignorando nova inicialização");
    return;
  }
  client = mqtt.connect(BROKER_URL, {
    clientId: "micro-agricultor-backend"
  });

  client.on("connect", () => {
    log("[startMQTT]: MQTT conectado");

    // Subscribe nos tópicos
    dispositivos.list.forEach(disp => {
      if (disp.tipo === "GRBL") {
        //TODO: usar o mqtt é uma propriedade que não precisa ser do GRBL!
        // O ideal aqui é mudar o cadastro do dispositivo para ter uma propriedade
        // bool useMQTT, por exemplo
        const topic = disp.id + "/#";
        client.subscribe(topic, (err) => {
          if (err) {
            log("[startMQTT]: Erro ao se inscrever nos tópicos MQTT", err);
          } else {
            startFila(disp);
            log(`[startMQTT]: Inscrito no dispositivo ${disp.id}/#`);
          }
        });
      }
    });
  });

  client.on("message", (topic, message) => {
    const partes = topic.split('/');
    const dispositivoId = partes[0];

    if (partes[1] === "ack") {
      const fila = getFila(dispositivoId);
      recebeAcknowledge(message, fila);
    }
    else {
      const dispositivo = dispositivos.map.get(dispositivoId);
      handleMessage(partes[1], message, dispositivo);
    }
  });

  client.on("error", (err) => {
    log("Erro MQTT", err);
  });

  client.on("close", () => {
    log("MQTT desconectado ⚠️");
  });
}
function startFila(dispositivo) {
      const filaGrbl = new filaDispositivo(client, dispositivo)
      fila[dispositivo.id] = filaGrbl;
      log(`[mqtt] Fila MQTT criada para dispositivo GRBLCNC: ${dispositivo.id}`);
}
export function getClient() {
  return client
}
export function getFila(dispositivoId) {
  return fila[dispositivoId];
}

export function despachaComando(grblCnc, data, msgId = 0, rt = false, job = "") {
  if (!grblCnc || !grblCnc.id) {
    console.error("Erro: Objeto grblCnc inválido ou não fornecido para despachaComando!", grblCnc);
    return false;
  }
  
  const client = getClient();

  // Verifica conexão
  if (!client || !client.connected) {
    console.warn("Aviso: Não conectado ao broker MQTT!");
    return false;
  }

    // Verifica disponibilidade
    //const startTime = Date.now();
    //while (this.waitingAck()) {
    //    if (!this.isConnected) {
    //        return false;
    //    }

    //    // Timeout caso o ESP32 demore mais de 5 segundos para liberar o comando anterior
    //    if (Date.now() - startTime > 5000) {
    //        console.warn("Erro: ESP32 não liberou canal a tempo para enviar comando");
    //        return false;
    //    }
        
    //    // Pausa de 10ms (equivalente ao time.sleep(0.01))
    //    await new Promise(resolve => setTimeout(resolve, 10));
    //}

    // Envia o comando
    const payload = {
        id: msgId,
        data: data,
        rt: rt,
        job: job
    };

    const comando = JSON.stringify(payload);
    const comandoTopic = grblCnc.id + "/comandos";
    
    client.publish(comandoTopic, comando, (err) => {
      if (err) {
        console.error("Erro ao publicar:", err);
        return false;
      }
    });

    log(`Enviado [${msgId}] para [${comandoTopic}]: ${comando.replace(/\n/g, ' | ')}`);
    
    // Salva o comando ativo (usando Map ou Objeto comum)
    //this.activeCommands.set(msgId, {
    //    status: "SENT",
    //    data: comando.replace(/\n/g, ' | ')
    //});

    //this.atualizarComandosAtivos();
    return true;
}

function handleMessage(topic, message, remetente) {
  if (remetente) {
    switch (remetente.tipo) {
      case 'GRBL':
        handleGRBLCNC(topic, message, remetente);
        break;

      case 'dispositivo':
        handleDispositivo(dispositivoId, message);
      default:
        log(`MQTT ${message} no tópico /${topic} ignorada (remetente anônimo)`);
        break;
    }
  }
}

function recebeAcknowledge(message, fila) {
  const payload = JSON.parse(message.toString());
  const { id, status, data } = payload;

  if (fila) {
    fila.receberAck(id, status, data);
  }
  else {
    log("[supervisorTarefas] Acknowledge recebido de remetente sem fila.");
  }
}
