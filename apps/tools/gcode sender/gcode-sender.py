import tkinter as tk
from tkinter import messagebox
from tkinter import ttk
import paho.mqtt.client as mqtt
import time
import threading
import random
import datetime


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

        # Cliente MQTT
        self.client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.is_connected = False

        # Dicionário para rastrear o estado de cada acessório (False = Desligado, True = Ligado)
        self.estados_acessorios = {}

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
        posicao = grbl.get("posicao", "0,0,0")
        grbl_disp = grbl.get("disponivel", "--")
        fila_disp = fila.get("disponivel", "--")
        endstop = grbl.get("endstops", "--")

        # Atualiza os textos na interface
        info_grbl = GRBL_ESTADOS.get(grbl_state, {"texto": f"Outro ({grbl_state})", "cor": "black"})
        self.lbl_grbl_state.config(text=info_grbl["texto"], fg=info_grbl["cor"])
        self.lbl_pos.config(text=f"[{posicao}]")
        info_guiche = XYLEMA_ESTADOS.get(guiche_state, {"texto": f"Outro ({grbl_state})", "cor": "black"})
        self.lbl_guiche_state.config(text=info_guiche["texto"], fg=info_guiche["cor"])
        self.lbl_buffers.config(text=f"Grbl: {grbl_disp} instruções | Fila: {fila_disp} instruções")
        self.lbl_endstop.config(text=f"{endstop}", fg="red")

        # Atualiza os acessórios na interface
        for i in range(8):
            estado_bool = acessorios_data.get(str(i), acessorios_data.get(i, False))
            
            if i in self.estados_acessorios:
                self.estados_acessorios[i]["estado"] = estado_bool
                info = self.estados_acessorios.get(i)
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
        # Monta o G-code (Modo incremental G91, move, volta para absoluto G90)
        gcode = f'{{"id":{msg_id}, "type":"gcode", "data":"G91\\nG0 {axis}{direction * step}\\nG90"}}'

        comando_topic = self.topic_entry.get() + "/comandos"
        self.client.publish(comando_topic, gcode)
        print(f"Enviado [{msg_id}] para [{comando_topic}]: {gcode.replace(chr(10), ' | ')}")
    def rapidMoveTo(self, position):
        if not self.is_connected:
            messagebox.showwarning("Aviso", "Não conectado ao broker MQTT!")
            return

        msg_id = self.proximoId()
        # Monta o G-code (Modo Absoluto G90)
        gcode = f'{{"id":{msg_id}, "type":"gcode", "data":"G90\\nG0 {position}"}}'

        comando_topic = self.topic_entry.get() + "/comandos"
        self.client.publish(comando_topic, gcode)
        print(f"Enviado [{msg_id}] para [{comando_topic}]: {gcode.replace(chr(10), ' | ')}")
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

    
    def customGcode(self, event=None):
        if not self.is_connected:
            messagebox.showwarning("Aviso", "Não conectado ao broker MQTT!")
            return

        gcode_text = self.custom_gcode_entry.get().strip()
        if not gcode_text:
            return

        self.publishGCode(gcode_text)
        
        # Limpa o campo após o envio
        self.custom_gcode_entry.delete(0, tk.END)

    def rodarTeste(self, tipoTeste):
        if not self.is_connected:
            messagebox.showwarning("Aviso", "Não conectado ao broker MQTT!")
            return

        # Roda em background (Thread) para disparar a rajada sem travar a interface
        threading.Thread(target=self._stress_worker, args=(tipoTeste,), daemon=True).start()

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


    def toggle_acessorio(self, index):
        modo = self.modo_comando.get()
        # Inverte o estado atual local apenas para saber qual comando enviar, 
        # mas sem mexer no visual do botão agora (deixa isso para o update_telemetry)
        info = self.estados_acessorios[index]
        novo_estado = not info["estado"]
        
        # Define o valor textual esperado pelo robô
        acao_payload = info["pwm"].get() if novo_estado else "OFF"
        
        # Monta o payload JSON no novo formato solicitado
        msg_id = self.proximoId()
        sync = f'{{"id":{msg_id}, "type":"{modo}", "data":"SET", "value": {index}, "payload": "{acao_payload}"}}'
        
        # Envia via MQTT
        comando_topic = self.topic_entry.get() + "/comandos"
        self.client.publish(comando_topic, sync)
        print(f"Enviando MQTT -> Tópico: {comando_topic} | {sync}")
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
            for _ in range(15):
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
            comando_topic = self.topic_entry.get() + "/comandos"
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
        # Frame de Conexão
        conn_frame = tk.LabelFrame(self.root, text=" Configuração MQTT ", padx=10, pady=10)
        conn_frame.pack(fill="x", padx=10, pady=10)

        tk.Label(conn_frame, text="Broker:").grid(row=0, column=0, sticky="w")
        self.broker_entry = tk.Entry(conn_frame, width=15)
        self.broker_entry.insert(0, DEFAULT_BROKER)
        self.broker_entry.grid(row=0, column=1, padx=5)

        tk.Label(conn_frame, text="Porta:").grid(row=0, column=2, sticky="w")
        self.port_entry = tk.Entry(conn_frame, width=6)
        self.port_entry.insert(0, str(DEFAULT_PORT))
        self.port_entry.grid(row=0, column=3, padx=5)

        self.connect_btn = tk.Button(conn_frame, text="Conectar", command=self.conectarMQTT, bg="#e0e0e0")
        self.connect_btn.grid(row=0, column=4, padx=5)

        self.status_lbl = tk.Label(conn_frame, text="Status: Desconectado", fg="red")
        self.status_lbl.grid(row=1, column=0, columnspan=5, sticky="w", pady=(5,0))

        tk.Label(conn_frame, text="Tópico:").grid(row=2, column=0, sticky="w", pady=(5,0))
        self.topic_entry = tk.Entry(conn_frame, width=30)
        self.topic_entry.insert(0, DEFAULT_TOPIC)
        self.topic_entry.grid(row=2, column=1, columnspan=4, sticky="w", pady=(5,0))

        # --- Painel de Telemetria / Estado do Robô ---
        tele_frame = tk.LabelFrame(self.root, text="Telemetria", padx=10, pady=5)
        tele_frame.pack(fill="x", padx=10, pady=(0, 10))

        # Grid de Status
        tk.Label(tele_frame, text="Estado GRBL:", font=("Arial", 9, "bold")).grid(row=0, column=0, sticky="w")
        self.lbl_grbl_state = tk.Label(tele_frame, text="---", fg="blue", font=("Arial", 9))
        self.lbl_grbl_state.grid(row=0, column=1, sticky="w", padx=5)

        tk.Label(tele_frame, text="Posição Atual (XYZ):", font=("Arial", 9, "bold")).grid(row=0, column=2, sticky="w", padx=(15, 0))
        self.lbl_pos = tk.Label(tele_frame, text="X:0.00 Y:0.00 Z:0.00", font=("Consolas", 9, "bold"), fg="#333")
        self.lbl_pos.grid(row=0, column=3, sticky="w", padx=5)

        tk.Label(tele_frame, text="Endstops GRBL:", font=("Arial", 9, "bold")).grid(row=0, column=4, sticky="w")
        self.lbl_endstop = tk.Label(tele_frame, text="---", fg="red", font=("Arial", 9))
        self.lbl_endstop.grid(row=0, column=5, sticky="w", padx=5)

        tk.Label(tele_frame, text="Estado Guichê:", font=("Arial", 9, "bold")).grid(row=1, column=0, sticky="w")
        self.lbl_guiche_state = tk.Label(tele_frame, text="---", fg="blue", font=("Arial", 9))
        self.lbl_guiche_state.grid(row=1, column=1, sticky="w", padx=5, pady=5)

        tk.Label(tele_frame, text="Disp buffers (Serial/Fila):", font=("Arial", 9, "bold")).grid(row=1, column=2, sticky="w", pady=(5,0))
        self.lbl_buffers = tk.Label(tele_frame, text="Grbl: -- | Fila: --", font=("Arial", 9), fg="#555")
        self.lbl_buffers.grid(row=1, column=3, columnspan=3, sticky="w", padx=5, pady=(5,0))

        # Jog Pad
        jog_frame = tk.LabelFrame(self.root, text=" Painel de Movimento (Jog) ", padx=10, pady=15)
        jog_frame.pack(fill="both", expand=True, padx=10, pady=15)
        for c in range(9):
            jog_frame.columnconfigure(c, weight=1)
        for r in range(7):
            jog_frame.rowconfigure(r, weight=1)

        tk.Button(
            jog_frame, 
            text="Home",
            command=lambda: self.publishGCode("$H")
        ).grid(row=0, column=0, rowspan=2, columnspan=2, padx=5, pady=5, sticky="nsew")

        # Y +
        tk.Button(
            jog_frame,
            text="Y+100",
            command=lambda: self.rapidMoveJog('Y', 1, 100)
        ).grid(row=0, column=3, padx=5, pady=5, sticky="nsew")

        tk.Button(
            jog_frame,
            text="Y+ 10",
            command=lambda: self.rapidMoveJog('Y', 1, 10)
        ).grid(row=1, column=3, padx=5, pady=5, sticky="nsew")

        tk.Button(
            jog_frame,
            text="Y+  1",
            command=lambda: self.rapidMoveJog('Y', 1, 1)
        ).grid(row=2, column=3, padx=5, pady=5, sticky="nsew")
        
        # X
        tk.Button(
            jog_frame,
            text="X-100",
            command=lambda: self.rapidMoveJog('X', -1, 100)
        ).grid(row=3, column=0, padx=5, pady=5, sticky="nsew")
        tk.Button(
            jog_frame,
            text="X- 10", 
            command=lambda: self.rapidMoveJog('X', -1, 10)
        ).grid(row=3, column=1, padx=5, pady=5, sticky="nsew")
        tk.Button(
            jog_frame,
            text="X-  1", 
            command=lambda: self.rapidMoveJog('X', -1, 1)
        ).grid(row=3, column=2, padx=5, pady=5, sticky="nsew")
        tk.Button(
            jog_frame,
            text="XY 0", 
            #command=lambda: self.send_command('X', -1, 1)
        ).grid(row=3, column=3, padx=5, pady=5, sticky="nsew")
        tk.Button(
            jog_frame,
            text="X+  1", 
            command=lambda: self.rapidMoveJog('X', 1, 1)
        ).grid(row=3, column=4, padx=5, pady=5, sticky="nsew")
        tk.Button(
            jog_frame,
            text="X+ 10", 
            command=lambda: self.rapidMoveJog('X', 1, 10)
        ).grid(row=3, column=5, padx=5, pady=5, sticky="nsew")
        tk.Button(
            jog_frame,
            text="X+100",
            command=lambda: self.rapidMoveJog('X', 1, 100)
        ).grid(row=3, column=6, padx=5, pady=5, sticky="nsew")
        
        # Y -
        tk.Button(
            jog_frame,
            text="Y-  1",
            command=lambda: self.rapidMoveJog('Y', -1, 1)
        ).grid(row=4, column=3, padx=5, pady=5, sticky="nsew")        # --- EIXO Z (Isolado à Direita com 7 botões) ---
        tk.Button(
            jog_frame,
            text="Y- 10",
            command=lambda: self.rapidMoveJog('Y', -1, 10)
        ).grid(row=5, column=3, padx=5, pady=5, sticky="nsew")
        tk.Button(
            jog_frame,
            text="Y-100",
            command=lambda: self.rapidMoveJog('Y', -1, 100)
        ).grid(row=6, column=3, padx=5, pady=5, sticky="nsew")

        z_col = 8  # Coluna separada à direita
        tk.Button(
            jog_frame,
            text="Z+ 10",
            command=lambda: self.rapidMoveJog('Z', 1, 10)
        ).grid(row=0, column=z_col, padx=(15, 2), pady=5, sticky="nsew")
        tk.Button(
            jog_frame,
            text="Z+  1",
            command=lambda: self.rapidMoveJog('Z', 1, 1)
        ).grid(row=1, column=z_col, padx=(15, 2), pady=5, sticky="nsew")
        tk.Button(
            jog_frame,
            text="Z+0.1",
            command=lambda: self.rapidMoveJog('Z', 1, 0.1)
        ).grid(row=2, column=z_col, padx=(15, 2), pady=5, sticky="nsew")
        tk.Button(
            jog_frame,
            text="Z 0", 
            #command=lambda: self.send_command('X', -1, 1)
        ).grid(row=3, column=z_col, padx=5, pady=5, sticky="nsew")
        tk.Button(
            jog_frame,
            text="Z-0.1",
            command=lambda: self.rapidMoveJog('Z', -1, 0.1)
        ).grid(row=4, column=z_col, padx=(15, 2), pady=5, sticky="nsew")
        tk.Button(
            jog_frame,
            text="Z-  1",
            command=lambda: self.rapidMoveJog('Z', -1, 1)
        ).grid(row=5, column=z_col, padx=(15, 2), pady=5, sticky="nsew")
        tk.Button(
            jog_frame,
            text="Z- 10",
            command=lambda: self.rapidMoveJog('Z', -1, 10)
        ).grid(row=6, column=z_col, padx=(15, 2), pady=5, sticky="nsew")

        # --- Campo de G-code Personalizado ---
        gcode_frame = tk.LabelFrame(self.root, text=" G-code Personalizado ", padx=10, pady=5)
        gcode_frame.pack(fill="x", padx=10, pady=(0, 10))

        self.custom_gcode_entry = tk.Entry(gcode_frame, font=("Consolas", 10))
        self.custom_gcode_entry.pack(side="left", fill="x", expand=True, padx=(0, 5))
        # Permite enviar apertando a tecla Enter
        self.custom_gcode_entry.bind("<Return>", self.customGcode)

        self.send_gcode_btn = tk.Button(gcode_frame, text="Enviar", width=8, bg="#e0e0e0", command=self.customGcode)
        self.send_gcode_btn.pack(side="right")

        # Frame principal para organizar os botões em uma grade (2 linhas x 4 colunas ou ajuste livre)
        frame_accessories = tk.LabelFrame(root, text="Acessórios", padx=10, pady=10)
        frame_accessories.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)

        # --- SELETOR DE MODO (Sync / Real-time) ---
        frame_modo = tk.Frame(frame_accessories)
        frame_modo.grid(row=0, column=0, columnspan=4, sticky="w", pady=(0, 10))
        tk.Label(frame_modo, text="Modo: ").pack(side=tk.LEFT)
        tk.Radiobutton(frame_modo, text="Sync", variable=self.modo_comando, value="sync").pack(side=tk.LEFT, padx=5)
        tk.Radiobutton(frame_modo, text="Real-time", variable=self.modo_comando, value="rt").pack(side=tk.LEFT, padx=5)

        self.estados_acessorios = {}
        for i in range(8):  # Índices de 0 a 7
            linha = (i // 4) + 1
            coluna = i % 4
            
            btn = tk.Label(
                frame_accessories, 
                text=f"Acessório {i}\n", 
                bg="#d9d9d9", 
                fg="black",
                relief="raised",
                bd=2,
                padx=10, pady=5
            )
            # Para simular o clique:
            btn.bind("<Button-1>", lambda e, idx=i: self.toggle_acessorio(idx))
            
            btn.grid(row=linha, column=coluna, padx=5, pady=5, sticky="nsew")
            
            # Salvamos a referência do botão no dicionário
            self.estados_acessorios[i] = {
                "estado": False,
                "botao": btn
            }

            for c in range(4):
                frame_accessories.columnconfigure(c, weight=1)
        
        # Frame de Testes
        test_frame = tk.LabelFrame(self.root, text="Testes", padx=10, pady=10)
        test_frame.pack(fill="both", expand=True, padx=10, pady=15)
        for c in range(6):
            test_frame.columnconfigure(c, weight=1)

        # --- Botões de Teste ---
        # Movimento aleatório (60s):
        self.randomTestBtn = tk.Label(
            test_frame, 
            text=f"Aleatório\n", 
            bg="#d9d9d9", 
            fg="black",
            relief="raised",
            bd=2,
            padx=10, pady=5
        )
        self.randomTestBtn.bind("<Button-1>", lambda e:self.toggle_random_test())
        self.randomTestBtn.grid(row=1, column=0, padx=(15,2), pady=2, sticky="nsew")

        # Movimento quadrado (15s):
        self.squareTestBtn = tk.Label(
            test_frame, 
            text=f"Quadrado\n", 
            bg="#d9d9d9", 
            fg="black",
            relief="raised",
            bd=2,
            padx=10, pady=5
        )
        self.squareTestBtn.bind("<Button-1>", lambda e:self.toggle_square_test())
        self.squareTestBtn.grid(row=1, column=1, padx=(15,2), pady=2, sticky="nsew")

        # Movimento zigzag (15s):
        self.zigzagTestBtn = tk.Label(
            test_frame, 
            text=f"Zigzag\n", 
            bg="#d9d9d9", 
            fg="black",
            relief="raised",
            bd=2,
            padx=10, pady=5
        )
        self.zigzagTestBtn.bind("<Button-1>", lambda e:self.toggle_zigzag_test())
        self.zigzagTestBtn.grid(row=1, column=2, padx=(15,2), pady=2, sticky="nsew")

        # Movimento helicoidal (60s):
        self.helixTestBtn = tk.Label(
            test_frame, 
            text=f"Helicoidal\n", 
            bg="#d9d9d9", 
            fg="black",
            relief="raised",
            bd=2,
            padx=10, pady=5
        )
        self.helixTestBtn.bind("<Button-1>", lambda e:self.toggle_helix_test())
        self.helixTestBtn.grid(row=1, column=3, padx=(15,2), pady=2, sticky="nsew")

        # Movimento limites (90s):
        self.limitTestBtn = tk.Label(
            test_frame, 
            text=f"Limites\n", 
            bg="#d9d9d9", 
            fg="black",
            relief="raised",
            bd=2,
            padx=10, pady=5
        )
        self.limitTestBtn.bind("<Button-1>", lambda e:self.toggle_limit_test())
        self.limitTestBtn.grid(row=1, column=4, padx=(15,2), pady=2, sticky="nsew")

        # --- Painel com Abas para Monitoramento (ACKs e Eventos) ---
        notebook_frame = ttk.Notebook(self.root)
        notebook_frame.pack(fill="both", expand=True, padx=15, pady=(0, 10))

        # --- Aba 1: ACKs e Respostas ---
        tab_acks = ttk.Frame(notebook_frame)
        notebook_frame.add(tab_acks, text=" Monitor de ACKs ")

        ack_frame = tk.Frame(tab_acks, padx=5, pady=5)
        ack_frame.pack(fill="both", expand=True)

        self.log_ack_box = tk.Text(ack_frame, height=6, bg="#1e1e1e", fg="#00ff00", font=("Consolas", 9))
        self.log_ack_box.pack(side="left", fill="both", expand=True)

        scrollbar_ack = tk.Scrollbar(ack_frame, command=self.log_ack_box.yview)
        scrollbar_ack.pack(side="right", fill="y")
        self.log_ack_box.config(yscrollcommand=scrollbar_ack.set)

        # --- Aba 2: Eventos e Alertas ---
        tab_eventos = ttk.Frame(notebook_frame)
        notebook_frame.add(tab_eventos, text=" Eventos e Alertas ")

        evento_frame = tk.Frame(tab_eventos, padx=5, pady=5)
        evento_frame.pack(fill="both", expand=True)

        self.log_evento_box = tk.Text(evento_frame, height=6, bg="#1e1e1e", fg="#ffcc00", font=("Consolas", 9))  # Texto amarelinho para destacar eventos
        self.log_evento_box.pack(side="left", fill="both", expand=True)

        scrollbar_evento = tk.Scrollbar(evento_frame, command=self.log_evento_box.yview)
        scrollbar_evento.pack(side="right", fill="y")
        self.log_evento_box.config(yscrollcommand=scrollbar_evento.set)

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
        self.createFrameGCode(parent)
        self.createNotebookLogs(parent)

    def createTabAutomacao(self, parent):
        self.createFrameAcessorios(parent)
        self.createFrameTestes(parent)
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

        tk.Button(jog_frame, text="Home", command=lambda: self.publishGCode("$H")).grid(row=0, column=0, rowspan=2, columnspan=2, padx=1, pady=1, sticky="nsew")

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

    def createFrameGCode(self, parent):
        gcode_frame = tk.LabelFrame(parent, text=" G-code Personalizado ", padx=5, pady=2)
        gcode_frame.pack(fill="x", padx=5, pady=2)
        self.custom_gcode_entry = tk.Entry(gcode_frame, font=("Consolas", 9))
        self.custom_gcode_entry.pack(side="left", fill="x", expand=True, padx=(0, 5))
        self.custom_gcode_entry.bind("<Return>", self.customGcode)
        tk.Button(gcode_frame, text="Enviar", width=8, bg="#e0e0e0", command=self.customGcode).pack(side="right")

    def createFrameAcessorios(self, parent):
        frame_accessories = tk.LabelFrame(parent, text="Acessórios", padx=5, pady=2)
        frame_accessories.pack(padx=5, pady=2, fill="x")

        frame_modo = tk.Frame(frame_accessories)
        frame_modo.grid(row=0, column=0, columnspan=4, sticky="w", pady=(0, 2))
        tk.Label(frame_modo, text="Modo: ").pack(side=tk.LEFT)
        tk.Radiobutton(frame_modo, text="Sync", variable=self.modo_comando, value="sync").pack(side=tk.LEFT, padx=5)
        tk.Radiobutton(frame_modo, text="Real-time", variable=self.modo_comando, value="rt").pack(side=tk.LEFT, padx=5)

        for i in range(8):
            linha = (i // 4) + 1
            coluna = i % 4

            acc_frame = tk.Frame(frame_accessories, relief="groove", bd=1, padx=2, pady=2)
            acc_frame.grid(row=linha, column=coluna, padx=3, pady=3, sticky="nsew")

            btn = tk.Label(acc_frame, text=f"Acessório {i}\n", bg="#d9d9d9", fg="black", relief="raised", bd=2, padx=2, pady=1)
            btn.bind("<Button-1>", lambda e, idx=i: self.toggle_acessorio(idx))
            btn.grid(row=0, column=0, padx=2, pady=2, sticky="nsew")

            # Slider (Scale) para o PWM de 0 a 255
            pwm = tk.Scale(
                acc_frame, 
                from_=0, 
                to=255, 
                orient="horizontal", 
                length=150,
                label="PWM:"
            )
            pwm.set(1024)  # Valor inicial
            pwm.grid(row=1, column=0, sticky="ew", padx=2, pady=2)

            # Armazena as referências
            self.estados_acessorios[i] = {
                "estado": False, 
                "botao": btn, 
                "pwm": pwm
            }

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
        
        tk.Button(rt_frame, text="Feed Hold (!)", bg="#ff9800", fg="white", font=("Arial", 9, "bold"),
                  command=lambda: self.client.publish(self.topic_entry.get() + "/comandos", '{"type":"rt","data":"!"}')).grid(row=0, column=0, padx=5, pady=2, sticky="nsew")
        
        tk.Button(rt_frame, text="Cycle Resume (~)", bg="#4caf50", fg="white", font=("Arial", 9, "bold"),
                  command=lambda: self.client.publish(self.topic_entry.get() + "/comandos", '{"type":"rt","data":"~"}')).grid(row=0, column=1, padx=5, pady=2, sticky="nsew")
        
        tk.Button(rt_frame, text="Soft Reset (^X)", bg="#f44336", fg="white", font=("Arial", 9, "bold"),
                  command=lambda: self.client.publish(self.topic_entry.get() + "/comandos", '{"type":"rt","data":"\x18"}')).grid(row=0, column=2, padx=5, pady=2, sticky="nsew")

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