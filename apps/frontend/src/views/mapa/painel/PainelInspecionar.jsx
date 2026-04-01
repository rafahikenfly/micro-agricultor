import { useState } from "react";
import { renderOptions, StandardInput } from "../../../utils/formUtils";
import { Button, Form } from "react-bootstrap";
//import { offcanvasTabHeader } from "../legacy/OffcanvasPattern"
import Historico from "../../../components/Historico";
import { useCache } from "../../../hooks/useCache";
import { resolvePrimarySelection, resolveSelection } from "../../../utils/catalogUtils";
import { useMapaEngine } from "../MapaEngine";
import { VARIANT_TYPES } from "micro-agricultor";

export default function PainelInspecionar({ selection, primaryType, caches, onConfirm, onCancel, }) {
  if (!selection) return null;
  const { cacheCaracteristicas, reading } = useCache(["caracteristicas"]);
  const { setShowModal } = useMapaEngine()

  const [form, setForm] = useState({
//    primaryType: "",
    caracteristicaId: "",
  });

  const caracteristica = (cacheCaracteristicas?.map?.get(form.caracteristicaId) ?? {});

  const list = resolveSelection(selection, primaryType, caches[primaryType]);
  const last = resolvePrimarySelection(selection,caches)
  
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
      <StandardInput label="Característica" width="120px">
        <Form.Select
          value={form.caracteristicaId || ""}
          onChange={(e) => setForm({...form, caracteristicaId: e.target.value})}
        >
          {renderOptions({
            list: (cacheCaracteristicas?.list ?? []),
            loading: reading,
            placeholder: "Selecione a característica",
            isOptionDisabled: (a) => !a.aplicavel[primaryType]
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
          variant={VARIANT_TYPES.GREEN}
          disabled={!form.caracteristicaId}
          onClick={handleConfirm}
        >
          Ativar Inspeção no Mapa
        </Button>
        <Button
          variant={VARIANT_TYPES.RED}
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
          variant={VARIANT_TYPES.LIGHTBLUE}
          disabled={!primaryType}
          onClick={()=>setShowModal({
            tipoEntidadeId: "inspecionar",
            data: {...last, tipoEntidadeId: primaryType}
          })}
        >
          {`Mais detalhes de ${last.nome}`}
        </Button> </>}
      </div>
    </>
  );
}
