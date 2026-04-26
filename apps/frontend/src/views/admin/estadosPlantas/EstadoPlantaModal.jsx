import { useState, useEffect } from "react";
import { Modal, Form, Button, Badge } from "react-bootstrap";
import { validarEstado, VARIANTE } from "micro-agricultor";
import { handleSaveForm, renderOptions, StandardCheckboxGroup, StandardInput } from "../../../utils/formUtils";
import BaseTab from "../../../components/common/BaseTab";

export default function EstadoPlantaModal({ show, onSave, onClose, data = {}, }) {
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
          clearCache:"estados_planta",
          transform: validarEstado,
        })}
      >
        <Modal.Header closeButton>
          <Modal.Title>{data ? "Editar Estado de Planta" : "Novo Estado de Planta"}</Modal.Title>
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
          <StandardCheckboxGroup label="Propriedades">
            <Form.Check
              label="Visível no mapa"
              checked={form.propriedades.visivelNoMapa}
              onChange={(e)=>setForm({...form, propriedades: {...form.propriedades, visivelNoMapa: e.target.checked}})}
            />
            <Form.Check
              label="Editável no mapa"
              checked={form.propriedades.editavelNoMapa}
              onChange={(e)=>setForm({...form, propriedades: {...form.propriedades, editavelNoMapa: e.target.checked}})}
            />
            <Form.Check
              label="Requer monitoramento"
              checked={form.propriedades.requerMonitoramento}
              onChange={(e)=>setForm({...form, propriedades: {...form.propriedades, requerMonitoramento: e.target.checked}})}
            />
          </StandardCheckboxGroup>
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