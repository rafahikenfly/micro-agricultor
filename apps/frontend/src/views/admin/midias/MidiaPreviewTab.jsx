import { useState } from "react";
import { Alert, Button, ButtonGroup } from "react-bootstrap";

import { storage } from "../../../firebase";
import { useToast } from "../../../services/toast/toastProvider";
import { MIME_TYPES, VARIANTE } from "micro-agricultor";
import { getImageDimensions } from "../../../utils/blobUtils";
import CapturaImagemEntidade from "../../../components/CapturaImagemEntidade";

async function salvarImagemStorage(blob, path) {
  const ref = storage.ref(path);
  await ref.put(blob);
  return ref.getDownloadURL();
}

/* async function getImageDimensions(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      resolve({
        largura: img.width,
        altura: img.height
      });
      URL.revokeObjectURL(url);
    };

    img.onerror = reject;
    img.src = url;
  });
}
 */
export default function MidiaPreviewTab({ midia, setForm }) {
  const { toastMessage } = useToast();

  const [showCaptura, setShowCaptura] = useState(false);

  const url = midia?.metadados?.url;
  const mime = MIME_TYPES[midia?.mimeType]?.nome;

  if (!url) {
    return (
      <>
      <div className="d-flex flex-column align-items-center gap-3 py-4">

        <div className="text-muted">
          Nenhuma mídia vinculada.
        </div>

        <ButtonGroup>

          <Button
            variant="success"
            onClick={() => setShowCaptura(true)}
          >
            📷 Capturar imagem
          </Button>

          <Button
            variant="outline-secondary"
            disabled
          >
            🎥 Capturar vídeo
          </Button>

          <Button
            variant="outline-secondary"
            disabled
          >
            🎤 Capturar áudio
          </Button>

          <Button
            variant="outline-secondary"
            disabled
          >
            ⬆ Upload documento
          </Button>

        </ButtonGroup>

      </div>

        <CapturaImagemEntidade
          entidade={{}}
          onClose={() => setShowCaptura(false)}
          onCapture={async ({ blob, previewUrl }) => {
            try {
              const { largura, altura } = await getImageDimensions(blob);
              const storagePath = `/midias/${midia.contexto.entidadeId === "" ? "NOT_DEFINED" : midia.contexto.entidadeId}/${Date.now()}`
              const url = await salvarImagemStorage(blob, storagePath);
              console.log (largura,altura)
              setForm({...midia, metadados: {
                  ...midia.metadados,
                  url,
                  storagePath,
                  bytes: blob.size,
                  largura,
                  altura
              }});
              toastMessage({body: "Imagem salva.", variant: VARIANTE.GREEN.variant})
            } catch (err) {
              toastMessage({body: "Falha ao salvar imagem.", variant: VARIANTE.RED.variant})
              console.error("Erro ao salvar imagem:", err);
            }
          }}
        />      
      </>
    )
  }

  if (mime?.startsWith("image/")) {
    return (
      <div className="text-center">
        <img
          src={url}
          alt={midia.nome || "imagem"}
          style={{
            maxWidth: "100%",
            maxHeight: "500px",
            objectFit: "contain"
          }}
        />
      </div>
    );
  }

  if (mime?.startsWith("video/")) {
    return (
      <video
        controls
        style={{
          width: "100%",
          maxHeight: "500px"
        }}
      >
        <source src={url} type={mime} />
        Seu navegador não suporta vídeo.
      </video>
    );
  }

  if (mime?.startsWith("audio/")) {
    return (
      <audio controls style={{ width: "100%" }}>
        <source src={url} type={mime} />
        Seu navegador não suporta áudio.
      </audio>
    );
  }

  return (
    <Alert variant="warning">
      Tipo de mídia não suportado para preview.
      <div className="mt-2">
        <a href={url} target="_blank" rel="noopener noreferrer">
          Abrir arquivo
        </a>
      </div>
    </Alert>
  );
}