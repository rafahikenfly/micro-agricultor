import { useEffect, useState } from "react";
import { renderOptions, StandardInput } from "../../../utils/formUtils";
import { Button, Form, Offcanvas } from "react-bootstrap";
import { offcanvasTabHeader } from "../legacy/OffcanvasPattern"
import Historico from "../../../components/Historico";
import { ENTIDADE } from "micro-agricultor";
import { useCatalogos } from "../../../hooks/useCatalogos";
import { resolveSelection } from "../../../utils/catalogUtils";
import { useMapaEngine } from "../MapaEngine";

export default function InspecionarOffCanvas({ show, selection, catalogos, onClose, onConfirm, onCancel, }) {
  //TODO: SE TIVER APENAS UM TIPO DE SELEÇÃO, CARREGA O TIPOENTIDADEID
  if (!selection || !show) return null;
  const { catalogoCaracteristicas, reading } = useCatalogos(["caracteristicas"]);
  const { setShowModal } = useMapaEngine()

  const [form, setForm] = useState({
    tipoEntidadeId: "",
    caracteristicaId: "",
  });

  const caracteristica = (catalogoCaracteristicas?.map?.get(form.caracteristicaId) ?? {});

  const caracteristicasAplicaveis =
  form.tipoEntidadeId
    ? catalogoCaracteristicas?.list?.filter(
        (c) => c.aplicavel?.[form.tipoEntidadeId]
      ) ?? []
    : [];

  const list = resolveSelection(selection, form.tipoEntidadeId, catalogos[form.tipoEntidadeId]);
  const last = list.at(-1) ?? {};
  const header = offcanvasTabHeader ({tipoEntidadeId: form.tipoEntidadeId, list}) //só mostra o último
  
  const handleConfirm = () => {
    const configInspecao = {
      caracteristicaId: form.caracteristicaId,
      min: caracteristica?.min || 0,
      max: caracteristica?.max || 1024,
      tipoEntidadeId: form.tipoEntidadeId
    };
    onConfirm(configInspecao);
  }

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
            value={form.tipoEntidadeId ?? ""}
            onChange={(e)=>setForm({tipoEntidadeId: e.target.value, caracteristicaId: ""})}
          >
            {renderOptions({
              list: Object.values(ENTIDADE).filter((a)=>a.inspecionavel),
              placeholder: "Selecione o tipo de entidade",
              nullOption: true,
              isOptionDisabled: (a) => !selection.hasType(a.id),
            })}
          </Form.Select>
                  <Button
          variant="info"
          disabled={!form.tipoEntidadeId}
          onClick={()=>setShowModal({
            tipoEntidadeId: "inspecionar",
            data: last
          })}
        >
          Mais detalhes
        </Button>
        </StandardInput>
        <StandardInput label="Característica" width="120px">
          <Form.Select
            value={form.caracteristicaId || ""}
            onChange={(e) => setForm({...form, caracteristicaId: e.target.value})}
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
          <div>Característica: {caracteristica?.nome ?? "-"}</div>
          <div>Mínimo: {caracteristica?.min ?? "-"}</div>
          <div>Máximo: {caracteristica?.max ?? "-"}</div>
          <div>Unidade: {caracteristica?.unidade ?? "-"}</div>
        </div>
        <div className="d-grid gap-2">
          <Button
            variant="success"
            disabled={!form.caracteristicaId}
            onClick={handleConfirm}
          >
            Ativar Inspeção no Mapa
          </Button>
          <Button
            variant="danger"
            onClick={onCancel}
          >
            Desativar Inspeção no Mapa
          </Button>
          <Historico
            entidades = {list}
            caracteristicas = {[caracteristica] ?? []}
          />
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
