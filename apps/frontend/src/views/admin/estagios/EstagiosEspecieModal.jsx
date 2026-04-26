import { useState, useEffect } from "react";
import { Modal, Form, Button, Badge } from "react-bootstrap";
import { validarEstagio, VARIANTE } from "micro-agricultor";
import { handleSaveForm, renderOptions, StandardInput } from "../../../utils/formUtils";

export default function EstagioEspecieModal({ show, onSave, onClose, data = {}, }) {
    const [form, setForm] = useState(validarEstagio(data))
  
    useEffect(() => {
      if (!data) {
        setForm(validarEstagio({}));   // novo estagio limpo
      } else {
        setForm(validarEstagio(data)); // edição
      }
    }, [data]);
    

    if (!show) return null;
    return (
    <Modal show onHide={onClose} size="lg">
      <Form onSubmit={(evt)=>handleSaveForm({
          evt,
          onSave,
          form,
          setForm,
          clearCache:"estagiosEspecie"
        })}>
        <Modal.Header closeButton>
          <Modal.Title>{data ? "Editar Estágio de Espécie" : "Novo Estágio de Espécie"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>

            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                value={form.nome}
                onChange={e => setForm({...form, nome: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.descricao}
                onChange={e => setForm({...form, descricao: e.target.value})}
              />
            </Form.Group>

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
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button variant="success" type="submit">Salvar</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    )
}