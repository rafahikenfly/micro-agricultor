import { Tabs, Tab, Form, } from "react-bootstrap";
import { useEffect, useState } from "react";
import { StandardInput } from "../../../utils/formUtils";
import { toDateTimeLocal } from "../../../utils/dateUtils";
import MonitoramentoPorCaracteristica from "./MonitoramentoPorCaracteristica";
import MonitoramentoPorEntidade from "./MonitoramentoPorEntidade";
import { resolveSelection } from "../../../utils/catalogUtils";
import Loading from "../../../components/Loading";
import { useCache } from "../../../hooks/useCache";


export default function PainelMonitorar({ selection }) {
  if (!selection) return null;
  
  const { cacheEntidades, reading } = useCache(["entidades"]);
  
  const [primaryType, setPrimaryType] = useState(selection.primaryType());
  const [stringTimestamp, setStringTimestamp] = useState(toDateTimeLocal(new Date()));

  
  const list = resolveSelection(selection, primaryType, cacheEntidades?.[primaryType]);
  
  useEffect(()=>setPrimaryType(selection.primaryType()), [selection]);

  if (reading) return <Loading variant="overlay" />
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