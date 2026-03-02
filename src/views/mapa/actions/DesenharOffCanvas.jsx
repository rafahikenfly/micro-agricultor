import { useState, useEffect } from "react";
import { Offcanvas, Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import { catalogosService } from "../../../services/catalogosService";
import { handleSelectIdNome, renderOptions, StandardInput } from "../../../utils/formUtils";
import InputGroupText from "react-bootstrap/esm/InputGroupText";
import { GEOMETRIAS } from "../../../utils/consts/GEOMETRIAS";
import { ISOToReadableString, toDateTimeLocal } from "../../../utils/dateUtils";
import { TIPOS_ENTIDADE } from "../../../utils/consts/TIPOS_ENTIDADE";

export default function DesenharOffcanvas({ show, onClose, onConfirm, onCancel }) {
  const [stringTimestamp, setStringTimestamp] = useState(toDateTimeLocal(new Date()));
  const [geometria, setGeometria] = useState("");
  const [entidade, setEntidade] = useState("");
  const [grid, setGrid] = useState(1);
  
  //CATALOGOS
  const [reading, setReading] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    let ativo = true;
    setReading(true);
  
    Promise.all([
//      catalogosService.getEspecies(),
//      catalogosService.getVariedades(),
    ]).then(([esps,vars]) => {
      if (!ativo) return;
  
//      setEspecies(esps);
//      setVariedades(vars);
      setReading(false);
    });
  
    return () => { ativo = false };
  }, []);
  
  const handleConfirm = () => {
    const date = new Date(stringTimestamp);
    const timestamp = date.getTime();
    const configDraw = {
      timestamp,
      tipoEntidadeId: "canteiro", //TODO: Usar selectbox para selecionar isso como no monitoramento
      geometria,
    };
    const drag = {
      serving: "draw",
      grid,
    }
    onConfirm(configDraw, drag);
    onClose();
  };

  const handleCancel =() => {
    onCancel();
    onClose();
  }

  return (
    <Offcanvas show={show} onHide={onClose} placement="end" backdrop={false}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>📐 Desenhar Canteiros</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        <Form>
          <StandardInput label="Data/hora" width="120px">
            <Form.Control
              type="datetime-local"
              value={stringTimestamp}
              onChange={(e)=> setStringTimestamp(e.target.value)}
            />
          </StandardInput>
          <StandardInput label="Entidade" width="120px">
            <Form.Select
              value={entidade || ""}
              onChange={(e) => setEntidade(e.target.value)}
            >
              {renderOptions({
                list: TIPOS_ENTIDADE.filter((a)=>a.desenhavel),
                placeholder: "Selecione a entidade",
              })}
            </Form.Select>
          </StandardInput>
          <StandardInput label="Geometria" width="120px">
            <Form.Select
              value={geometria || ""}
              onChange={(e) => setGeometria(e.target.value)}
            >
              {renderOptions({
                list: GEOMETRIAS,
                placeholder: "Selecione a geometria",
                isOptionDisabled: (a)=>a.id === "polygon" //TODO: desenhar polígono
              })}
            </Form.Select>
          </StandardInput>
          <StandardInput label="Grade" width="120px" unidade="cm" unidadeWidth="40px">
            <Form.Control
              type="number"
              step="1"
              value={grid}
              onChange={(e) => setGrid(Number(e.target.value))}
            />
          </StandardInput>

          <div className="p-2 border rounded bg-light mb-3">
            <strong>Resumo do desenho</strong>
            <div>Data/Hora: {ISOToReadableString(stringTimestamp)}</div>
            <div>Geometria: {GEOMETRIAS.find((a)=>a.id === geometria)?.nome || "-"}</div>
            <div>Alinhar à grade de {grid}cm</div>
          </div>

          <div className="d-grid gap-2">
            <Button
              variant="success"
              disabled={!geometria}
              onClick={handleConfirm}
            >
              Desenhar
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
}