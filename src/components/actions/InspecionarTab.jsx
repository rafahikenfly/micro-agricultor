import { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { db, storage, timestamp } from "../../firebase";
import { handleSelectIdNome, renderOptions } from "../../utils/formUtils";
import { catalogosService } from "../../services/catalogosService";
import { JOB_ESTADO } from "../../utils/consts/jobEstado";
import { systemCreateCVJob } from "../../services/crud/cvQueue";

export default function InspecionarTab({ entidade, tipoEntidadeId, showToast }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cvJobs, setCVJobs] = useState([]);
  const [jobSelecionado, setJobSelecionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cameraAtiva, setCameraAtiva] = useState(false);


  const [previewUrl, setPreviewUrl] = useState(null);
  const [imagemBlob, setImagemBlob] = useState(null);

  const [reading, setReading] = useState(false);
  const [writing, setWriting] = useState(false);

  // Carregar catálogo de CVJobs
  useEffect(() => {
    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getCVJobs({field: "tipoEntidade", value: tipoEntidadeId}),
    ]).then(([cvj, ]) => {
      if (!ativo) return;
  
      setCVJobs(cvj);
      setReading(false);
    });
  
    return () => { ativo = false };
  }, []);

  // Ativar câmera apenas no modal
  useEffect(() => {
    if (!cameraAtiva) return;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        showToast(`Não foi possível acessar a câmera: ${err}.`, "danger");
      }
    }
    
    startCamera();
    return () => {
      stopCamera();
    };
  }, [cameraAtiva]);

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

function buildCVContext(entidade, tipoEntidade) {
  if (!entidade || !tipoEntidade) {
    throw new Error("Entidade e tipoEntidade são obrigatórios");
  }

  if (tipoEntidade === "Canteiro") {
    return {
      hortaId: entidade.hortaId,
      hortaNome: entidade.hortaNome,
      canteiroId: entidade.id,
      canteiroNome: entidade.nome,
    };
  }

  if (tipoEntidade === "Planta") {
    return {
      hortaId: entidade.hortaId,
      hortaNome: entidade.hortaNome,
      canteiroId: entidade.canteiroId,
      canteiroNome: entidade.canteiroNome,
      plantaId: entidade.id,
      plantaNome: entidade.nome,
    };
  }

  throw new Error(`Tipo de entidade inválido: ${tipoEntidade}`);
}
  async function criarInspecao(blob) {
    if (!blob) {
      showToast("Imagem inválida para envio.", "danger");
      return;
    }
    setWriting(true);

    const ts = Date.now();
    const imagePath = `cvQueue/ent_${entidade.id}_job_${jobSelecionado.id}_${ts}.jpg`;

    await storage.ref(imagePath).put(blob);
    try {
      await systemCreateCVJob({
        contexto: buildCVContext(entidade, tipoEntidadeId),
        jobId: jobSelecionado.id,
        jobNome: jobSelecionado.nome,
        imagem: {
          path: `micro-agricultor.firebasestorage.app/${imagePath}`,
          source: "camera usuario",
          timestamp: timestamp(),
        },
        estado: JOB_ESTADO[0], // Pendente
      }, "InspecionarTab");
      showToast("Inspeção criada na fila com sucesso.");
    }
    catch (err) {
      showToast(`Erro ao criar inspeção: ${err}`, "danger");
    }
    finally {
      setWriting(false);
      setShowModal(false);
    }
  }

  const capturarPreview = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (canvas.toBlob) {
      canvas.toBlob((blob) => {
        if (!blob) return;
        finalizarCaptura(blob);
      }, "image/jpeg", 0.9);
    } else {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      const blob = fetch(dataUrl).then(r => r.blob());
      blob.then(finalizarCaptura);
    }
  };

  function finalizarCaptura(blob) {
    stopCamera();
    setCameraAtiva(false);
    setImagemBlob(blob);
    setPreviewUrl(URL.createObjectURL(blob));
  }
  
  return (
    <>
      {/* SELECT DE JOB */}
      <Form.Group className="mb-3">
        <Form.Label>Tipo de inspeção</Form.Label>
        <Form.Select
          value={jobSelecionado?.id || ""}
          onChange={(e) => setJobSelecionado(cvJobs.find((j) => j.id === e.target.value))}
        >
          {renderOptions({
            list: cvJobs,
            loading: reading,
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
            onClick={() => {
              setPreviewUrl(null);
              setImagemBlob(null);
              setCameraAtiva(true);
              setShowModal(true);
            }}
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

          {!previewUrl ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              width="100%"
              style={{ borderRadius: 8 }}
            />
          ) : (
            <img
              src={previewUrl}
              alt="Preview da inspeção"
              style={{ width: "100%", borderRadius: 8 }}
            />
          )}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              stopCamera();
              setCameraAtiva(false);
              setPreviewUrl(null);
              setImagemBlob(null);
              setShowModal(false);
            }}
          >
            Cancelar
          </Button>

          {!previewUrl ? (
            <Button variant="primary" onClick={capturarPreview}>
              Capturar
            </Button>
          ) : (
            <>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setPreviewUrl(null);
                  setImagemBlob(null);
                  setCameraAtiva(true);
                }}
              >
                Refazer
              </Button>

              <Button
                variant="success"
                onClick={() => criarInspecao(imagemBlob)}
                disabled={writing}
              >
                {writing ? "Enviando..." : "Confirmar e Enviar"}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}
