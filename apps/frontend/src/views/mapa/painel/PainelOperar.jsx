import { useEffect, useState, useRef } from "react";
import { StandardInput } from "../../../utils/formUtils";
import { Button, Form } from "react-bootstrap";
import { useAuth } from "../../../services/auth/authContext";
import { ISOToReadableString, toDateTimeLocal } from "../../../utils/dateUtils";
import { VARIANTE } from "micro-agricultor";
import { useCache } from "../../../hooks/useCache";
import { useToast } from "../../../services/toast/toastProvider";
import { resolvePrimarySelection, resolveSelection } from "../../../utils/catalogUtils";
import { pluralizar } from "../../../utils/uiUtils";
import { useMapaEngine } from "../MapaEngine";
import Loading from "../../../components/Loading";

export default function PainelOperar({ show, onCancel }) {
  if (!show) return null;

  const { user } = useAuth();
  const { setShowPainel, selection, setActiveTool } = useMapaEngine();
  const { toastMessage } = useToast();
  const { cacheEntidades, reading } = useCache(["entidades"]);

  const [primaryType, setPrimaryType] = useState(selection?.primaryType() || "");
  const [customCode, setCustomCode] = useState("");
  const [writing, setWriting] = useState(false);


  useEffect(() => {
    if (selection) {
      setPrimaryType(selection.primaryType());
    }
  }, [selection]);

  const list = selection ? resolveSelection(selection, primaryType, cacheEntidades?.[primaryType]) : [];
  const last = resolvePrimarySelection(selection, cacheEntidades);

  const adicionarLog = (msg) => {
    setLogsConsole((prev) => [...prev.slice(-50), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const enviarCustomCode = (cmd) => {
    adicionarLog(`> ${cmd}`);
    // Integração com bridge MQTT ou endpoint de controle CNC
    setTimeout(() => {
      adicionarLog(`ok`);
    }, 150);
  };

  const executarAcaoRobo = async (acaoNome, comandoGcode) => {
    setWriting(true);
    try {
      const date = new Date(stringTimestamp);
      const timestamp = date.getTime();

      enviarCustomCode(comandoGcode);

      toastMessage({
        body: `Ação "${acaoNome}" executada com sucesso para ${list.length} ${pluralizar(list.length, primaryType || "alvo")}.`,
        variant: VARIANTE.GREEN.variant,
      });
      setShowPainel(false);
    } catch (err) {
      console.error(err);
      toastMessage({
        body: `Erro ao executar comando no robô.`,
        variant: VARIANTE.RED.variant,
      });
    } finally {
      setWriting(false);
    }
  };

  const acoes = [
    {label: "🏠 Home ($H)", onClick: () => enviarCustomCode("$H"), variant: VARIANTE.LIGHTBLUE.variant},
    {label: "Encerrar operação", onClick: () => setActiveTool(""), variant: VARIANTE.RED.variant},
  ]
  if (reading) return <Loading variant="overlay" />;

  return (
    <div className="p-3">
      {/* Console Serial / G-code */}
      <div className="mb-3">
        <Form.Control
          type="text"
          size="sm"
          placeholder="Enviar comando customizado (ex: G1 X10 F500)..."
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && customCode.trim()) {
              enviarCustomCode(customCode);
              setCustomCode("");
            }
          }}
        />
      </div>

      <div className="d-grid gap-2">
      {acoes.map((acao)=>
        <Button
          variant={`outline-${acao.variant}`}
          size="sm"
          disabled={writing}
          onClick={acao.onClick}
        >
          {acao.label}
        </Button>
      )}
      </div>
    </div>
  );
}