import { useState, useEffect } from "react";
import { Modal, Form, Button, Badge } from "react-bootstrap";
import { handleSaveForm, renderOptions, StandardInput } from "../../../utils/formUtils";
import { validarCategoria, VARIANTE } from "micro-agricultor";
import BaseTab from "../../../components/common/BaseTab";

export default function CategoriaModal({ show, onSave, onClose, data = {}, }) {
  // Formulário
  const [form, setForm] = useState(validarCategoria(data))

  // ========== CARREGAR DADOS ==========
  // Sanitiza data
  useEffect(() => { setForm(validarCategoria(data ?? {})); }, [data]);

  if (!show) return null;
  return (
    <Modal show onHide={onClose} size="lg">
      <Form onSubmit={(evt)=>handleSaveForm({
          evt,
          onSave,
          form,
          transform: validarCategoria,
          clear: true,
          onClear: setForm(validarCategoria({})),
          clearCache:"categorias"
        })}
      >
        <Modal.Header closeButton>
          <Modal.Title>{data ? "Editar Categoria" : "Nova Categoria"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <BaseTab
            form={form}
            setForm={setForm}
          >
            <StandardInput label="Tag">
              <Form.Select
                value={form.variant}
                onChange={e => setForm({...form, variant: e.target.value})}
                required
              >
                {renderOptions({
                  list: Object.values(VARIANTE),
                  placeholder: "Selecione a cor da tag",
                })}
              </Form.Select>
              <Badge bg={VARIANTE[form.variant]?.variant}> </Badge>
            </StandardInput>
          </BaseTab>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="success" type="submit">
            Salvar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}