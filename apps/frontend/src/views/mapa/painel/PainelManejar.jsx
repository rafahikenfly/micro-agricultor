import { useState } from "react";
import { renderOptions, StandardInput } from "../../../utils/formUtils";
import { Button, Form, } from "react-bootstrap";
import { useAuth } from "../../../services/auth/authContext";
import { ISOToReadableString, toDateTimeLocal } from "../../../utils/dateUtils";
import { monitorarMultiplosCanteiros } from "../../../services/application/canteiro.application";
import { monitorarMultiplasPlantas } from "../../../services/application/plantas.application";
import { VARIANT_TYPES } from "micro-agricultor";
import { useCatalogos } from "../../../hooks/useCatalogos";
import { useToast } from "../../../services/toast/toastProvider";
import { resolvePrimarySelection, resolveSelection } from "../../../utils/catalogUtils";

export default function PainelManejar({selection, primaryType, catalogos, onClose }) {
  if (!selection) return null;

  const { user } = useAuth();
  const { toastMessage } = useToast

//  const [primaryType, setTipoEntidadeId] = useState(null);
  const [stringTimestamp, setStringTimestamp] = useState(toDateTimeLocal(new Date()));
  const [manejoSelecionado, setManejo] = useState({})
  // TODO: Novos catálogos
  const { catalogoManejos, reading } = useCatalogos(["manejos"]);

//  const [catalogoManejos, setManejos] = useState([]);
//  const [reading, setReading] = useState(false);
  const [writing, setWriting] = useState(false);

  const list = resolveSelection(selection, primaryType, catalogos[primaryType]);
  const last = resolvePrimarySelection(selection,catalogos);

  const manejosAplicaveis = (catalogoManejos ?? []).filter(
    m => m.aplicavel?.[primaryType] === true
  );  

  const aplicarManejo = () => {
    // Recupera o timestamp
    const date = new Date(stringTimestamp);
    const timestamp = date.getTime();

    setWriting(true);
    try {
      switch (primaryType) {
        case "canteiro":
          monitorarMultiplosCanteiros({ //TODO: USAR FUNCAO GENERICA DE MANIPULACAO DE CANTEIROS
            canteiros: selection,
            medidas,
            user,
            actionType: ACTION_TYPES.MONITOR,
            timestamp,
          })
          break;
        case "planta":
          monitorarMultiplasPlantas({ //TODO: USAR FUNCAO GENERICA DE MANIPULACAO DE CANTEIROS
            plantas: selection,
            medidas,
            user,
            actionType: ACTION_TYPES.MONITOR,
            timestamp,
          })
          break;
        default:
          throw new Error (`Entidade ${primaryType} não é manejável.`)
      }
      toastMessage({
        body: `Manejo de ${selection.length > 1 ? `${selection.length} ${primaryType}s`: entidade.nome} registrado com sucesso.`,
        variant: VARIANT_TYPES.GREEN,
      });
      //Limpa seleção
      setForm({});
    } catch (err) {
      console.error(err)
      showToast({
        body: `Erro ao registrar manejo.`,
        variang: VARIANT_TYPES.RED
      });
    } finally {
      setWriting(false);
    }
  }

  return (
    <>
{/*     <StandardInput label="Manejar" width="120px">
      <Form.Select
        value={primaryType ?? ""}
        onChange={(e)=>setTipoEntidadeId(e.target.value)}
      >
        {renderOptions({
          list: Object.values(ENTIDADE).filter((a)=>a.monitoravel),
          placeholder: "Selecione o tipo de entidade",
          nullOption: true,
          isOptionDisabled: (a)=>!selection[a.id] || selection[a.id].length === 0
        })}
      </Form.Select>
    </StandardInput>
 */}    <StandardInput label="Manejo" width="120px">
      <Form.Select
        value={manejoSelecionado.id || ""}
        onChange={(e) => setManejo(catalogoManejos.find((c)=>c.id === e.target.value))/*setForm({...form, caracteristicaId: e.target.value})}*/}
      >
        {renderOptions({
          list: manejosAplicaveis,
          loading: reading,
          placeholder: "Selecione o manejo",
        })}
      </Form.Select>
    </StandardInput>
      <StandardInput label="Data/hora" width="120px">
        <Form.Control
          type="datetime-local"
          value={stringTimestamp}
          onChange={(e)=> setStringTimestamp(e.target.value)}
        />
      </StandardInput>
      <div className="p-2 border rounded bg-light mb-3">
        <strong>Resumo do manejo</strong>
        <div>Data/Hora: {ISOToReadableString(stringTimestamp)}</div>
        <div>Manejo: {manejoSelecionado.nome || "-"}</div>
        <div>Alvo{last ? list.length > 1 ? `s: ${list.length} ${primaryType}s` : `: ${last?.nome}` : ": -"}</div>
        <div>Descrição: {manejoSelecionado.descricao || "-"}</div>
      </div>
      <div className="d-grid gap-2">
        <Button
          variant="success"
          disabled={!manejoSelecionado || list.length === 0}
          onClick={aplicarManejo}
        >
          {list.length === 0 ? "Selecione entidades para manejar"
          : writing ? "Aplicando manejo..."
            : "Aplicar manejo"
          }
        </Button>
      </div>
    </>
  );
}
