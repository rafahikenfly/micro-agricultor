import { useEffect, useState } from "react";
import { catalogosService } from "../../../services/catalogosService";
import { handleSelectIdNome, renderOptions } from "../../../utils/formUtils";
import { Button, Form, Offcanvas } from "react-bootstrap";

export default function InspecionarOffCanvas({
  show,
  tipoEntidadeId,
  onClose,
  onActivate,
  onDeactivate,
}) {

  const [form, setForm] = useState({});
  const [caracteristicaSelecionada, setCaracteristicaSelecionada] = useState({})
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [reading, setReading] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getCaracteristicas(),
    ]).then(([carac]) => {
      if (!ativo) return;
      setCaracteristicas(carac);
      setReading(false);
    });
  
    return () => { ativo = false };
  }, []);

  const handleConfirm = () => {
    const configInspecao = {
      inspect: true,
      caracteristicaId: caracteristicaSelecionada.id,
      min: caracteristicaSelecionada.min || 0,
      max: caracteristicaSelecionada.max || 1024,
    };

    onActivate(configInspecao);

  }

  const caracteristicasAplicaveis = caracteristicas.filter(
    c => c.aplicavel?.[tipoEntidadeId] === true
  );

  return (
    <Offcanvas show={show} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Inspeção</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        <Form>
          <Form.Group>
            <Form.Label>Característica</Form.Label>
            <Form.Select
              value={caracteristicaSelecionada.id || ""}
              onChange={(e) => setCaracteristicaSelecionada(caracteristicas.find((c)=>c.id === e.target.value))/*setForm({...form, caracteristicaId: e.target.value})}*/}
            >
              {renderOptions({
                list: caracteristicasAplicaveis,
                loading: reading,
                placeholder: "Selecione a característica",
              })}
            </Form.Select>
          </Form.Group>
          <div className="p-2 border rounded bg-light mb-3">
            <strong>Resumo da inspeção</strong>
            <div>Característica: {caracteristicaSelecionada.nome || "-"}</div>
            <div>Mínimo: {caracteristicaSelecionada.min || "-"}</div>
            <div>Máximo: {caracteristicaSelecionada.max || "-"}</div>
            <div>Unidade: {caracteristicaSelecionada.unidade || "-"}</div>
          </div>
          <div className="d-grid gap-2">
            <Button
              variant="success"
              disabled={!caracteristicaSelecionada.id}
              onClick={handleConfirm}
            >
              Ativar Inspeção
            </Button>
            <Button
              variant="danger"
              onClick={onDeactivate}
            >
              Desativar Inspeção
            </Button>
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
