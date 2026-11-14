import { useEffect, useState, useRef } from "react";
import { StandardInput } from "../../../utils/formUtils";
import { Button, Form } from "react-bootstrap";
import { useAuth } from "../../../services/auth/authContext";
import { ISOToReadableString, toDateTimeLocal } from "../../../utils/dateUtils";
import { criarTarefaParaDispositivo, DISPOSITIVO, ENTIDADE, VARIANTE } from "micro-agricultor";
import { useCache } from "../../../hooks/useCache";
import { useToast } from "../../../services/toast/toastProvider";
import { resolvePrimarySelection, resolveSelection } from "../../../utils/catalogUtils";
import { pluralizar } from "../../../utils/uiUtils";
import { useMapaEngine } from "../MapaEngine";
import Loading from "../../../components/Loading";
import { tarefasService } from "../../../services/crudService";

export default function PainelOperar({ show }) {

  
  const { user } = useAuth();
  const { activeTool, setShowPainel, selection, setTool, setToolState, toolSetup } = useMapaEngine();
  const { toastMessage } = useToast();
  const { cacheEntidades, reading } = useCache(["entidades"]);

  const [dispositivo, setDispositivo] = useState(null);
  const [tipoDispositivoId, setTipoDispositivoId] = useState("nenhum");
  const [comando, setComando] = useState("");
  const [writing, setWriting] = useState(false);


  useEffect(() => {
    if (selection) {
      const primary = selection.primaryType();
      if (primary === ENTIDADE.dispositivo.id) {
        const disp = resolvePrimarySelection(selection, cacheEntidades)
        setDispositivo(disp);
      }
    }
  }, [selection]);
  if (!show) return null;

  const enviarComando = async (comando) => {
    const tarefa = criarTarefaParaDispositivo({dispositivo, comando});
    await tarefasService.create(tarefa, user);
    toastMessage({
      body: `Comando enviado com sucesso para ${dispositivo.nome}`,
      variant: "success",
    });
  };

  const dispositivoAtivoSelecionado = 
    activeTool === "operar" &&
    toolSetup.operar?.id &&
    toolSetup.operar.id === dispositivo?.id

  const acoes = {
    [DISPOSITIVO.GRBL.id]: [
      {
        label: "Home",
        onClick: ()=>enviarComando('{"id":0, "job": "", "data": "$H", "rt": true}'),
        variant: VARIANTE.GREEN.variant,
      }
    ]
  }

  return (
    <div className="p-3">
      {dispositivoAtivoSelecionado && <div className="mb-3">
        <Form.Control
          type="text"
          size="sm"
          placeholder="Enviar comando customizado (ex: G1 X10 F500)..."
          value={comando}
          onChange={(e) => setComando(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && comando.trim()) {
              enviarComando(`{"id":0, "job": "", "data": "${comando}", "rt": true}`);
              setComando("");
            }
          }}
        />
      </div>}

      <div className="d-grid gap-2">
      {selection.primaryType() === ENTIDADE.dispositivo.id && 
        <Button
          key="operar"
          variant="outline-danger"
          size="sm"
          disabled={writing}
          onClick={dispositivoAtivoSelecionado ? ()=>{
            selection.toggle(`${ENTIDADE.dispositivo.id}:${toolSetup.operar.id}`)
            setToolState(null); } : ()=>{
            setTool("operar");
            setToolState(dispositivo);
            }}
        >
          {dispositivoAtivoSelecionado ? `Encerrar operação de ${toolSetup.operar.nome}` : `Operar ${dispositivo?.nome}`}
        </Button>
      }
      
      {toolSetup.operar.tipo && acoes[toolSetup.operar.tipo].map((acao, index)=>
        <Button
          key={index}
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