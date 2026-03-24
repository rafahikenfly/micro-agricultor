import { Tabs, Tab, Form, } from "react-bootstrap";
import { useState } from "react";
import { StandardInput } from "../../../utils/formUtils";
import { toDateTimeLocal } from "../../../utils/dateUtils";
import MonitoramentoLoteTab from "./MonitoramentoLoteTab";
import MonitoramentoIndividualTab from "./MonitoramentoIndividualTab";
import { resolveSelection } from "../../../utils/catalogUtils";


export default function PainelMonitorar({ selection, catalogos, primaryType }) {
  //TODO: SE TIVER APENAS UM TIPO DE SELEÇÃO, CARREGA O TIPOENTIDADEID
  if (!selection) return null;

  //TODO: USAR FORM
  //const [primaryType, setTipoEntidadeId] = useState(null);
  const [stringTimestamp, setStringTimestamp] = useState(toDateTimeLocal(new Date()));
  const list = resolveSelection(selection, primaryType, catalogos[primaryType]);

  return (
    <>
      {/* <StandardInput label="Monitorar" width="120px">
        <Form.Select
          value={primaryType ?? ""}
          onChange={(e)=>setTipoEntidadeId(e.target.value)}
        >
          {renderOptions({
            list: Object.values(ENTIDADE).filter((a)=>a.monitoravel),
            placeholder: "Selecione o tipo de entidade",
            nullOption: true,
            isOptionDisabled: (a) => !selection.hasType(a.id),
          })}
          </Form.Select>
      </StandardInput> */}
      <StandardInput label="Data/hora" width="120px">
        <Form.Control
          type="datetime-local"
          value={stringTimestamp}
          onChange={(e)=> setStringTimestamp(e.target.value)}
        />
      </StandardInput>

      {primaryType && list.length > 0 && <Tabs className="px-3 pt-2" defaultActiveKey="lote">
        <Tab eventKey="lote" title="Em Lote">
          <MonitoramentoLoteTab
            entidades={list}
            tipoEntidadeId={primaryType}
            stringTimestamp={stringTimestamp}
          />
        </Tab>
        {list.length > 1 && <Tab eventKey="individual" title="Ajuste Individual">
          <MonitoramentoIndividualTab
            entidades={list}
            tipoEntidadeId={primaryType}
            stringTimestamp={stringTimestamp}
          />
        </Tab>}
      </Tabs>}
    </>
  );
}