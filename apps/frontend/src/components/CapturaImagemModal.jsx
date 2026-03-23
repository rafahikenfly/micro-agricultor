import { useEffect, useRef, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { StandardInput } from "../utils/formUtils";

export default function CapturaImagemModal({
  show,
  onClose,
  onCapture
}) {

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [blob, setBlob] = useState(null);
  const [descricao, setDescricao] = useState(null);

  /* ================= CAMERA ================= */

  useEffect(() => {
    if (!show) return;

    setCameraAtiva(true);

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Erro câmera:", err);
      }
    }

    startCamera();

    return () => stopCamera();
  }, [show]);

  function stopCamera() {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }

  /* ================= CAPTURA ================= */

  const capturar = () => {

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {

      if (!blob) return;

      stopCamera();

      const url = URL.createObjectURL(blob);

      setBlob(blob);
      setPreviewUrl(url);

    }, "image/jpeg", 0.9);
  };

  /* ================= CONFIRMAR ================= */

  function confirmar() {
    if (!blob) return;

    onCapture?.({
      blob,
      previewUrl,
      descricao
    });

    setPreviewUrl(null);
    setBlob(null);

    onClose();
  }

  /* ================= RENDER ================= */

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>

      <Modal.Header closeButton>
        <Modal.Title>Capturar imagem</Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {!previewUrl ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            width="100%"
            style={{ borderRadius: 8 }}
          />
        ) : (
          <>
          <img
            src={previewUrl}
            alt="Preview"
            style={{ width: "100%", borderRadius: 8 }}
          />
          <StandardInput label="Descrição">
            <Form.Control
              as="textarea"
              rows={3}
              value={descricao}
              onChange={e =>setDescricao(e.target.value)}
            />
          </StandardInput>
          </>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />

      </Modal.Body>

      <Modal.Footer>

        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>

        {!previewUrl ? (

          <Button variant="primary" onClick={capturar}>
            Capturar
          </Button>

        ) : (

          <>
            <Button
              variant="outline-secondary"
              onClick={() => {
                setPreviewUrl(null);
                setBlob(null);
                setCameraAtiva(true);
              }}
            >
              Refazer
            </Button>

            <Button variant="success" onClick={confirmar}>
              Confirmar
            </Button>
          </>
        )}

      </Modal.Footer>

    </Modal>
  );
}