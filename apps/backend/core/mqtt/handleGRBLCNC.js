import { ENTIDADE, ORIGEM } from "micro-agricultor";
import { log } from "../logger/index.js";
import { cacheService } from "../../services/cache.js";
import { dispatchCommand } from "./index.js";


export async function handleGRBLCNC(topic, message, grblCnc) {
    const user = { uid: "handleGRBLCNC", nome: ORIGEM.BACKEND.id };
    const timestamp = Date.now();

    const [
      cachePlantas,
      cacheCanteiros
    ] = await Promise.all([
      cacheService.getPlantas(),
      cacheService.getCanteiros(),
    ]);
  
    const entidadeCaches = {
      [ENTIDADE.planta.id]: cachePlantas,
      [ENTIDADE.canteiro.id]: cacheCanteiros,
    }
  
    // recupera config do dispositivo
//    const grblCncId = topic.split("/")[1];
//    const grblCnc = cacheDispositivos.map.get(grblCncId)
//    if (!grblCnc) {
//      log(`[handleGRBLCNC]: Dispositivo ${grblCncId} não cadastrado.`);
//      return;
//    }

    // processa o payload
    try {
        const payload = JSON.parse(message.toString());
        const lowerTopic = topic.toLowerCase();

        if (lowerTopic.includes("ack")) {
/*            const msgId = payload.id;
            const status = payload.status || "ERROR";
            const data = payload.data || "";

             // Libera a espera para este msg_id específico, se houver alguém aguardando
            if (this.activeCommands && this.activeCommands[msgId]) {
                // Armazena o status atual recebido
                this.activeCommands[msgId].status = status;
                
                if (status === "COMPLETED") {
                    this.on_ackCompleted(msgId);
                } else if (status === "QUEUED") {
                    this.on_ackQueued(msgId);
                } else if (status === "ERROR") {
                    this.on_ackError(msgId);
                }
            }
            this.atualizarComandosAtivos();

            // Equivalente ao root.after(0, ...) dependendo do ambiente (ex: setTimeout ou requestAnimationFrame no front-end)
             handleMQTTAck(msgId, status, data);
 */           
        }
        else if (lowerTopic.includes("estado")) handleMQTTEstado(payload, grblCnc);
        else if (lowerTopic.includes("evento")) handleMQTTEvento(payload);
        else log(`MQTT ${message} no tópico ${topic} ignorada`);
    } catch (e) {
        log(`[handleGRBLCNC] Erro ao decodificar mensagem recebida: ${e}`);
    }
}

function handleMQTTEstado(payload, grblCnc) {
    //Atualiza o estado do GRBL
    const grbl = payload.grbl || {};
    const posData = grbl.pos || { x: 0.0, y: 0.0, z: 0.0 };
    grblCnc.grbl.estado = {
        estado: grbl.est ?? 6,
        bf: grbl.bf ?? 0,
        fdc: grbl.fdc ?? "--", //TODO: PARSE XYZ
        pos: {
            x: posData.x,
            y: posData.y,
            z: posData.z
        }
    }
    
    // Atualiza o estado do Xylema
    const xylema = payload.xylema || {};
    grblCnc.xylema.estado = {
        estado: xylema.est ?? 0,
        bf: xylema.bf ?? 0,
    }
    
    // Atualiza os estados dos atuadores ativos
    const atuadores = payload.at || {};
    Object.entries(grblCnc.atuador)
        .filter(([_, atObj]) => atObj.ativo) // Filtra apenas os atuadores ativos
        .forEach(([i, atObj]) => {
            // Busca o estado correspondente no payload
            const atState = atuadores[i] ?? atuadores[String(i)] ?? atuadores[Number(i)] ?? 0;
            
            // Atualiza o estado
            atObj.estado = atState;
    });
    log(`[handleGRBLCNC] Estado de GRBLCNC ${grblCnc.id} recebido e atualizado`);
}
function handleMQTTEvento(payload) {
    try {
        const { ts, tipo, msg, origem } = payload;

        // Formatando o timestamp (ex: convertendo segundos para um formato legível ou exibindo diretamente)
        // Se 'ts' for em segundos, podemos multiplicá-lo por 1000 se precisarmos de milissegundos para o Date
        const dataHora = new Date(ts * 1000).toLocaleTimeString("pt-BR", {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });

        // Monta a string de log formatada
        const logFormatado = `[${dataHora}] [${origem}] (Tipo ${tipo}): ${msg}`;

        // Exibe no console (ou envia para a sua interface)
        log(logFormatado);
    } catch (e) {
        console.error(`Erro ao processar log de evento: ${e}`);
    }
}
async function rapidMoveJog(grblCnc, axis, direction, step, msgId = 1) {
    // Monta o G-code exatamente como no Python (usando \n para quebras de linha)
    const data = `G91 G0 ${axis}${direction * step}\nG90`;
    
    // Despacha o comando usando a função que criamos anteriormente
    const sucesso = await dispatchCommand(grblCnc, data, msgId, false, "");
    
    return sucesso;
}

export async function executarTesteMovimento(grblCnc) {
    console.log("Iniciando teste de movimento JOG...");

    // Movimento no eixo X (-100) -> axis: 'X', direction: -1, step: 100
    await rapidMoveJog(grblCnc, 'X', -1, 100, 101);

    // Pequena pausa entre os comandos se necessário, ou envie o Y logo em seguida:
    
    // Movimento no eixo Y (-100) -> axis: 'Y', direction: -1, step: 100
    await rapidMoveJog(grblCnc, 'Y', -1, 100, 102);
}