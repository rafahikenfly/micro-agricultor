export class filaDispositivo {
    constructor(mqtt, dispositivo) {
        this.mqtt = mqtt;    // Instância do cliente MQTT
        this.fila = [];             // Comandos em processamento
        this.aguardandoAck = false; // Flag de controle: só envia o próximo se estiver false
        this.dispositivo = dispositivo;
        this._contadorMsgId = -1;
    }
    conectado() {
        if (!this.mqtt) console.error("Fila sem Cliente MQTT");
        return this.mqtt.connected
    }
    proximoId() {
        this._contadorMsgId++;
        return this._contadorMsgId;
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
    }
    despacharProximo() {
        if (!this.conectado) return false;
        if (this.aguardandoAck || this.fila.length === 0) return false;

        // Pega o próximo comando da fila (independente de qual job seja)
        // Trava o envio até receber o ACK QUEUED do ESP32
        // TODO: TIMEOUT DE ACK
        // Guarda no histórico de enviados para permitir rastreio ou purga posterior
        // Dispara o envio real
        const proximo = this.fila.shift();
        this.aguardandoAck = true;

        const comando = JSON.stringify(proximo);
        const comandoTopic = this.dispositivo.id + "/comandos";
    
        this.mqtt.publish(comandoTopic, comando, (err) => {
        if (err) {
            console.error("Erro ao publicar:", err);
            return false;
        }
        });
        console.log(`Enviado [${proximo.id}] para [${comandoTopic}]: ${comando.replace(/\n/g, ' | ')}`);
    }
    receberAck(msgId, status) {
        console.log(`[<< MQTT ACK] Status: ${status}`);

        if (status === "QUEUED" || status == "COMPLETED") {
            // Libera a trava para o próximo comando
            this.aguardandoAck = false;
            const atual = this.fila.find(i => i.id === msgId);
            if (atual) atual.estado = status;

            // Tenta enviar o próximo comando da fila imediatamente
            this.despacharProximo();
        }
        else if (status == "ERROR") {
            const atual = this.fila.find(i => i.id === msgId);
            if (atual) atual.estado == status;
            // TODO: ROTINA DE RETRY OU CANCEL DA TAREFA
        }
    }
    finalizar(tarefaId) {
        const totalAntes = this.fila.length;
        
        // Remove da fila de espera comandos que não foram enviados
        this.fila = this.fila.filter(item => item.job !== tarefaId);

        const removidos = totalAntes - this.fila.length;
        console.log(`[Job] Job [${tarefaId}] finalizado e purgado. ${removidos} comandos limpos do histórico.`);
    }
}