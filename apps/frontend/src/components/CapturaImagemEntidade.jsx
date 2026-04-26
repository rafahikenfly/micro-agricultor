import { useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { StandardInput } from "../utils/formUtils";
import { useMapaEngine } from "../views/mapa/MapaEngine";
import { VARIANTE } from "micro-agricultor";

export default function CapturaImagemEntidade({
  onCancel,
  onCapture,

  entidade,
  ativa = true,
}) {
  const { activeTool } = useMapaEngine();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [blob, setBlob] = useState(null);
  const [descricao, setDescricao] = useState("");

  /* ================= CAMERA ================= */
  useEffect(() => {
    let cancelled = false;
    if (!ativa || activeTool !== "fotografar" || !entidade?.id) { //TODO: hoje apenas a ferramenta fotografar usa a camera
      stopCamera();
      return;
    }
        
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false
        });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.error("Erro câmera:", err);
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      stopCamera();
    }
  }, [ativa, activeTool, entidade?.id]);

  function stopCamera() {
    const video = videoRef.current;
    const stream = video?.srcObject;

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    if (video) {
      video.srcObject = null;
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
  function confirmar() {
    if (!blob) return;

    onCapture?.({
      blob,
      previewUrl,
      descricao
    });

    setPreviewUrl(null);
    setBlob(null);

  };
  function refazer() {
    setPreviewUrl(null);
    setBlob(null);
    setDescricao("");
  }
  /* ================= RENDER ================= */
  return (
    <div style={{ padding: 16 }}>
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
        <StandardInput label="Descrição" stacked>
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

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Button variant={VARIANTE.GREY.variant} onClick={onCancel}>Cancelar</Button>

        {!previewUrl ?
          <Button variant={VARIANTE.GREEN.variant} disabled={!entidade?.id} onClick={capturar}>Capturar</Button>
        : <>
            <Button variant={VARIANTE.RED.variant} onClick={refazer}>Refazer</Button>
            <Button variant={VARIANTE.GREEN.variant} onClick={confirmar}>Confirmar</Button>
          </>
        }
      </div>

    </div>
  );
}