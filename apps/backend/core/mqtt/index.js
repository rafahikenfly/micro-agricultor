import mqtt from "mqtt";
import { log } from "../logger/index.js";
import { handleDispositivo } from "./handleDispositivo.js";

const BROKER_URL = "mqtt://localhost:1883"; // ou teu broker

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
    client.subscribe("dispositivos/#", (err) => {
      if (err) {
        log("[startMQTT]: Erro ao se inscrever nos tópicos MQTT", err);
      } else {
        log("[startMQTT]: Inscrito no tópico MQTT dispositivos/#");
      }
    });
  });

  client.on("message", (topic, message) => {
    log(`[startMQTT]: Recebida mensagem ${message.toString()} em ${topic}`)
    handleMessage(topic, message);
  });

  client.on("error", (err) => {
    log("Erro MQTT", err);
  });

  client.on("close", () => {
    log("MQTT desconectado ⚠️");
  });
}

function handleMessage(topic, message) {
  if (topic.startsWith("dispositivos/")) {
    handleDispositivo(topic, message);
    return;
  }
  log(`MQTT ${message} no tópico ${topic} ignorada`)
}