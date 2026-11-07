import { adquirirTarefa, ENTIDADE, MACRO, ORIGEM } from "micro-agricultor";
import { log } from "../logger/index.js";
import { cacheService } from "../../services/cache.js";
import { tarefasService } from "../../services/crud.js";

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
        else if (lowerTopic.includes("comandos")) handleMQTTComando(payload, grblCnc);
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
function moverGrblPara(filaGrbl, entidade = {}, tarefaId = "") {
    let eixosGCode = [];

    // Verifica cada eixo individualmente no objeto, diferenciando 0 de indefinido/nulo
    if (entidade.posicao.x !== undefined && entidade.posicao.x !== null) {
        eixosGCode.push(`X${
            filaGrbl.dispositivo.posicao.x - filaGrbl.dispositivo.dimensao.x/2 - entidade.posicao.x
        }`);
    }
    if (entidade.posicao.y !== undefined && entidade.posicao.y !== null) {
        eixosGCode.push(`Y${
            filaGrbl.dispositivo.posicao.y - filaGrbl.dispositivo.dimensao.y/2 - entidade.posicao.y
        }`);
    }
    if (entidade.dimensao.z !== undefined && entidade.dimensao.z !== null) {
        eixosGCode.push(`Z${entidade.dimensao.z}`);
    }

    // Se nenhum eixo foi informado no objeto, retorna false
    if (eixosGCode.length === 0) {
        return false; 
    }

    const coordenadasStr = eixosGCode.join(" ");
    const data = `G90 G0 ${coordenadasStr}`;

    filaGrbl.adicionar(tarefaId, data);
    return true;
}
function iniciarJob(filaGrbl, tarefaId) {
    filaGrbl.adicionar("", `JOB B${tarefaId}`);
}
function finalizarJob(filaGrbl, tarefaId) {
    filaGrbl.adicionar("", `JOB E${tarefaId}`);
}
function processarComando(template, variaveis) {
    return template.replace(/\{([^}]+)\}/g, (match, chave) => {
        // Se a variável existir no objeto, substitui; senão, mantém o original (ou vazio)
        return variaveis.hasOwnProperty(chave) ? variaveis[chave] : match;
    })
};

function rodarMacro(filaGrbl, tarefaId, macroId, variaveis) {
    if (!macroId) return false;
    MACRO[macroId].codeArray.forEach(code => {
        const comandoPronto = processarComando(code, variaveis);
        filaGrbl.adicionar(tarefaId, comandoPronto);
    });
}
function handleMQTTComando(payload, grblCnc) {
    log(`[handleGRBLCNC] Comando do GRBLCNC ${grblCnc.id} recebido: ${payload.data}`);

}
export function adquirirTarefaGrbl({filaGrbl, tarefa, cache}) {
    // 1. verifica se a tarefa pode ser adquirida pelo GRBLCNC
    // Associada a outro tipo de agente
    if (tarefa.execucao.agente?.tipo !== "GRBL") {
        log(`[adquirirTarefaGrbl] Tarefa atribuída a agente tipo ${tarefa.execucao.agente.tipo}`)
        return false;
    }
    // Já adquirida, sem expirar
    const agoraMs = Date.now();
    if (agoraMs < tarefa.execucao.adquiridaAte) {
        log(`[handleGRBLCNC] Tarefa ${tarefa.id} adquirida pelo agente ${tarefa.execucao.agente?.id}`);
        return false;
    }
    // GrblCNC tem algum sensor/atuador capaz de rodar a macro
    // Busca o índice do atuador correspondente
    const indiceAtuador = filaGrbl.dispositivo.atuadores.findIndex(
        a => a.macroId === tarefa.contexto.macroId
    );
    // Se o atuador foi encontrado, segue (findIndex retorna -1 se não encontrar)
    if (indiceAtuador === -1) {
        log(`[handleGRBLCNC] Nenhum atuador/sensor com macroId ${tarefa.contexto.macroId} encontrado no dispositivo.`);
        return false;
    }

    // O índice está salvo na variável 'indiceAtuador'
    log(`[handleGRBLCNC] Atuador encontrado no índice: ${indiceAtuador}`);


    //GrblCNC tem o alcance necessário
    const entidades = [];
    tarefa.contexto.entidadesId.forEach(entidadeId => {
    const ent = cache.map.get(entidadeId);
        if (!ent || !ent.posicao) {
            console.error(`Entidade ${entidadeId} não encontrada ou sem posição.`);
            return;
        }
        // Calcula o alcance do dispositivo
        const alcanceX = filaGrbl.dispositivo.dimensao.x / 2;
        const alcanceY = filaGrbl.dispositivo.dimensao.y / 2;
        const alcanceZ = filaGrbl.dispositivo.dimensao.z;

        // Verifica se a distância do centro do GRBLCNC até a entidade está dentro do alcance
        const noAlcanceX = alcanceX > Math.abs(ent.posicao.x - filaGrbl.dispositivo.posicao.x);
        const noAlcanceY = alcanceY > Math.abs(ent.posicao.y - filaGrbl.dispositivo.posicao.y);
        const noAlcanceZ = alcanceZ > ent.posicao.z + ent.dimensao.z - filaGrbl.dispositivo.posicao.z;
        if (!noAlcanceX) {
            console.error(`Entidade ${entidadeId} fora do alcance X do GRBL ${filaGrbl.dispositivo.id}.`);
            return;
        }
        if (!noAlcanceY) {
            console.error(`Entidade ${entidadeId} fora do alcance Y do GRBL ${filaGrbl.dispositivo.id}.`);
            return;
        }
        if (!noAlcanceZ) {
            console.error(`Entidade ${entidadeId} fora do alcance Z do GRBL ${filaGrbl.dispositivo.id}.`);
            return;
        }        
        console.log(`Entidade ${entidadeId} No alcance do GRBL ${filaGrbl.dispositivo.id}. (${ent.posicao.x},${ent.posicao.y},${ent.posicao.z})`);
        entidades.push(ent);
    });

    // 2. Adquire a tarefa para o GRBLcnc se alguma entidade puder ser manejada
    if (!entidades.length) {
        log(`[handleGRBLCNC] Tarefa ${tarefa.id} não tem nenhuma entidade no alcance do GRBL ${filaGrbl.dispositivo.id}.`);
        return;
    }
    const prazoExpiracao = 300000; // 5 minutos
    const tarefaAdquirida = adquirirTarefa({
        tarefa,
        agente: {tipo: "GRBLCNC", id: filaGrbl.dispositivo.id},
        timestamp: agoraMs,
        prazoExpiracao,
    });
    if (!tarefaAdquirida){
        log(`[handleGRBLCNC] Falha na aquisiç!ao da ${tarefa.id} pelo GRBL ${filaGrbl.dispositivo.id}.`);
        return;
    }
    tarefasService.update(tarefasService.getRefById(tarefa.id),tarefaAdquirida, {nome: "teste", uid:"teste2"})
    log(`[handleGRBLCNC] Tarefa atualizada no Firebase: ${tarefa.id}`);
    iniciarJob(filaGrbl, tarefa.id);
    entidades.forEach(ent => {
        const variaveis = {
            indiceAtuador,
            xDim: ent.dimensao.x,
            yDim: ent.dimensao.y,
            zDim: ent.dimensao.z,
            xPos: ent.posicao.x,
            yPos: ent.posicao.y,
            zPos: ent.posicao.z,
        }
        moverGrblPara(filaGrbl, ent, tarefa.id)
        rodarMacro(filaGrbl, tarefa.id, tarefa.contexto.macroId, variaveis);
    });
    finalizarJob(filaGrbl, tarefa.id);
}