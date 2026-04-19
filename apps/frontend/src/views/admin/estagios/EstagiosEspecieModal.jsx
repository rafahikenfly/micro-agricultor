import { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { validarEstagio, VARIANTE } from "micro-agricultor";
import { handleSaveForm, renderOptions } from "../../../utils/formUtils";

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

            <Form.Group className="mb-3">
              <Form.Select
                value={form.tagVariant}
                onChange={e => setForm({...form, tagVariant: e.target.value})}
                label="Cor da Tag"
                required
              >
                {renderOptions({
                  list: Object.values(VARIANTE),
                  placeholder: "Selecione a cor da tag",
                })}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button variant="success" type="submit">Salvar</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    )
}