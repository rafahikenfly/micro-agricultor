import { useState, useEffect } from "react";
import { Offcanvas, Form, Button, } from "react-bootstrap";
import { ENTIDADE, GEOMETRIA } from "micro-agricultor";

import { renderOptions, StandardInput } from "../../../utils/formUtils";
import { ISOToReadableString, toDateTimeLocal } from "../../../utils/dateUtils";

export default function DesenharOffcanvas({ show, data = {}, onClose, onConfirm, onCancel }) {
  // Carrega a última configuração da ferramenta
  // Timestamp não é carregado
  const [stringTimestamp, setStringTimestamp] = useState(toDateTimeLocal(new Date()));
  const [geometria, setGeometria] = useState(data.geometria ?? "");
  const [tipoEntidadeId, setTipoEntidadeId] = useState(data.tipoEntidadeId ?? "");
  const [grid, setGrid] = useState(data.grid ?? 1);
    
  const handleConfirm = () => {
    const date = new Date(stringTimestamp);
    const timestamp = date.getTime();
    const toolState = {
      timestamp,
      tipoEntidadeId,
      geometria,
      grid,
    };
    onConfirm(toolState);
    onClose();
  };

  const handleCancel =() => {
    onCancel();
    onClose();
  }

  return (
    <Offcanvas show={show} onHide={onClose} placement="end" backdrop={false}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>📐 Desenhar</Offcanvas.Title>
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
              value={tipoEntidadeId || ""}
              onChange={(e) => setTipoEntidadeId(e.target.value)}
            >
              {renderOptions({
                list: Object.values(ENTIDADE).filter((a)=>a.desenhavel),
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
                list: Object.values(GEOMETRIA),
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
            <div>Entidade: {tipoEntidadeId}</div>
            <div>Data/Hora: {ISOToReadableString(stringTimestamp)}</div>
            <div>Geometria: {GEOMETRIA[geometria]?.nome || "-"}</div>
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