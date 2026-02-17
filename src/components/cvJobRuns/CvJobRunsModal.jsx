import { useEffect, useState } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarCvJobRun } from "@shared/domain/cvJobRun.rules";
import CvJobRunDadosTab from "./CvJobRunsDadosTab";
import CvJobRunContextoTab from "./CvJobRunsContextoTab";
import CvJobRunImagemTab from "./CvJobRunsImagemTab";
import CvJobRunExecucaoTab from "./CvJobRunsExecucaoTab";
import CvJobRunResultadoTab from "./CvJobRunsResultadoTab";

export default function CvJobRunsModal({
  show,
  onSave,
  onClose,
  data = null,
}) {
  const [form, setForm] = useState(validarCvJobRun(data));

  /* ================= SINCRONIZAR DATA ================= */
  useEffect(() => {
    setForm(validarCvJobRun(data));
  }, [data]);

  const salvar = () => {
    onSave({
      ...form,
      id: data?.id, // garante edição
    });
  };

  if (!show) return null;

  return (
    <Modal show onHide={onClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          {data?.id ? "Editar Execução de CV Job" : "Nova Execução de CV Job"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>

          <Tabs defaultActiveKey="dados" mountOnEnter unmountOnExit>

            {/* ================= DADOS ================= */}
            <Tab eventKey="dados" title="Dados">
              <CvJobRunDadosTab
                form={form}
                setForm={(d) => setForm((prev) => ({ ...prev, ...d })) }
              />
            </Tab>

            {/* ================= CONTEXTO ================= */}
            <Tab eventKey="contexto" title="Contexto">
              <CvJobRunContextoTab
                form={form.contexto}
                setForm={(d) =>setForm((prev) => ({  ...prev,  contexto: { ...prev.contexto, ...d },}))}
              />
            </Tab>

            {/* ================= IMAGEM ================= */}
            <Tab eventKey="imagem" title="Imagem">
              <CvJobRunImagemTab
                form={form.imagem}
                setForm={(d) =>setForm((prev) => ({  ...prev,  imagem: { ...prev.imagem, ...d },}))}
              />
            </Tab>

            {/* ================= EXECUÇÃO ================= */}
            <Tab eventKey="execucao" title="Execução">
              <CvJobRunExecucaoTab
                form={form.execucao}
                setForm={(d) => setForm((prev) => ({ ...prev,   execucao: { ...prev.execucao, ...d }, }))}
              />
            </Tab>

            <Tab eventKey="resultados" title="Resultados">
              <CvJobRunResultadoTab
                form={form}
                setForm={(d) =>
                  setForm((prev) => ({
                    ...prev,
                    resultados: { ...prev.resultados,  ...d.resultados, },
                    encaminhamento: { ...prev.encaminhamento, ...d.encaminhamento, },
                  }))
                }
              />
            </Tab>

          </Tabs>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="success" onClick={salvar}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
