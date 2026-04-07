import mqtt from "mqtt";

/**
 * @typedef {Object} LeituraMQTT
 * @property {number} idx - Índice do sensor no dispositivo
 * @property {number|string} val - Valor da leitura
 */

/**
 * @typedef {Object} mensagemMqtt
 * @property {number} v - Versão do payload
 * @property {string} deviceId - ID do dispositivo
 * @property {number} msgId - Contador incremental da mensagem
 * @property {number} uptime - Tempo desde o boot (ms)
 * @property {number} [ts] - Timestamp do dispositivo (epoch)
 * @property {number} [rssi] - Intensidade do sinal Wi-Fi
 * @property {LeituraMQTT[]} leituras - Lista de leituras dos sensores
 */
/** @type {mensagemMqtt} */
const payload = {
  v: 1,
  id: "sensor-123",
  msgId: 42,
  uptime: 12345678,
  ts: 1710000000,
  rssi: -70,
  vals: [
    { i: 0, v: 67 },
    { i: 1, v: 22.5 },
    { i: 2, v: 1 }
  ]
};


const BROKER_URL = "mqtt://192.168.18.135";

export function testMQTTPublish() {
  const client = mqtt.connect(BROKER_URL);

  client.on("connect", () => {
    console.log("Conectado ao broker MQTT (teste)");

    const payload = {
      v: 1,
      deviceId: "sensor-123",
      msgId: Math.floor(Math.random() * 1000),
      uptime: Math.floor(Math.random() * 100000),
      ts: Date.now(),
      rssi: -60,
      leituras: [
        { s: 0, v: Math.floor(Math.random() * 100) }, // umidade
        { s: 1, v: 20 + Math.random() * 10 },         // temperatura
        { s: 2, v: Math.random() > 0.5 ? 1 : 0 }     // sol
      ]
    };

    const topic = "micro-agricultor/sensores";

    client.publish(topic, JSON.stringify(payload), {}, (err) => {
      if (err) {
        console.error("Erro ao publicar:", err);
      } else {
        console.log("Mensagem publicada:", payload);
      }

      client.end();
    });
  });

  client.on("error", (err) => {
    console.error("Erro MQTT:", err);
  });
}

export function startMQTTTestLoop(interval = 5000) {
  const client = mqtt.connect(BROKER_URL);

  let msgId = 0;
  let uptime = 0;

  client.on("connect", () => {
    console.log("Simulador MQTT iniciado 🚀");

    setInterval(() => {
      msgId++;
      uptime += interval;

      const payload = {
        v: 1,
        deviceId: "sensor-123",
        msgId,
        uptime,
        ts: Date.now(),
        rssi: -60,
        leituras: [
          { s: 0, v: Math.floor(Math.random() * 100) },
          { s: 1, v: 20 + Math.random() * 10 },
          { s: 2, v: Math.random() > 0.5 ? 1 : 0 }
        ]
      };

      client.publish(
        "micro-agricultor/sensores",
        JSON.stringify(payload)
      );

      console.log("Enviado:", payload);
    }, interval);
  });
}