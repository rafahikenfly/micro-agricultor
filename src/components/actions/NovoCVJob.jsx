import { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { db, storage, timestamp } from "../../firebase";
import { handleSelectIdNome, renderOptions } from "../../utils/formUtils";
import { catalogosService } from "../../services/catalogosService";

export default function NovoCVJobTab({ entidade, tipoEntidade }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cvJobs, setCVJobs] = useState([]);
  const [jobSelecionado, setJobSelecionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  // Carregar catálogo de CVJobs
  useEffect(() => {
    let ativo = true;
    setLoadingCatalogos(true);
  
    Promise.all([
      catalogosService.getCVJobs({field: "tipoEntidade", value: tipoEntidade}),
    ]).then(([cvj, ]) => {
      if (!ativo) return;
  
      setCVJobs(cvj);
      setLoadingCatalogos(false);
    });
  
    return () => { ativo = false };
  }, []);

  // Ativar câmera apenas no modal
  useEffect(() => {
    if (!showModal) return;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Erro ao acessar câmera:", err);
        alert("Não foi possível acessar a câmera. Verifique permissões.");
      }
    }
    
    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject;
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [showModal]);

  async function criarInspecao() {
    setLoadingCatalogos(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video, 0, 0);

    const blob = await new Promise(r =>
      canvas.toBlob(r, "image/jpeg", 0.9)
    );

    const ts = Date.now();
    const imagePath = `cvQueue/${entidade.id}_${jobSelecionado.id}_${ts}.jpg`;

    await storage.ref(imagePath).put(blob);

    await db.collection("cvQueue").add({
      contexto: {
        canteiroId: entidade.id,
        canteiroNome: entidade.nome,
        hortaId: entidade.hortaId,
        hortaNome: entidade.hortaNome,
      },
      jobId: jobSelecionado.id,
      jobNome: jobSelecionado.nome,
      imagem: {
        path: `micro-agricultor.firebasestorage.app/${imagePath}`,
        source: "camera usuario",
        timestamp: timestamp(),
      },
      estado: "pending",
    });

    setLoadingCatalogos(false);
    setShowModal(false);
  }

  return (
    <>
      {/* SELECT DE JOB */}
      <Form.Group className="mb-3">
        <Form.Label>Tipo de inspeção</Form.Label>
        <Form.Select
          value={jobSelecionado?.id || ""}
          onChange={(e) => {setJobSelecionado(cvJobs.find((j) => j.id === e.target.value))}}
        >
          {renderOptions({
            list: cvJobs,
            loading: loadingCatalogos,
            items: cvJobs,
            placeholde: "Selecione o tipo de inspeção"
          })}
        </Form.Select>
      </Form.Group>

      {/* DESCRIÇÃO DO JOB */}
      {jobSelecionado && (
        <Alert variant="secondary">
          <strong>{jobSelecionado.nome}</strong>
          <div className="small mt-1">
            {jobSelecionado.descricao}
          </div>

          <Button
            size="sm"
            variant="success"
            className="mt-2"
            onClick={() => setShowModal(true)}
          >
            Criar Inspeção
          </Button>
        </Alert>
      )}

      {/* MODAL DE INSPEÇÃO */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{jobSelecionado?.nome}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Alert variant="secondary">
            {jobSelecionado?.instrucoes || "Siga as instruções da inspeção."}
          </Alert>

          <video
            ref={videoRef}
            autoPlay
            playsInline
            width="100%"
            style={{ borderRadius: 8 }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={criarInspecao}
            disabled={loadingCatalogos}
          >
            {loadingCatalogos ? "Enviando..." : "Capturar e Enviar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
