import { useEffect, useState } from "react";
import { catalogosService } from "../../../services/catalogosService";
import { renderOptions, StandardInput } from "../../../utils/formUtils";
import { Button, Form, Offcanvas } from "react-bootstrap";
import { offcanvasTabHeader } from "../ui/OffcanvasPattern";
import { TIPOS_ENTIDADE } from "../../../utils/consts/TIPOS_ENTIDADE";
import HistoricoTab from "./HistoricoTab";

export default function InspecionarOffCanvas({ show, selectionData, onClose, onActivate, onDeactivate, }) {

  const [tipoEntidadeId, setTipoEntidadeId] = useState(null);
  const [caracteristicaSelecionada, setCaracteristicaSelecionada] = useState({})
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [reading, setReading] = useState(false);

  const list = selectionData[tipoEntidadeId] ?? [];
  const last = list.at(-1) ?? {};
  const header = offcanvasTabHeader ({tipoEntidadeId, list}) //só mostra o último
  

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getCaracteristicas(),
    ]).then(([carac]) => {
      if (!ativo) return;
      setCaracteristicas(carac);
      setReading(false);
    });
  
    return () => { ativo = false };
  }, []);

  const handleConfirm = () => {
    const configInspecao = {
      caracteristicaId: caracteristicaSelecionada.id,
      min: caracteristicaSelecionada.min || 0,
      max: caracteristicaSelecionada.max || 1024,
      serving: "inspect",
      tipoEntidadeId
    };

    onActivate(configInspecao);

  }
  const caracteristicasAplicaveis = caracteristicas.filter((c) => c.aplicavel?.[tipoEntidadeId]);

  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      placement="end"
      backdrop={false}
      scroll
    >
      <Offcanvas.Header closeButton>🗺{header}</Offcanvas.Header>
      <Offcanvas.Body>
        <StandardInput label="Inspecionar" width="120px">
          <Form.Select
            value={tipoEntidadeId ?? ""}
            onChange={(e)=>setTipoEntidadeId(e.target.value)}
          >
            {renderOptions({
              list: TIPOS_ENTIDADE.filter((a)=>a.inspecionavel),
              placeholder: "Selecione o tipo de entidade",
              nullOption: true,
              isOptionDisabled: (a)=>!selectionData[a.id] || selectionData[a.id].length === 0
            })}
          </Form.Select>
        </StandardInput>
        <StandardInput label="Característica" width="120px">
          <Form.Select
            value={caracteristicaSelecionada.id || ""}
            onChange={(e) => setCaracteristicaSelecionada(caracteristicas.find((c)=>c.id === e.target.value))}
          >
            {renderOptions({
              list: caracteristicasAplicaveis,
              loading: reading,
              placeholder: "Selecione a característica",
            })}
          </Form.Select>
        </StandardInput>
        <div className="p-2 border rounded bg-light mb-3">
          <strong>Resumo da inspeção</strong>
          <div>Característica: {caracteristicaSelecionada.nome ?? "-"}</div>
          <div>Mínimo: {caracteristicaSelecionada.min ?? "-"}</div>
          <div>Máximo: {caracteristicaSelecionada.max ?? "-"}</div>
          <div>Unidade: {caracteristicaSelecionada.unidade ?? "-"}</div>
        </div>
        <div className="d-grid gap-2">
          <Button
            variant="success"
            disabled={!caracteristicaSelecionada.id}
            onClick={handleConfirm}
          >
            Ativar Inspeção no Mapa
          </Button>
          <Button
            variant="danger"
            onClick={onDeactivate}
          >
            Desativar Inspeção no Mapa
          </Button>
          <HistoricoTab
            selectionData = {list}
            caracteristica = {caracteristicaSelecionada}
          />
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
