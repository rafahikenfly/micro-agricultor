import React, { useEffect, useRef, useState } from "react";
import { db, storage, timestamp } from "../firebase";
import { Form, FormGroup, FormLabel, FormSelect, InputGroup } from "react-bootstrap";

export default function NovoCVJob() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [plantas, setPlantas] = useState([]);
  const [plantaSelecionada, setPlantaSelecionada] = useState("");
  const [cvJobs, setCVJobs] = useState([]);
  const [jobSelecionado, setJobSelecionado] = useState("");
  const [loading, setLoading] = useState(false);

  // Carrega dados
  useEffect(() => {
    async function loadPlantas() {
    const snapshot = await db.collection("plantas").get();
  
    setPlantas(
      snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  }
  loadPlantas();
  }, []);

  useEffect(() => {
    async function loadCVJobs() {
    const snapshot = await db.collection("cvJobs").get();
  
    setCVJobs(
      snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  }
  
  loadCVJobs();
  }, []);

  // 🔹 Ativar câmera
  useEffect(() => {
    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      videoRef.current.srcObject = stream;
    }
    startCamera();
  }, []);

  async function criaCVJob() {
    if (!plantaSelecionada) {
      alert("Selecione uma planta");
      return;
    }
    if (!jobSelecionado) {
      alert("Selecione um tipo de tarefa");
      return;
    }

    setLoading(true);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const blob = await new Promise(resolve =>
      canvas.toBlob(resolve, "image/jpeg", 0.9)
    );

    const localTimestamp = Date.now();
    const imagePath = `cvQueue/${plantaSelecionada}_${localTimestamp}.jpg`;

    // Upload da imagem
    const imageRef = storage.ref(imagePath);
    await imageRef.put(blob);
    

    // Criar job na fila
    await db.collection("cvQueue").add({
        plantaId: plantaSelecionada,
        plantaNome: plantas.find(p => p.id === plantaSelecionada)?.nome || "",
        jobId: jobSelecionado,
        jobNome:  cvJobs.find(j => j.id === jobSelecionado)?.nome || "",
        imagePath,
        timestamp: localTimestamp,
        status: "pending",
        source: "web",
        createdAt: timestamp(),
    });

    setLoading(false);
    alert("Tarefa de visão computacional enviada para a fila!");
  }

  return (
    <div>
      <h2>Capturar imagem da planta</h2>
      <Form>
        <InputGroup>
        <FormGroup>
            <FormLabel>Planta</FormLabel>
            <FormSelect
                value={plantaSelecionada}
                onChange={e => setPlantaSelecionada(e.target.value)}
            >
                <option value="">Selecione</option>
                {plantas.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
            </FormSelect>
          </FormGroup>
          <FormGroup>
            <FormLabel>Tarefa de Visão Computacional</FormLabel>
            <FormSelect
                value={jobSelecionado}
                onChange={e => setJobSelecionado(e.target.value)}
            >
                <option value="">Selecione</option>
                {cvJobs.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
            </FormSelect>
        </FormGroup>
        </InputGroup>
      </Form>

      <div>
        <video ref={videoRef} autoPlay playsInline width="100%" />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      <button onClick={criaCVJob} disabled={loading}>
        {loading ? "Enviando..." : "Capturar foto"}
      </button>
    </div>
  );
}
