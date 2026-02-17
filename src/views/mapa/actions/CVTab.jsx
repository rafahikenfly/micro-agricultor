import { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { nowTimestamp, storage, } from "../../../firebase";
import { catalogosService } from "../../../services/catalogosService";
import { renderOptions } from "../../../utils/formUtils";
import { criarCvJobRun } from "../../../../shared/domain/cvJobRun.rules";
import { cvJobRunsService } from "../../../services/crud/cvJobRunsService";
import { useAuth } from "../../../services/auth/authContext";

export default function CVTab({ entidade, tipoEntidadeId, showToast }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const { user } = useAuth()
  const [cvJobSpecs, setCVJobs] = useState([]);
  const [jobSpecsSelecionado, setJobSpecsSelecionado] = useState(null);
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
      catalogosService.getCVJobSpecs(),
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
        console.error(err)
        showToast({
          body: `Não foi possível acessar a câmera: ${err}.`,
          variant: "danger"
        });
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

  async function criarInspecao(blob) {
    if (!blob) {
      showToast({
        body: "Imagem inválida para envio.", 
        variant: "danger"
      });
      return;
    }
    setWriting(true);
    try {
      const novoCvJobRunRef = cvJobRunsService.criarRef();
      const novoCvJobRun = criarCvJobRun({
        cvJobRunId: novoCvJobRunRef.id,
        cvJobSpecs: jobSpecsSelecionado,
        entidade: entidade,
        tipoEntidadeId: tipoEntidadeId,
        origemImagem: "camera usuário",
        timestamp: nowTimestamp(),
      })
      await storage.ref(novoCvJobRun.imagem.path).put(blob);
      await cvJobRunsService.upsert(novoCvJobRunRef,novoCvJobRun, user)
      showToast({
        body: "Inspeção criada na fila com sucesso.",
        variant: "success",
      });
    }
    catch (err) {
      console.error(err);
      showToast({
        body: `Erro ao criar inspeção.`,
        variant: "danger"
      });
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
          value={jobSpecsSelecionado?.id || ""}
          onChange={(e) => setJobSpecsSelecionado(cvJobSpecs.find((j) => j.id === e.target.value))}
        >
          {renderOptions({
            list: cvJobSpecs.filter((a)=>a.aplicavel[tipoEntidadeId]),
            loading: reading,
            placeholde: "Selecione o tipo de inspeção"
          })}
        </Form.Select>
      </Form.Group>

      {/* DESCRIÇÃO DO JOB */}
      {jobSpecsSelecionado && (
        <Alert variant="secondary">
          <strong>{jobSpecsSelecionado.nome}</strong>
          <div className="small mt-1">
            {jobSpecsSelecionado.descricao}
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
          <Modal.Title>{jobSpecsSelecionado?.nome}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Alert variant="secondary">
            {jobSpecsSelecionado?.instrucoes || "Siga as instruções da inspeção."}
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
