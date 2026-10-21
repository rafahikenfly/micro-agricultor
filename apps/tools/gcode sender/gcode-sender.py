import tkinter as tk
from tkinter import messagebox
from tkinter import ttk
import paho.mqtt.client as mqtt
import time
import threading
import random
import datetime
import json

from macros import MACROS


# Configurações padrão do MQTT (ajuste conforme seu broker)
DEFAULT_BROKER = "192.168.18.15"
DEFAULT_PORT = 1883
DEFAULT_TOPIC = "cnc"

#GRBL -->$130=1290.000
#GRBL -->$131=855.000
#GRBL -->$132=815.000
X_LIMIT = [-1280, -10]
Y_LIMIT = [ -845, -10]
Z_LIMIT = [ -805, -10]

GRBL_ESTADOS = {
    0: {"texto": "Ocioso", "cor": "blue"},
    1: {"texto": "Ativo", "cor": "green"},
    2: {"texto": "Pausa", "cor": "orange"},
    3: {"texto": "Alarme", "cor": "red"},
    4: {"texto": "Porta", "cor": "purple"},
    5: {"texto": "Homing", "cor": "magenta"},
    6: {"texto": "Desconhecido", "cor": "gray"},
}
XYLEMA_ESTADOS = {
    0: {"texto": "Pronto", "cor": "blue"},
    1: {"texto": "Aguardando ok", "cor": "green"},
    2: {"texto": "Aguardando idle", "cor": "green"},
    2: {"texto": "Aguardando", "cor": "green"},
    4: {"texto": "Bloqueado", "cor": "red"},
}

class CNCJogApp:
    def __init__(self, root):

        self.root = root
        self.root.title("Jardineto Controller")
        self.root.geometry("770x1080")
        self.root.resizable(True, True)
        self.random_test_active = False
        self.square_test_active = False
        self.zigzag_test_active = False
        self.helix_test_active = False
        self.limit_test_active = False
        self.modo_comando = tk.StringVar(value="sync")
        self.msg_counter = 1
        self.ack_events = {}
        self.ack_status = {}

        # Cliente MQTT
        self.client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.is_connected = False

        # Dicionário para rastrear o estado de cada acessório (False = Desligado, True = Ligado)
        self.atuador = {}

        self.create_widgets()

    def on_connect(self, client, userdata, flags, reason_code, properties):
        if reason_code == 0:
            self.status_lbl.config(text="Status: Conectado ao MQTT", fg="green")
            self.is_connected = True

            ack_topic = self.topic_entry.get() + "/ack"
            status_topic = self.topic_entry.get() + "/estado"
            event_topic = self.topic_entry.get() + "/evento"
            client.subscribe(ack_topic)
            print(f"Inscrito no tópico de ack: {ack_topic}")
            client.subscribe(status_topic)
            print(f"Inscrito no tópico de status: {status_topic}")
            client.subscribe(event_topic)
            print(f"Inscrito no tópico de event: {event_topic}")
        else:
            self.status_lbl.config(text=f"Status: Falha na conexão (código {reason_code})", fg="red")
            self.is_connected = False

    def on_message(self, client, userdata, msg):
            import json
            try:
                payload = json.loads(msg.payload.decode())
                topic = msg.topic.lower()
                
                if "ack" in topic:
                    msg_id = payload.get("id")
                    status = payload.get("status", "OK")
                    data = payload.get("data", "")
                    # Libera a espera para este msg_id específico, se houver alguém aguardando
                    if msg_id in self.ack_events:
                        # Armazena o status atual recebido
                        self.ack_status[msg_id] = status
                        # Se for COMPLETED, liberam a espera imediatamente.
                        if status == "COMPLETED":
                            self.ack_events[msg_id].set()
                        # Se for QUEUED, libera a espera imediatamente.
                        elif status == "QUEUED":
                            self.ack_events[msg_id].set()
                        # Se for ERROR, libera a espera imediatamente.
                        elif status == "ERROR":
                            self.ack_events[msg_id].set()

                    self.root.after(0, lambda: self.log_ack(msg_id, status, data))
                elif "estado" in topic:
                    self.root.after(0, lambda: self.atualizarEstados(payload))
                elif "evento" in topic:
                    self.root.after(0, lambda: self.log_event(payload))                    
            except Exception as e:
                print(f"Erro ao decodificar mensagem recebida: {e}")

    def atualizarEstados(self, data):
        grbl = data.get("grbl", {})
        fila = data.get("fila", {})
        acessorios_data = data.get("acessorios", {})        

        grbl_state = grbl.get("estado", 6)
        guiche_state = fila.get("guiche", 0)
        grbl_disp = grbl.get("disponivel", "--")
        fila_disp = fila.get("disponivel", "--")
        endstop = grbl.get("endstops", "--")

        pos_data = grbl.get("pos", {"x": 0.0, "y": 0.0, "z": 0.0})
        if isinstance(pos_data, dict):
            x = pos_data.get("x", 0.0)
            y = pos_data.get("y", 0.0)
            z = pos_data.get("z", 0.0)
            posicao = f"{x},{y},{z}"
        else:
            posicao = str(pos_data)
        
        # Atualiza os textos na interface
        info_grbl = GRBL_ESTADOS.get(grbl_state, {"texto": f"Outro ({grbl_state})", "cor": "black"})
        self.lbl_grbl_state.config(text=info_grbl["texto"], fg=info_grbl["cor"])
        self.lbl_pos.config(text=f"[{posicao}]")
        info_guiche = XYLEMA_ESTADOS.get(guiche_state, {"texto": f"Outro ({grbl_state})", "cor": "black"})
        self.lbl_guiche_state.config(text=info_guiche["texto"], fg=info_guiche["cor"])
        self.lbl_buffers.config(text=f"Grbl: {grbl_disp} instruções | Fila: {fila_disp} instruções")
        self.lbl_endstop.config(text=f"{endstop}", fg="red")

        # Atualiza os acessórios na interface
        for i in range(4):
            estado_bool = acessorios_data.get(str(i), acessorios_data.get(i, False))
            
            if i in self.atuador:
                self.atuador[i]["estado"] = estado_bool
                info = self.atuador.get(i)
                self.atualizarVisualBtn(info["botao"], estado_bool, f"Acessório {i}")
    def log_ack(self, msg_id, status, data = None):
        # Adiciona a linha no painel de log visual da interface
        log_text = f"[ACK Recebido] ID: {msg_id} -> Status: {status} {data}\n"
        
        # Insere na caixa de texto da aba de ack
        self.log_ack_box.insert("end", log_text)
        self.log_ack_box.see("end")  # Auto-scroll para a última linha
    def log_event(self, data):
        # Formata um timestamp legível para o log
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        
        tipo = data.get("tipo", "INFO")
        origem = data.get("origem", "DESCONHECIDO")
        mensagem = data.get("mensagem", "")
        
        # Monta a linha de texto formatada para a caixa de eventos
        log_text = f"[{timestamp}] [{tipo}] {origem}: {mensagem}\n"
        
        # Insere na caixa de texto da aba de eventos
        self.log_evento_box.insert("end", log_text)
        self.log_evento_box.see("end")  # Auto-scroll para a última linha

    def conectarMQTT(self):
        broker = self.broker_entry.get()
        port = int(self.port_entry.get())
        try:
            self.client.connect(broker, port, 60)
            self.client.loop_start()
        except Exception as e:
            messagebox.showerror("Erro de Conexão", str(e))

    def proximoId(self):
        current_id = self.msg_counter
        self.msg_counter += 1
        return current_id
    def rapidMoveJog(self, axis, direction, step):
        if not self.is_connected:
            messagebox.showwarning("Aviso", "Não conectado ao broker MQTT!")
            return

        msg_id = self.proximoId()
        # Monta o G-code no Modo incremental G91
        gcode = f'{{"id":{msg_id}, "type":"gcode", "data":"G91 G0 {axis}{direction * step}"}}'
        comando_topic = self.topic_entry.get() + "/comandos"
        self.client.publish(comando_topic, gcode)
        print(f"Enviado [{msg_id}] para [{comando_topic}]: {gcode.replace(chr(10), ' | ')}")

        # Volta para o modo absoluto
        msg_id_2 = self.proximoId()
        gcode_2 = f'{{"id":{msg_id_2}, "type":"gcode", "data":"G90"}}'
        self.client.publish(comando_topic, gcode_2)
        print(f"Enviado [{msg_id_2}] para [{comando_topic}]: {gcode_2}")
    def rapidMoveTo(self, position):
        if not self.is_connected:
            messagebox.showwarning("Aviso", "Não conectado ao broker MQTT!")
            return

        msg_id = self.proximoId()
        # Monta o G-code (Modo Absoluto G90)
        gcode = f'{{"id":{msg_id}, "type":"gcode", "data":"G90 G0 {position}"}}'

        comando_topic = self.topic_entry.get() + "/comandos"
        self.client.publish(comando_topic, gcode)
        print(f"Enviado [{msg_id}] para [{comando_topic}]: {gcode.replace(chr(10), ' | ')}")
    def publishRT(self, rt, value = 0, payload = ""):
        if not self.is_connected:
            messagebox.showwarning("Aviso", "Não conectado ao broker MQTT!")
            return
        msg_id = self.proximoId()
        # Monta o G-code
        data = f'{{"id":{msg_id}, "type":"rt", "data":"{rt}", "value":{value}, "payload": "{payload}"}}'

        comando_topic = self.topic_entry.get() + "/comandos"
        self.client.publish(comando_topic, data)
        print(f"Enviado [{msg_id}] para [{comando_topic}]: {data.replace(chr(10), ' | ')}")
    def publishGCode(self, gcode):
        if not self.is_connected:
            messagebox.showwarning("Aviso", "Não conectado ao broker MQTT!")
            return
        msg_id = self.proximoId()
        # Monta o G-code
        data = f'{{"id":{msg_id}, "type":"gcode", "data":"{gcode}"}}'

        comando_topic = self.topic_entry.get() + "/comandos"
        self.client.publish(comando_topic, data)
        print(f"Enviado [{msg_id}] para [{comando_topic}]: {data.replace(chr(10), ' | ')}")
    def publishSync(self, sync, value = 0, payload = ""):
        if not self.is_connected:
            messagebox.showwarning("Aviso", "Não conectado ao broker MQTT!")
            return
        msg_id = self.proximoId()
        # Monta o Sync
        data = f'{{"id":{msg_id}, "type":"sync", "data":"{sync}", value: {value}, payload: "{payload}"}}'

        comando_topic = self.topic_entry.get() + "/comandos"
        self.client.publish(comando_topic, data)
        print(f"Enviado [{msg_id}] para [{comando_topic}]: {data.replace(chr(10), ' | ')}")

    def enviarCustomizado(self):
        if not self.is_connected:
            messagebox.showwarning("Aviso", "Não conectado ao broker MQTT!")
            return
        
        tipo = self.custom_type_var.get()
        data_val = self.custom_data_entry.get().strip()
        value_val = self.custom_value_entry.get().strip()
        payload_val = self.custom_payload_entry.get().strip()

        # Monta o dicionário base
        payload_dict = {"type": tipo, "data": data_val}

        # Adiciona value e payload se preenchidos (ou converte value para int se necessário)
        if value_val:
            try:
                payload_dict["value"] = int(value_val)
            except ValueError:
                payload_dict["value"] = value_val
                
        if payload_val:
            payload_dict["payload"] = payload_val

        msg_id = self.proximoId()
        payload_final = {"id": msg_id, **payload_dict}
        data_json = json.dumps(payload_final)

        comando_topic = self.topic_entry.get() + "/comandos"
        self.client.publish(comando_topic, data_json)
        print(f"Enviado [{msg_id}] para [{comando_topic}]: {data_json}")

    def rodarTeste(self, tipoTeste):
        if not self.is_connected:
            messagebox.showwarning("Aviso", "Não conectado ao broker MQTT!")
            return

        # Roda em background (Thread) para disparar a rajada sem travar a interface
        threading.Thread(target=self._stress_worker, args=(tipoTeste,), daemon=True).start()
    def rodarMacro(self, macro):
        if not self.is_connected:
            messagebox.showwarning("Aviso", "Não conectado ao broker MQTT!")
            return
        
        commands = MACROS.get(macro)
        if not commands:
            print(f"--- Macro '{macro}' não encontrada ---")
            return
        
        print(f"--- Enviando macro {macro} ---")
        for cmd in commands:
            if not self.is_connected:
                break
            msg_id = self.proximoId()
            payload_dict = cmd.copy()
            payload_final = {"id": msg_id, **payload_dict}
            data = json.dumps(payload_final)
            comando_topic = self.topic_entry.get() + "/comandos"

            # Cria o evento de sincronização para este ID
            ack_event = threading.Event()
            self.ack_events[msg_id] = ack_event            
            
            # Publica o comando
            self.client.publish(comando_topic, data)
            print(f"Enviado [{msg_id}] para [{comando_topic}]: {data}")

            # Espera o ACK chegar (com timeout de segurança de 5 segundos)
            recebeu_ack = ack_event.wait(timeout=5.0)
            status_ack = self.ack_status.get(msg_id)
            self.ack_events.pop(msg_id, None)
            if not recebeu_ack:
                print(f"Timeout: ACK não recebido para o comando [{msg_id}]. Parando o envio da macro.")
                break # Interrompe a sequência se houver falha/timeout
            if status_ack == "ERROR":
                print(f"Comando [{msg_id}] retornou ERROR. Parando o envio da macro.")
                break # Para tudo se houver erro
        print(f"--- Macro {macro} enviada ---")
            

    def atualizarVisualBtn(self, btn, ligado, label):
        if ligado:
            # Força o fundo vermelho e letras brancas
            btn.config(
                text=f"{label}\n[LIGADO]", 
                bg="#f44336", 
                fg="white",
                activebackground="#d32f2f", # Cor ao clicar
                activeforeground="white"
            )
        else:
            btn.config(
                text=f"{label}\n", 
                bg="#d9d9d9", 
                fg="black",
                activebackground="#c0c0c0",
                activeforeground="black"
            )
    def atualizarCamposCustom(self):
        # Opcional: Ajusta o estado dos campos se quiser desativar o que não é usado no gcode
        tipo = self.custom_type_var.get()
        if tipo == "gcode":
            self.custom_value_entry.config(state="disabled")
            self.custom_payload_entry.config(state="disabled")
        else:
            self.custom_value_entry.config(state="normal")
            self.custom_payload_entry.config(state="normal")


    def toggle_atuador(self, index):
        modo = self.modo_comando.get()
        pub_func = self.publishSync if modo == "sync" else self.publishRT

        # Inverte o estado atual local apenas para saber qual comando enviar, 
        # mas sem mexer no visual do botão agora (deixa isso para o update_telemetry)
        info = self.atuador[index]
        pwm = info["pwm"].get()
        estado = info["estado"]

        if(pwm == estado):
            pub_func("SET OFF", index)
        else:
            pub_func("SET ON", index, str(pwm)) 


    def toggle_random_test(self):
        if not self.is_connected:
            messagebox.showwarning("Aviso", "Não conectado ao broker MQTT!")
            return

        if not self.random_test_active:
            # Ativa o modo
            self.random_test_active = True
            threading.Thread(target=self._random_loop_worker, daemon=True).start()
            print("--- Teste de movimento aleatório ATIVADO ---")
            self.atualizarVisualBtn(self.randomTestBtn, True, "Aleatório")
        else:
            # Desativa o modo
            self.random_test_active = False
            print("--- Teste de movimento aleatório DESATIVADO ---")
            self.atualizarVisualBtn(self.randomTestBtn, False, "Aleatório")
    def toggle_square_test(self):
        if not self.is_connected:
            messagebox.showwarning("Aviso", "Não conectado ao broker MQTT!")
            return

        if not self.square_test_active:
            # Ativa o modo
            self.square_test_active = True
            threading.Thread(target=self._square_loop_worker, daemon=True).start()
            print("--- Teste de movimento quadrado ATIVADO ---")
            self.atualizarVisualBtn(self.squareTestBtn, True, "Quadrado")
        else:
            # Desativa o modo
            self.square_test_active = False
            print("--- Teste de movimento quadrado DESATIVADO ---")
            self.atualizarVisualBtn(self.squareTestBtn, False, "Quadrado")
    def toggle_zigzag_test(self):
        if not self.is_connected:
            messagebox.showwarning("Aviso", "Não conectado ao broker MQTT!")
            return

        if not self.zigzag_test_active:
            # Ativa o modo
            self.zigzag_test_active = True
            threading.Thread(target=self._zigzag_loop_worker, daemon=True).start()
            print("--- Teste de movimento zig-zag ATIVADO ---")
            self.atualizarVisualBtn(self.zigzagTestBtn, True, "Zigzag")
        else:
            # Desativa o modo
            self.zigzag_test_active = False
            print("--- Teste de movimento zig-zag DESATIVADO ---")
            self.atualizarVisualBtn(self.zigzagTestBtn, False, "Zigzag")
    def toggle_limit_test(self):
        if not self.is_connected:
            messagebox.showwarning("Aviso", "Não conectado ao broker MQTT!")
            return

        if not self.limit_test_active:
            # Ativa o modo
            self.limit_test_active = True
            threading.Thread(target=self._limit_loop_worker, daemon=True).start()
            print("--- Teste de movimento até limites ATIVADO ---")
            self.atualizarVisualBtn(self.limitTestBtn, True, "Limites")
        else:
            # Desativa o modo
            self.limit_test_active = False
            print("--- Teste de movimento até limites DESATIVADO ---")
            self.atualizarVisualBtn(self.limitTestBtn, False, "Limites")
    def toggle_helix_test(self):
        if not self.is_connected:
            messagebox.showwarning("Aviso", "Não conectado ao broker MQTT!")
            return

        if not self.helix_test_active:
            # Ativa o modo
            self.helix_test_active = True
            threading.Thread(target=self._helix_loop_worker, daemon=True).start()
            print("--- Teste de movimento helicoidal ATIVADO ---")
            self.atualizarVisualBtn(self.helixTestBtn, True, "Helicoidal")
        else:
            # Desativa o modo
            self.helix_test_active = False
            print("--- Teste de movimento helicoidal DESATIVADO ---")
            self.atualizarVisualBtn(self.helixTestBtn, False, "Helicoidal")


    def _random_loop_worker(self):
        while self.random_test_active:
            # Sorteia as posições (ajuste os limites conforme sua máquina)
            x_target = random.uniform(X_LIMIT[0], X_LIMIT[1])
            y_target = random.uniform(Y_LIMIT[0], Y_LIMIT[1])
            z_target = random.uniform(Z_LIMIT[0], Z_LIMIT[1])

            position = f'X{x_target:.2f} Y{y_target:.2f} Z{z_target:.2f}'
            self.rapidMoveTo(position)

            # Aguarda 30 segundos picotados em pedacinhos de 1s para conseguir parar rápido se o usuário desativar
            for _ in range(15):
                if not self.random_test_active:
                    break
                time.sleep(1)
    def _square_loop_worker(self):
        commands = [
            "G91",
            "G0 X5", "G0 Y5", "G0 X-5", "G0 Y-5",
            "G0 X5", "G0 Y5", "G0 X-5", "G0 Y-5",
            "G90"
        ]
        while self.square_test_active:
            for cmd in commands:
                if not self.is_connected:
                    break
                self.publishGCode(cmd)
                # Intervalo ultra-rápido de 10ms (0.01s) entre as linhas
                time.sleep(0.01)
            # Aguarda 60 segundos picotados em pedacinhos de 1s para conseguir parar rápido se o usuário desativar
            for _ in range(4):
                if not self.square_test_active:
                    break
                time.sleep(1)
    def _zigzag_loop_worker(self):
        commands = [
            "G91",
            "G0 X5", "G0 Y2", "G0 X-5", "G0 Y2",
            "G0 X5", "G0 Y2", "G0 X-5", "G0 Y2",
            "G0 X5", "G0 Y2", "G0 X-5", "G0 Y2",
            "G0 X5", "G0 Y2", "G0 X-5", "G0 Y2",
            "G90"
        ]
        while self.zigzag_test_active:
            for cmd in commands:
                if not self.is_connected:
                    break
                self.publishGCode(cmd)
                
                # Intervalo ultra-rápido de 10ms (0.01s) entre as linhas
                time.sleep(0.01)
            # Aguarda 60 segundos picotados em pedacinhos de 1s para conseguir parar rápido se o usuário desativar
            for _ in range(5):
                if not self.zigzag_test_active:
                    break
                time.sleep(1)
    def _helix_loop_worker(self):
        commands = [
            "G91",                  # Ativa o modo incremental
            "G1 X50 F3500",               # Move para o raio de 50mm (início da hélice a partir do centro)            
            "G2 X0 Y0 Z10 I-50 J0", # 10 voltas (Raio de 50mm -> I=-50, Z sobe 10mm por volta)
            "G2 X0 Y0 Z10 I-50 J0",
            "G2 X0 Y0 Z10 I-50 J0",
            "G2 X0 Y0 Z10 I-50 J0",
            "G2 X0 Y0 Z10 I-50 J0",
            "G2 X0 Y0 Z10 I-50 J0",
            "G2 X0 Y0 Z10 I-50 J0",
            "G2 X0 Y0 Z10 I-50 J0",
            "G2 X0 Y0 Z10 I-50 J0",
            "G2 X0 Y0 Z10 I-50 J0",
            "G1 X-50",              # Retorna do raio para o eixo central X
            "G0 Z-100",             # Desce Z de volta à altura de origem
            "G90"                   # Retorna ao modo absoluto
        ]
        while self.helix_test_active:
            comando_topic = self.topic_entry.get() + "/comandos"
            for cmd in commands:
                if not self.is_connected:
                    break
                
                msg_id = self.proximoId()
                payload = f'{{"id":{msg_id}, "type":"gcode", "data":"{cmd}"}}'
                self.client.publish(comando_topic, payload)
                print(f"[Helicoidal]: {cmd}")
                
                # Intervalo ultra-rápido de 10ms (0.01s) entre as linhas
                time.sleep(0.01)
            # Aguarda 60 segundos picotados em pedacinhos de 1s para conseguir parar rápido se o usuário desativar
            for _ in range(200):
                if not self.helix_test_active:
                    break
                time.sleep(1)
    def _limit_loop_worker(self):
        positions = [
            f"X{X_LIMIT[0]} Y{Y_LIMIT[0]} Z{Z_LIMIT[0]}", # Vai para o canto inferior esquerdo da base, na altura mínima (Z inferior)
            f"X{X_LIMIT[1]} Y{Y_LIMIT[0]}",               # QUADRADO INFERIOR (Z = Z_LIMIT[0]) ---
            f"X{X_LIMIT[1]} Y{Y_LIMIT[1]}",
            f"X{X_LIMIT[0]} Y{Y_LIMIT[1]}",
            f"X{X_LIMIT[0]} Y{Y_LIMIT[0]} Z{Z_LIMIT[1]}",
            f"X{X_LIMIT[1]} Y{Y_LIMIT[0]}",               # QUADRADO SUPERIOR (Z = z_max)
            f"X{X_LIMIT[1]} Y{Y_LIMIT[1]}",
            f"X{X_LIMIT[0]} Y{Y_LIMIT[1]}",
        ]
        while self.limit_test_active:
            for pos in positions:
                if not self.is_connected:
                    break
                self.rapidMoveTo(pos)
                # Intervalo ultra-rápido de 10ms (0.01s) entre as linhas
                time.sleep(0.01)
            # Aguarda 60 segundos picotados em pedacinhos de 1s para conseguir parar rápido se o usuário desativar
            for _ in range(240):
                if not self.limit_test_active:
                    break
                time.sleep(1)

    def create_widgets(self):
        # Notebook Principal (Abas da Aplicação)
        main_notebook = ttk.Notebook(self.root)
        main_notebook.pack(fill="both", expand=True, padx=5, pady=5)

        # Cria as abas principais chamando métodos dedicados
        tab_operacional = ttk.Frame(main_notebook)
        tab_automacao = ttk.Frame(main_notebook)
        
        main_notebook.add(tab_operacional, text=" 🕹️ Operacional ")
        main_notebook.add(tab_automacao, text=" ⚡ Automação & Real-Time ")

        # Monta cada aba separadamente
        self.createTabOperacional(tab_operacional)
        self.createTabAutomacao(tab_automacao)

    def createTabOperacional(self, parent):
        self.createFrameConexao(parent)
        self.createFrameTelemetria(parent)
        self.createFrameJog(parent)
        self.createFrameCustom(parent)
        self.createNotebookLogs(parent)

    def createTabAutomacao(self, parent):
        self.createFrameAtuadores(parent)
        self.createFrameDocas(parent)
        self.createFrameTestes(parent)
        self.createFrameMacros(parent)
        self.createFrameRealtime(parent)

    # --- Sub-métodos modulares para cada bloco ---
    def createFrameConexao(self, parent):
        conn_frame = tk.LabelFrame(parent, text=" Conexão MQTT ", padx=5, pady=2)
        conn_frame.pack(fill="x", padx=5, pady=2)

        tk.Label(conn_frame, text="Broker:").grid(row=0, column=0, sticky="w")
        self.broker_entry = tk.Entry(conn_frame, width=12)
        self.broker_entry.insert(0, DEFAULT_BROKER)
        self.broker_entry.grid(row=0, column=1, padx=2)

        tk.Label(conn_frame, text="Porta:").grid(row=0, column=2, sticky="w")
        self.port_entry = tk.Entry(conn_frame, width=5)
        self.port_entry.insert(0, str(DEFAULT_PORT))
        self.port_entry.grid(row=0, column=3, padx=2)

        self.connect_btn = tk.Button(conn_frame, text="Conectar", command=self.conectarMQTT, bg="#e0e0e0")
        self.connect_btn.grid(row=0, column=4, padx=5)

        self.status_lbl = tk.Label(conn_frame, text="Desconectado", fg="red", font=("Arial", 8, "bold"))
        self.status_lbl.grid(row=0, column=5, padx=5, sticky="w")

        tk.Label(conn_frame, text="Tópico:").grid(row=1, column=0, sticky="w", pady=(2,0))
        self.topic_entry = tk.Entry(conn_frame, width=25)
        self.topic_entry.insert(0, DEFAULT_TOPIC)
        self.topic_entry.grid(row=1, column=1, columnspan=4, sticky="w", pady=(2,0))

    def createFrameTelemetria(self, parent):
        tele_frame = tk.LabelFrame(parent, text=" Telemetria ", padx=5, pady=2)
        tele_frame.pack(fill="x", padx=5, pady=2)

        tk.Label(tele_frame, text="GRBL:", font=("Arial", 8, "bold")).grid(row=0, column=0, sticky="w")
        self.lbl_grbl_state = tk.Label(tele_frame, text="---", fg="blue", font=("Arial", 8))
        self.lbl_grbl_state.grid(row=0, column=1, sticky="w", padx=2)

        tk.Label(tele_frame, text="Pos:", font=("Arial", 8, "bold")).grid(row=0, column=2, sticky="w", padx=(5,0))
        self.lbl_pos = tk.Label(tele_frame, text="X:0 Y:0 Z:0", font=("Consolas", 8, "bold"), fg="#333")
        self.lbl_pos.grid(row=0, column=3, sticky="w", padx=2)

        tk.Label(tele_frame, text="Guichê:", font=("Arial", 8, "bold")).grid(row=1, column=0, sticky="w")
        self.lbl_guiche_state = tk.Label(tele_frame, text="---", fg="blue", font=("Arial", 8))
        self.lbl_guiche_state.grid(row=1, column=1, sticky="w", padx=2)

        tk.Label(tele_frame, text="Buffers:", font=("Arial", 8, "bold")).grid(row=1, column=2, sticky="w", padx=(5,0))
        self.lbl_buffers = tk.Label(tele_frame, text="Grbl: -- | Fila: --", font=("Arial", 8), fg="#555")
        self.lbl_buffers.grid(row=1, column=3, sticky="w", padx=2)
        
        tk.Label(tele_frame, text="Endstops:", font=("Arial", 8, "bold")).grid(row=0, column=4, sticky="w", padx=(5,0))
        self.lbl_endstop = tk.Label(tele_frame, text="---", fg="red", font=("Arial", 8))
        self.lbl_endstop.grid(row=0, column=5, sticky="w", padx=2)

    def createFrameJog(self, parent):
        jog_frame = tk.LabelFrame(parent, text=" Painel de Movimento (Jog) ", padx=5, pady=5)
        jog_frame.pack(fill="x", padx=5, pady=2)
        for c in range(9):
            jog_frame.columnconfigure(c, weight=1)

        tk.Button(jog_frame, text="Home", command=lambda: self.publishRT("HOME_CYCLE")).grid(row=0, column=0, rowspan=2, columnspan=2, padx=1, pady=1, sticky="nsew")

        tk.Button(jog_frame, text="Y+100", command=lambda: self.rapidMoveJog('Y', 1, 100)).grid(row=0, column=3, padx=1, pady=1, sticky="nsew")
        tk.Button(jog_frame, text="Y+10", command=lambda: self.rapidMoveJog('Y', 1, 10)).grid(row=1, column=3, padx=1, pady=1, sticky="nsew")
        tk.Button(jog_frame, text="Y+1", command=lambda: self.rapidMoveJog('Y', 1, 1)).grid(row=2, column=3, padx=1, pady=1, sticky="nsew")
        
        tk.Button(jog_frame, text="X-100", command=lambda: self.rapidMoveJog('X', -1, 100)).grid(row=3, column=0, padx=1, pady=1, sticky="nsew")
        tk.Button(jog_frame, text="X-10", command=lambda: self.rapidMoveJog('X', -1, 10)).grid(row=3, column=1, padx=1, pady=1, sticky="nsew")
        tk.Button(jog_frame, text="X-1", command=lambda: self.rapidMoveJog('X', -1, 1)).grid(row=3, column=2, padx=1, pady=1, sticky="nsew")
        tk.Button(jog_frame, text="X+1", command=lambda: self.rapidMoveJog('X', 1, 1)).grid(row=3, column=4, padx=1, pady=1, sticky="nsew")
        tk.Button(jog_frame, text="X+10", command=lambda: self.rapidMoveJog('X', 1, 10)).grid(row=3, column=5, padx=1, pady=1, sticky="nsew")
        tk.Button(jog_frame, text="X+100", command=lambda: self.rapidMoveJog('X', 1, 100)).grid(row=3, column=6, padx=1, pady=1, sticky="nsew")
        
        tk.Button(jog_frame, text="Y-1", command=lambda: self.rapidMoveJog('Y', -1, 1)).grid(row=4, column=3, padx=1, pady=1, sticky="nsew")
        tk.Button(jog_frame, text="Y-10", command=lambda: self.rapidMoveJog('Y', -1, 10)).grid(row=5, column=3, padx=1, pady=1, sticky="nsew")
        tk.Button(jog_frame, text="Y-100", command=lambda: self.rapidMoveJog('Y', -1, 100)).grid(row=6, column=3, padx=1, pady=1, sticky="nsew")

        z_col = 8
        tk.Button(jog_frame, text="Z+10", command=lambda: self.rapidMoveJog('Z', 1, 10)).grid(row=0, column=z_col, padx=1, pady=1, sticky="nsew")
        tk.Button(jog_frame, text="Z+1", command=lambda: self.rapidMoveJog('Z', 1, 1)).grid(row=1, column=z_col, padx=1, pady=1, sticky="nsew")
        tk.Button(jog_frame, text="Z+0.1", command=lambda: self.rapidMoveJog('Z', 1, 0.1)).grid(row=2, column=z_col, padx=1, pady=1, sticky="nsew")
        tk.Button(jog_frame, text="Z 0", command=lambda: self.rapidMoveTo("Z0")).grid(row=3, column=z_col, padx=1, pady=1, sticky="nsew")
        tk.Button(jog_frame, text="Z-0.1", command=lambda: self.rapidMoveJog('Z', -1, 0.1)).grid(row=4, column=z_col, padx=1, pady=1, sticky="nsew")
        tk.Button(jog_frame, text="Z-1", command=lambda: self.rapidMoveJog('Z', -1, 1)).grid(row=5, column=z_col, padx=1, pady=1, sticky="nsew")
        tk.Button(jog_frame, text="Z-10", command=lambda: self.rapidMoveJog('Z', -1, 10)).grid(row=6, column=z_col, padx=1, pady=1, sticky="nsew")

    def createFrameCustom(self, parent):
        custom_frame = tk.LabelFrame(parent, text=" Comando Personalizado ", padx=5, pady=5)
        custom_frame.pack(fill="x", padx=5, pady=2)

        # Variável para armazenar o tipo selecionado (padrão "gcode")
        self.custom_type_var = tk.StringVar(value="gcode")

        # --- Linha 1: RadioButtons para seleção do tipo ---
        tipo_frame = tk.Frame(custom_frame)
        tipo_frame.pack(fill="x", anchor="w", pady=(0, 5))

        tk.Radiobutton(tipo_frame, text="G-code", variable=self.custom_type_var, value="gcode", command=self.atualizarCamposCustom).pack(side="left", padx=(0, 10))
        tk.Radiobutton(tipo_frame, text="Sync", variable=self.custom_type_var, value="sync", command=self.atualizarCamposCustom).pack(side="left", padx=(0, 10))
        tk.Radiobutton(tipo_frame, text="Tempo Real", variable=self.custom_type_var, value="rt", command=self.atualizarCamposCustom).pack(side="left")

        # --- Linha 2: Entradas para Data, Value e Payload ---
        inputs_frame = tk.Frame(custom_frame)
        inputs_frame.pack(fill="x", expand=True)

        inputs_frame.grid_columnconfigure(0, weight=2)  # Data
        inputs_frame.grid_columnconfigure(1, weight=1)  # Value
        inputs_frame.grid_columnconfigure(2, weight=4)  # Payload (maior)

        self.custom_data_entry = tk.Entry(inputs_frame, font=("Consolas", 9))
        self.custom_value_entry = tk.Entry(inputs_frame, font=("Consolas", 9))
        self.custom_payload_entry = tk.Entry(inputs_frame, font=("Consolas", 9))

        # Posicionamento com Grid
        self.custom_data_entry.grid(row=0, column=0, sticky="ew", padx=(0, 3), pady=2)
        self.custom_value_entry.grid(row=0, column=1, sticky="ew", padx=3, pady=2)
        self.custom_payload_entry.grid(row=0, column=2, sticky="ew", padx=3, pady=2)

        # Botão Enviar
        tk.Button(inputs_frame, text="Enviar", width=8, bg="#e0e0e0", command=self.enviarCustomizado).grid(row=0, column=3, padx=(5, 0), pady=2)

        # Atalho de Enter em qualquer campo
        for entry in (self.custom_data_entry, self.custom_value_entry, self.custom_payload_entry):
            entry.bind("<Return>", lambda e: self.enviarCustomizado())

        # Atualiza o estado inicial dos campos com base no padrão (gcode)
        self.atualizarCamposCustom()

    def createFrameAtuadores(self, parent):
        frame_atuadores = tk.LabelFrame(parent, text="Acessórios", padx=5, pady=2)
        frame_atuadores.pack(padx=5, pady=2, fill="x")

        frame_modo = tk.Frame(frame_atuadores)
        frame_modo.grid(row=0, column=0, columnspan=4, sticky="w", pady=(0, 2))
        tk.Label(frame_modo, text="Modo: ").pack(side=tk.LEFT)
        tk.Radiobutton(frame_modo, text="Real-time", variable=self.modo_comando, value="rt").pack(side=tk.LEFT, padx=5)
        tk.Radiobutton(frame_modo, text="Sync", variable=self.modo_comando, value="sync").pack(side=tk.LEFT, padx=5)

        for i in range(4):
            linha = (i // 2) + 1
            coluna = i % 2

            atuador_frame = tk.Frame(frame_atuadores, relief="groove", bd=1, padx=2, pady=2)
            atuador_frame.grid(row=linha, column=coluna, padx=3, pady=3, sticky="nsew")

            btn = tk.Label(atuador_frame, text=f"Acessório {i}\n", bg="#d9d9d9", fg="black", relief="raised", bd=2, padx=2, pady=1)
            btn.bind("<Button-1>", lambda e, idx=i: self.toggle_atuador(idx))
            btn.grid(row=0, column=0, padx=2, pady=2, sticky="nsew")

            # Slider (Scale) para o PWM de 0 a 255
            pwm = tk.Scale(
                atuador_frame, 
                from_=0, 
                to=255, 
                orient="horizontal", 
                length=150,
                label="PWM:"
            )
            pwm.set(1024)  # Valor inicial
            pwm.grid(row=1, column=0, sticky="ew", padx=2, pady=2)

            # Armazena as referências
            self.atuador[i] = {
                "estado": 0, 
                "botao": btn, 
                "pwm": pwm
            }

    def createFrameDocas(self, parent):
        frame_docas = tk.LabelFrame(parent, text="Docas", padx=5, pady=2)
        frame_docas.pack(padx=5, pady=2, fill="x")

        for i in range(4):
            doca_frame = tk.Frame(frame_docas, relief="groove", bd=1, padx=2, pady=2)
            doca_frame.pack(fill="x", padx=2, pady=2)
            tk.Button(doca_frame, text=f"Pegar {i}", command=lambda: self.publishRT("PICK", i)).grid(row=0, column=0, padx=5, pady=2, sticky="nsew")
            tk.Button(doca_frame, text=f"Soltar {i}", command=lambda: self.publishRT("DROP", i)).grid(row=0, column=1, padx=5, pady=2, sticky="nsew")
            tk.Button(doca_frame, text=f"Salvar {i}", command=lambda: self.publishRT("SET DOCK", i)).grid(row=0, column=2, padx=5, pady=2, sticky="nsew")

    def createFrameMacros(self, parent):
        rt_frame = tk.LabelFrame(parent, text=" Macros", padx=5, pady=5)
        rt_frame.pack(fill="x", padx=5, pady=5)
        
        tk.Button(rt_frame, text="Lava HotWheels", command=lambda: self.rodarMacro("lava_hotwheels")).grid(row=0, column=0, padx=5, pady=2, sticky="nsew")
        tk.Button(rt_frame, text="Lava MonsterTruck", command=lambda: self.rodarMacro("lava_monstertruck")).grid(row=0, column=1, padx=5, pady=2, sticky="nsew")
        tk.Button(rt_frame, text="Roça 300x300", command=lambda: self.rodarMacro("roca_300")).grid(row=0, column=2, padx=5, pady=2, sticky="nsew")
        tk.Button(rt_frame, text="Rega 300x300", command=lambda: self.rodarMacro("rega_300")).grid(row=0, column=3, padx=5, pady=2, sticky="nsew")

    def createFrameTestes(self, parent):
        test_frame = tk.LabelFrame(parent, text=" Testes Automatizados ", padx=5, pady=5)
        test_frame.pack(fill="x", padx=5, pady=5)

        self.randomTestBtn = tk.Label(test_frame, text="Aleatório", bg="#d9d9d9", relief="raised", bd=2, padx=5, pady=2)
        self.randomTestBtn.bind("<Button-1>", lambda e: self.toggle_random_test())
        self.randomTestBtn.grid(row=0, column=0, padx=2, pady=2, sticky="nsew")

        self.squareTestBtn = tk.Label(test_frame, text="Quadrado", bg="#d9d9d9", relief="raised", bd=2, padx=5, pady=2)
        self.squareTestBtn.bind("<Button-1>", lambda e: self.toggle_square_test())
        self.squareTestBtn.grid(row=0, column=1, padx=2, pady=2, sticky="nsew")

        self.zigzagTestBtn = tk.Label(test_frame, text="Zigzag", bg="#d9d9d9", relief="raised", bd=2, padx=5, pady=2)
        self.zigzagTestBtn.bind("<Button-1>", lambda e: self.toggle_zigzag_test())
        self.zigzagTestBtn.grid(row=0, column=2, padx=2, pady=2, sticky="nsew")

        self.helixTestBtn = tk.Label(test_frame, text="Helicoidal", bg="#d9d9d9", relief="raised", bd=2, padx=5, pady=2)
        self.helixTestBtn.bind("<Button-1>", lambda e: self.toggle_helix_test())
        self.helixTestBtn.grid(row=0, column=3, padx=2, pady=2, sticky="nsew")

        self.limitTestBtn = tk.Label(test_frame, text="Limites", bg="#d9d9d9", relief="raised", bd=2, padx=5, pady=2)
        self.limitTestBtn.bind("<Button-1>", lambda e: self.toggle_limit_test())
        self.limitTestBtn.grid(row=0, column=4, padx=2, pady=2, sticky="nsew")

    def createFrameRealtime(self, parent):
        rt_frame = tk.LabelFrame(parent, text=" Comandos em Tempo Real", padx=5, pady=5)
        rt_frame.pack(fill="x", padx=5, pady=5)
        
        tk.Button(rt_frame, text="Pausar motores", command=lambda: self.publishRT("HOLD")).grid(row=0, column=0, padx=5, pady=2, sticky="nsew")
        tk.Button(rt_frame, text="Continuar motores", command=lambda: self.publishRT("CYCLE")).grid(row=0, column=1, padx=5, pady=2, sticky="nsew")
        tk.Button(rt_frame, text="Abortar motores", command=lambda: self.publishRT("ABORT")).grid(row=0, column=2, padx=5, pady=2, sticky="nsew")
        tk.Button(rt_frame, text="Resetar motores", command=lambda: self.publishRT("RESET")).grid(row=0, column=3, padx=5, pady=2, sticky="nsew")
        tk.Button(rt_frame, text="Destravar motores", command=lambda: self.publishRT("UNLOCK", 0, "GRBL")).grid(row=1, column=0, padx=5, pady=2, sticky="nsew")
        tk.Button(rt_frame, text="Destravar robô", command=lambda: self.publishRT("UNLOCK", 0, "XYLEMA")).grid(row=1, column=1, padx=5, pady=2, sticky="nsew")
        tk.Button(rt_frame, text="Salvar estacionamento", command=lambda: self.publishRT("SET PARK")).grid(row=1, column=2, padx=5, pady=2, sticky="nsew")
        tk.Button(rt_frame, text="Estacionar", command=lambda: self.publishRT("PARK")).grid(row=1, column=3, padx=5, pady=2, sticky="nsew")

    def createNotebookLogs(self, parent):
        log_notebook = ttk.Notebook(parent)
        log_notebook.pack(fill="both", expand=True, padx=5, pady=5)

        tab_acks = ttk.Frame(log_notebook)
        log_notebook.add(tab_acks, text=" Monitor de ACKs ")
        self.log_ack_box = tk.Text(tab_acks, height=8, bg="#1e1e1e", fg="#00ff00", font=("Consolas", 8))
        self.log_ack_box.pack(fill="both", expand=True)

        tab_eventos = ttk.Frame(log_notebook)
        log_notebook.add(tab_eventos, text=" Eventos e Alertas ")
        self.log_evento_box = tk.Text(tab_eventos, height=8, bg="#1e1e1e", fg="#ffcc00", font=("Consolas", 8))
        self.log_evento_box.pack(fill="both", expand=True)

if __name__ == "__main__":
    root = tk.Tk()
    app = CNCJogApp(root)
    root.mainloop()