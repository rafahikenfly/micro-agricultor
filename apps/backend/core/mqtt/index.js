import mqtt from "mqtt";
import { log } from "../logger/index.js";

const BROKER_URL = "mqtt://localhost:1883"; // ou teu broker

let client;

export function startMQTT() {
  client = mqtt.connect(BROKER_URL);

  client.on("connect", () => {
    log("MQTT conectado");

    // Subscribe nos tópicos
    client.subscribe("micro-agricultor/#", (err) => {
      if (err) {
        log("Erro ao se inscrever nos tópicos MQTT", err);
      } else {
        log("Inscrito nos tópicos MQTT");
      }
    });
  });

  client.on("message", (topic, message) => {
    const msg = message.toString();

    log(`MQTT mensagem recebida: ${topic} -> ${msg}`);

    // TODO: roteamento por tópico
    handleMessage(topic, msg);
  });

  client.on("error", (err) => {
    log("Erro MQTT", err);
  });

  client.on("close", () => {
    log("MQTT desconectado ⚠️");
  });
}

function handleMessage(topic, message) {
  if (topic === "micro-agricultor/irrigacao") {
    log("Comando de irrigação recebido 💧");
    // aqui você conecta com sua lógica
  }
}