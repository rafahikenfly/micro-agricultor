class filaDispositivo {
    constructor(clienteMqtt, dispositivo) {
        this.mqtt = clienteMqtt;    // Instância do seu cliente MQTT
        this.fila = [];             // Comandos aguardando para serem enviados
        this.comandosEnviados = []; // Histórico de comandos já enviados
        this.aguardandoAck = false; // Flag de controle: só envia o próximo se estiver false
        this._contadorMsgId = 0;
    }
    proximoId() {
        return this._contadorMsgId++;
    }
    adicionar(tarefaId, data, rt = false, meta={}) {
        const item = {
            id: this.proximoId(),
            job: tarefaId,
            data,
            rt,
            estado: "PENDENTE",
            ...meta,
        };
        this.fila.push(item);
        this.despacharProximo();
        console.log(`[gerenciadorFilaDispositivo] Comando adicionado ao Job [${tarefaId}].`);
    }
    despacharProximo() {
        if (this.aguardandoAck || this.fila.length === 0) {
            return;
        }

        // Pega o próximo comando da fila (independente de qual job seja)
        // Trava o envio até receber o ACK QUEUED do ESP32
        // Guarda no histórico de enviados para permitir rastreio ou purga posterior
        // Dispara o envio real
        const proximo = this.fila.shift();
        this.aguardandoAck = true;
        despacharComando(proximo); //TODO
        this.comandosEnviados.push({...proximo, estado: "ENVIADO"});
    }
    receberAck(msgId, status) {
        console.log(`[<< MQTT ACK] Status: ${status}`);

        if (status === "QUEUED" || status == "COMPLETED") {
            // Libera a trava para o próximo comando
            this.aguardandoAck = false;
            const atual = this.comandosEnviados.find(i => i.id === msgId);
            if (atual) atual.estado = status;

            // Tenta enviar o próximo comando da fila imediatamente
            this.despacharProximo();
        }
        else if (status == "ERROR") {
            const atual = this.comandosEnviados.find(i => i.id === msgId);
            if (atual) atual.estado == status;
            // TODO: ROTINA DE RETRY OU CANCEL DA TAREFA
        }
    }
    finalizar(tarefaId) {
        const totalAntes = this.comandosEnviados.length;
        
        // Remove do histórico de enviados os comandos daquele job
        // Remove da fila de espera comandos que não foram enviados
        this.comandosEnviados = this.comandosEnviados.filter(item => item.job !== tarefaId);
        this.fila = this.fila.filter(item => item.job !== tarefaId);

        const removidos = totalAntes - this.comandosEnviados.length;
        console.log(`[Job] Job [${tarefaId}] finalizado e purgado. ${removidos} comandos limpos do histórico.`);
    }
}

// --- Exemplo de Uso ---
const filaGrblCNC = new filaDispositivo();

// 2. Adiciona vários comandos (eles entram na fila)
filaGrblCNC.adicionar("G0 X0 Y0");
filaGrblCNC.adicionar("G1 X10 Y10 F500");

// 3. Simulando a chegada dos ACKs "QUEUED" do ESP32 via MQTT um por um
// (O segundo só é despachado após o primeiro receber o ACK QUEUED)
filaGrblCNC.receberAck(1, "QUEUED");
filaGrblCNC.receberAck(2, "QUEUED");
filaGrblCNC.receberAck(3, "QUEUED");
    
// 4. Quando o job chega ao fim, purga tudo
filaGrblCNC.finalizar();