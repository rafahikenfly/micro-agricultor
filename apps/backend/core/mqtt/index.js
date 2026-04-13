import mqtt from "mqtt";
import { log } from "../logger/index.js";
import { handleDispositivo } from "./handleDispositivo.js";

const BROKER_URL = "mqtt://localhost:1883"; // ou teu broker

let client;

export function startMQTT() {
  client = mqtt.connect(BROKER_URL);

  client.on("connect", () => {
    log("MQTT conectado");

    // Subscribe nos tópicos
    client.subscribe("dispositivos/#", (err) => {
      if (err) {
        log("Erro ao se inscrever nos tópicos MQTT", err);
      } else {
        log("Inscrito no tópico MQTT dispositivos/#");
      }
    });
  });

  client.on("message", (topic, message) => {
    log(`Recebida mensagem ${message.toString()} em ${topic}`)
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