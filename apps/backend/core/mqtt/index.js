import mqtt from "mqtt";
import { log } from "../logger/index.js";
import { handleDispositivo } from "./handleDispositivo.js";
import { handleGRBLCNC } from "./handleGRBLCNC.js";

const BROKER_URL = "mqtt://localhost:1883";

let client;

export function startMQTT() {
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
    client.subscribe("cnc/#", (err) => {
      if (err) {
        log("[startMQTT]: Erro ao se inscrever nos tópicos MQTT", err);
      } else {
        log("[startMQTT]: Inscrito no tópico MQTT cnc/#");
      }
    });
  });

  client.on("message", (topic, message) => {
    handleMessage(topic, message);
  });

  client.on("error", (err) => {
    log("Erro MQTT", err);
  });

  client.on("close", () => {
    log("MQTT desconectado ⚠️");
  });
}
export function getClient() {
  return client
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

function handleMessage(topic, message) {
  if (topic.startsWith("dispositivos/")) {
    handleDispositivo(topic, message);
    return;
  }
  if (topic.startsWith("cnc/")) {
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

    handleGRBLCNC(topic, message, grblCnc);
    return;
  }
  log(`MQTT ${message} no tópico ${topic} ignorada`)
}