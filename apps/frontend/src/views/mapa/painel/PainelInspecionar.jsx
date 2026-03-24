import { useState } from "react";
import { renderOptions, StandardInput } from "../../../utils/formUtils";
import { Button, Form } from "react-bootstrap";
//import { offcanvasTabHeader } from "../legacy/OffcanvasPattern"
import Historico from "../../../components/Historico";
import { useCatalogos } from "../../../hooks/useCatalogos";
import { resolveSelection } from "../../../utils/catalogUtils";
import { useMapaEngine } from "../MapaEngine";

export default function PainelInspecionar({ selection, primaryType, catalogos, onClose, onConfirm, onCancel, }) {
  if (!selection) return null;
  const { catalogoCaracteristicas, reading } = useCatalogos(["caracteristicas"]);
  const { setShowModal } = useMapaEngine()

  const [form, setForm] = useState({
//    primaryType: "",
    caracteristicaId: "",
  });

  const caracteristica = (catalogoCaracteristicas?.map?.get(form.caracteristicaId) ?? {});

  const caracteristicasAplicaveis =
  primaryType
    ? catalogoCaracteristicas?.list?.filter(
        (c) => c.aplicavel?.[primaryType]
      ) ?? []
    : [];

  const list = resolveSelection(selection, primaryType, catalogos[primaryType]);
  
  const handleConfirm = () => {
    const configInspecao = {
      caracteristicaId: form.caracteristicaId,
      min: caracteristica?.min || 0,
      max: caracteristica?.max || 1024,
      tipoEntidadeId: primaryType
    };
    onConfirm(configInspecao);
  }

  return (
    <>
      {/* <StandardInput label="Inspecionar" width="120px">
        <Form.Select
          value={primaryType ?? ""}
          onChange={(e)=>setForm({primaryType: e.target.value, caracteristicaId: ""})}
        >
          {renderOptions({
            list: Object.values(ENTIDADE).filter((a)=>a.inspecionavel),
            placeholder: "Selecione o tipo de entidade",
            nullOption: true,
            isOptionDisabled: (a) => !selection.hasType(a.id),
          })}
        </Form.Select>
      </StandardInput> */}
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
        {primaryType && <>
        <Historico
          entidades = {list}
          caracteristicas = {[caracteristica] ?? []}
        />
        <Button
          variant="info"
          disabled={!primaryType}
          onClick={()=>setShowModal({
            tipoEntidadeId: "inspecionar",
            data: last
          })}
        >
          {`Mais detalhes de ${primaryType}`}
        </Button> </>}
      </div>
    </>
  );
}
