import { VARIANTE } from "./VARIANTE.js";

export const DISPOSITIVO = {
  SENSOR: { id: "SENSOR", nome: "Caixa de Sensores", variant: VARIANTE.LIGHTBLUE.variant, },
  GRBL: { id: "GRBL", nome: "GRBL CNC", variant: VARIANTE.RED.variant, },
};

export const ESTADO_GRBL = [
    "Ocioso",
    "Ativo",
    "Em pausa",
    "Alarme",
    "Porta",
    "Homing",
    "Desconhecido",  
]

export const ESTADO_XYLEMA = [
    "Ocioso",
    "Aguarda ack GRBL",
    "Aguarda Idle GRBL",
    "Aguardando",
    "Bloqueado",
    "Erro crítico"
]