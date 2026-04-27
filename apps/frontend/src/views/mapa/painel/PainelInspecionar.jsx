import { useState } from "react";
import { renderOptions, StandardInput } from "../../../utils/formUtils";
import { Button, Form } from "react-bootstrap";
//import { offcanvasTabHeader } from "../legacy/OffcanvasPattern"
import Evolucao from "../../../components/Evolucao";
import { useCache } from "../../../hooks/useCache";
import { resolvePrimarySelection, resolveSelection } from "../../../utils/catalogUtils";
import { useMapaEngine } from "../MapaEngine";
import { VARIANTE } from "micro-agricultor";
import Loading from "../../../components/Loading";

export default function PainelInspecionar({ selection, primaryType, onConfirm, onCancel, }) {
  if (!selection) return null;

  const { setShowModal } = useMapaEngine()
  const { cacheCaracteristicas, cacheEntidades, reading } = useCache(["caracteristicas", "entidades"]);

  const [form, setForm] = useState({
//    primaryType: "",
    caracteristicaId: "",
  });

  const caracteristica = (cacheCaracteristicas?.map?.get(form.caracteristicaId) ?? {});

  const list = resolveSelection(selection, primaryType, cacheEntidades?.[primaryType]);
  const last = resolvePrimarySelection(selection,cacheEntidades)
  
  const handleConfirm = () => {
    const configInspecao = {
      caracteristicaId: form.caracteristicaId,
      min: caracteristica?.min || 0,
      max: caracteristica?.max || 1024,
      tipoEntidadeId: primaryType
    };
    onConfirm(configInspecao);
  }

  if (reading) return <Loading variant="overlay" />
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
        <div>Mínimo: {caracteristica?.medida?.min ?? "-"}</div>
        <div>Máximo: {caracteristica?.medida?.max ?? "-"}</div>
        <div>Unidade: {caracteristica?.medida?.unidade ?? "-"}</div>
      </div>
      <div className="d-grid gap-2">
        <Button
          variant={VARIANTE.GREEN.variant}
          disabled={!form.caracteristicaId}
          onClick={handleConfirm}
        >
          Ativar Inspeção no Mapa
        </Button>
        <Button
          variant={VARIANTE.RED.variant}
          onClick={onCancel}
        >
          Desativar Inspeção no Mapa
        </Button>
        {primaryType && <>
        <Evolucao
          entidades = {list}
          caracteristicas = {[caracteristica] ?? []}
        />
        <Button
          variant={VARIANTE.LIGHTBLUE.variant}
          disabled={!primaryType}
          onClick={()=>setShowModal({
            tipo: "inspecionar",
            data: {...last, tipoEntidadeId: primaryType}
          })}
        >
          {`Mais detalhes de ${last?.nome}`}
        </Button> </>}
      </div>
    </>
  );
}
