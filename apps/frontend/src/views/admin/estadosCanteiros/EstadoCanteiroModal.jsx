import { useState, useEffect } from "react";
import { Modal, Form, Button, Badge } from "react-bootstrap";
import { validarEstado, VARIANTE } from "micro-agricultor";

import { handleSaveForm, renderOptions, StandardInput } from "../../../utils/formUtils";

import BaseTab from "../../../components/common/BaseTab";

export default function EstadosCanteiroModal({ show, onSave, onClose, data = {}, }) {
  const [form, setForm] = useState(validarEstado(data))
  
  // Sanitiza data
  useEffect(() => { setForm(validarEstado(data ?? {})); }, [data]);
    
  if (!show) return null;
  return (
    <Modal show onHide={onClose} size="lg">
      <Form onSubmit={(evt)=>handleSaveForm({
          evt,
          onSave,
          form,
          setForm,
          clearCache: "estados_canteiro",
          transform: validarEstado,
        })}
      >
        <Modal.Header closeButton>
          <Modal.Title>{data ? "Editar Estado de Canteiro" : "Novo Estado de Canteiro"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <BaseTab
            form={form}
            setForm={setForm}
          >
            <StandardInput label="Cor da tag">
              <Form.Select
                value={form.tagVariant}
                onChange={e => setForm({...form, tagVariant: e.target.value})}
                required
              >
                {renderOptions({
                  list: Object.values(VARIANTE),
                  placeholder: "Selecione a cor da tag",
                })}
              </Form.Select>
              <Badge bg={form.tagVariant}> </Badge>
            </StandardInput>
          </BaseTab>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="success" type="submit">Salvar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}