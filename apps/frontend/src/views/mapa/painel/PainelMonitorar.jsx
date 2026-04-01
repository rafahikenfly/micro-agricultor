import { Tabs, Tab, Form, } from "react-bootstrap";
import { useEffect, useState } from "react";
import { StandardInput } from "../../../utils/formUtils";
import { toDateTimeLocal } from "../../../utils/dateUtils";
import MonitoramentoPorCaracteristica from "./MonitoramentoPorCaracteristica";
import MonitoramentoPorEntidade from "./MonitoramentoPorEntidade";
import { resolveSelection } from "../../../utils/catalogUtils";


export default function PainelMonitorar({ selection, caches }) {
  if (!selection) return null;
  
  const [primaryType, setPrimaryType] = useState(selection.primaryType());
  const [stringTimestamp, setStringTimestamp] = useState(toDateTimeLocal(new Date()));
  const list = resolveSelection(selection, primaryType, caches[primaryType]);
  
  useEffect(()=>setPrimaryType(selection.primaryType()), [selection]);

  return (
    <>
      <StandardInput label="Data/hora" width="120px">
        <Form.Control
          type="datetime-local"
          value={stringTimestamp}
          onChange={(e)=> setStringTimestamp(e.target.value)}
        />
      </StandardInput>

      {primaryType && list.length > 0 && <Tabs className="px-3 pt-2" defaultActiveKey="lote">
        <Tab eventKey="lote" title="Por característica">
          <MonitoramentoPorCaracteristica
            entidades={list}
            tipoEntidadeId={primaryType}
            stringTimestamp={stringTimestamp}
          />
        </Tab>
        {list.length > 1 && <Tab eventKey="individual" title={`Por ${primaryType}`}>
          <MonitoramentoPorEntidade
            entidades={list}
            tipoEntidadeId={primaryType}
            stringTimestamp={stringTimestamp}
          />
        </Tab>}
      </Tabs>}
    </>
  );
}