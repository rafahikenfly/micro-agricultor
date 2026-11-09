import { adquirirTarefa, concluirTarefa, falharTarefa, MACRO, ORIGEM, } from "micro-agricultor";
import { log } from "../logger/index.js";
import { dispositivosService, tarefasService } from "../../services/crud.js";
import { telemedir } from "micro-agricultor/application/entidades/telemedir.js";

export async function handleGRBLCNC(topic, message, dispositivo) {
    try {
        const payload = JSON.parse(message.toString());
        if (topic.includes("ack")) {}
        else if (topic.includes("estado")) handleMQTTEstado(payload, dispositivo);
        else if (topic.includes("evento")) handleMQTTEvento(payload);
        else if (topic.includes("comandos")) handleMQTTComando(payload, dispositivo);
        else if (topic.includes("ack"), handleMQTTAck(payload, dispositivo));
        else log(`MQTT ${message} no tópico ${topic} ignorada`);
    } catch (e) {
        log(`[handleGRBLCNC] Erro ao decodificar mensagem recebida: ${e}`);
    }
}

function handleMQTTEstado(payload, dispositivo) {
    const user = { uid: "handleGRBLCNC", nome: ORIGEM.BACKEND.id };
    const timestamp = Date.now();
    //Atualiza o estado do GRBL
    const grbl = payload.grbl || {};
    const posData = grbl.pos || { x: 0.0, y: 0.0, z: 0.0 };
    const telemetria = {}

    telemetria.grbl = {
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
    telemetria.xylema = {
        estado: xylema.est ?? 0,
        bf: xylema.bf ?? 0,
        tarefaId: xylema.job ?? ""
    }
    
    telemetria.atuadores = []
    // Atualiza os estados dos atuadores ativos
    const atStateMQTT = payload.at || {};
    if (dispositivo && dispositivo.atuadores) Object.entries(dispositivo.atuadores)
        .forEach(([i, atFirebase]) => {
            if (atFirebase.ativo && atStateMQTT[i] !== undefined) telemetria.atuadores.push ({estado: atStateMQTT[i]});
            else telemetria.atuadores.push(null);
    });
    telemedir({
        services: {entidade: dispositivosService},
        entidade: dispositivo,
        estado: telemetria,
        timestamp,
        user
    })
    log(`[handleGRBL] Estado de GRBL ${dispositivo.id} recebido e atualizado`);
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
function handleMQTTComando(payload, dispositivo) {
    log(`[handleGRBLCNC] Comando do GRBLCNC ${dispositivo.id} recebido: ${payload.data}`);
}



async function moverGrblPara(filaGrbl, entidade = {}, tarefaId = "", eventos) {
    let eixosGCode = [];

    // Verifica cada eixo individualmente no objeto, diferenciando 0 de indefinido/nulo
    if (entidade.posicao.x !== undefined && entidade.posicao.x !== null) {
        eixosGCode.push(`X${
            filaGrbl.dispositivo.posicao.x - filaGrbl.dispositivo.dimensao.x/2 - entidade.posicao.x
        }0`);
    }
    if (entidade.posicao.y !== undefined && entidade.posicao.y !== null) {
        eixosGCode.push(`Y${
            filaGrbl.dispositivo.posicao.y - filaGrbl.dispositivo.dimensao.y/2 - entidade.posicao.y
        }0`);
    }
    if (entidade.dimensao.z !== undefined && entidade.dimensao.z !== null) {
        eixosGCode.push(`Z${entidade.dimensao.z - filaGrbl.dispositivo.dimensao.z}0`);
    }

    // Se nenhum eixo foi informado no objeto, retorna false
    if (eixosGCode.length === 0) {
        return false; 
    }

    const coordenadasStr = eixosGCode.join(" ");
    const data = `G90 G0 ${coordenadasStr}`;

    await filaGrbl.adicionar(tarefaId, data, false, {onError: eventos.onError});
    return true;
}
function processarComando(template, variaveis) {
    return template.replace(/\{([^}]+)\}/g, (match, chave) => {
        // Se a variável existir no objeto, substitui; senão, mantém o original (ou vazio)
        return variaveis.hasOwnProperty(chave) ? variaveis[chave] : match;
    })
};

async function rodarMacro(filaGrbl, tarefaId, macroId, variaveis, eventos) {
    if (!macroId) return false;
    for (const code of MACRO[macroId].codeArray) {
        const comandoPronto = processarComando(code, variaveis);
        //console.log(`Fila-->${comandoPronto}`);
        await filaGrbl.adicionar(tarefaId, comandoPronto, false, {onError: eventos.onError});
    }
}

async function incluirTarefaFila(filaGrbl, tarefa, entidades, indiceAtuador, eventos) {
    await filaGrbl.adicionar("", `JOB $${tarefa.id}`, false, {onError: eventos.onError});

    for (const ent of entidades) {
        const variaveis = {
            indiceAtuador,
            xDim: ent.dimensao.x * 10,
            yDim: ent.dimensao.y * 10,
            zDim: ent.dimensao.z * 10,
            xPos: ent.posicao.x * 10,
            yPos: ent.posicao.y * 10,
            zPos: ent.posicao.z * 10,
        };
        
        await moverGrblPara(filaGrbl, ent, tarefa.id, {onError: eventos.onError});
        await rodarMacro(filaGrbl, tarefa.id, tarefa.contexto.macroId, variaveis, {onError: eventos.onError});
    }
    await filaGrbl.adicionar(tarefa.id, `JOB |${tarefa.id}`, false, {onComplete: eventos.onComplete, onError: eventos.onError});
}
function filtrarEntidadesAoAlcance(tarefa, cacheEntidades, dispositivo) {
    //GrblCNC tem o alcance necessário
    const entidades = [];
    tarefa.contexto.entidadesId.forEach(entidadeId => {
    const ent = cacheEntidades.map.get(entidadeId);
        if (!ent || !ent.posicao) {
            console.error(`Entidade ${entidadeId} não encontrada ou sem posição.`);
            return;
        }
        // Calcula o alcance do dispositivo
        const alcanceX = dispositivo.dimensao.x / 2;
        const alcanceY = dispositivo.dimensao.y / 2;
        const alcanceZ = dispositivo.dimensao.z;

        // Verifica se a distância do centro do GRBLCNC até a entidade está dentro do alcance
        const noAlcanceX = alcanceX > Math.abs(ent.posicao.x - dispositivo.posicao.x);
        const noAlcanceY = alcanceY > Math.abs(ent.posicao.y - dispositivo.posicao.y);
        const noAlcanceZ = alcanceZ > ent.posicao.z + ent.dimensao.z - dispositivo.posicao.z;
        if (!noAlcanceX) {
            console.error(`Entidade ${entidadeId} fora do alcance X do GRBL ${dispositivo.id}.`);
            return;
        }
        if (!noAlcanceY) {
            console.error(`Entidade ${entidadeId} fora do alcance Y do GRBL ${dispositivo.id}.`);
            return;
        }
        if (!noAlcanceZ) {
            console.error(`Entidade ${entidadeId} fora do alcance Z do GRBL ${dispositivo.id}.`);
            return;
        }        
        console.log(`Entidade ${entidadeId} No alcance do GRBL ${dispositivo.id}. (${ent.posicao.x},${ent.posicao.y},${ent.posicao.z})`);
        entidades.push(ent);
    });
    return entidades;
}
export async function adquirirTarefaGrbl({filaGrbl, tarefa, cache, eventos, timestamp}) {
    // Busca o índice do atuador correspondente no GrblCNC capaz de rodar a macro
    // TODO: o rule do dispositivo usa a caracteristicaId para fazer a operaçào.
    // será que dá para padronizar?
    const indiceAtuador = filaGrbl.dispositivo.atuadores.findIndex(
        a => a.macroId === tarefa.contexto.macroId
    );
    // Se o atuador foi encontrado, segue (findIndex retorna -1 se não encontrar)
    if (indiceAtuador === -1) {
        log(`[handleGRBLCNC] Nenhum atuador/sensor com macroId ${tarefa.contexto.macroId} encontrado no dispositivo.`);
        return false;
    }
    // TODO: buscar os sensores também
    log(`[handleGRBLCNC] Atuador encontrado no índice: ${indiceAtuador}`);



    // Busca as entidades que podem ser manejadas
    const entidades = filtrarEntidadesAoAlcance(tarefa, cache, filaGrbl.dispositivo);
    if (!entidades.length) {
        log(`[handleGRBLCNC] Tarefa ${tarefa.id} não tem nenhuma entidade no alcance do GRBL ${filaGrbl.dispositivo.id}.`);
        return;
    }

    // Adquire a tarefa
    const prazoExpiracao = 300000; // 5 minutos
    const tarefaAdquirida = adquirirTarefa({
        tarefa,
        agente: {tipo: "GRBL", id: filaGrbl.dispositivo.id},
        timestamp,
        prazoExpiracao,
    });
    if (!tarefaAdquirida){
        log(`[handleGRBLCNC] Falha na aquisição da ${tarefa.id} pelo GRBL ${filaGrbl.dispositivo.id}.`);
        return;
    }
    tarefasService.update(tarefasService.getRefById(tarefa.id),tarefaAdquirida, {nome: "BACKEND", uid:"adquirirTarefa"})
    log(`[handleGRBLCNC] Tarefa adquirida no Firebase: ${tarefa.id}`);

    await incluirTarefaFila(filaGrbl, tarefa, entidades, indiceAtuador, eventos)
}
export async function liberarTarefaGrbl({tarefa, erro}) {
    const timestamp = Date.now()
    let tarefaLiberada = {}
    if (erro) tarefaLiberada = falharTarefa({tarefa, erro, timestamp});
    else tarefaLiberada = concluirTarefa({tarefa, timestamp});    
    tarefasService.update(tarefasService.getRefById(tarefa.id),tarefaLiberada, {nome: "BACKEND", uid:"liberarTarefa"})
    log(`[handleGRBLCNC] Tarefa liberada no Firebase: ${tarefa.id}`);
}