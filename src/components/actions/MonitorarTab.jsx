import { useEffect, useState } from "react";
import { Form, Button, InputGroup, } from "react-bootstrap";
import { catalogosService } from "../../services/catalogosService";
import { db, timestamp } from "../../firebase";

export default function MonitorarTab({ entidade, tipoEntidade, user, showToast }) {
  const [caracteristicas_canteiro, setCaracteristicas_canteiro] = useState([]);
  const [caracteristicas_planta, setCaracteristicas_planta] = useState([]);
  const [form, setForm] = useState({});
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);


  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    let ativo = true;
    setLoadingCatalogos(true);
  
    Promise.all([
      catalogosService.getCaracteristicas_canteiro(),
      catalogosService.getCaracteristicas_planta(),
    ]).then(([canc,plnc]) => {
      if (!ativo) return;
      setCaracteristicas_canteiro(canc);
      setCaracteristicas_planta(plnc);
      setLoadingCatalogos(false);
    });
  
    return () => { ativo = false };
  }, []);

const aplicarInspecao = async () => {
  try {
    const medidas = {};

    Object.entries(form).forEach(([caracteristicaId, dados]) => {
      if (dados.atualizar) {
        medidas[caracteristicaId] = {
          valor: dados.valor,
          confianca: dados.confianca,
        };
      }
    });

    if (Object.keys(medidas).length === 0) {
      showToast("Selecione ao menos uma característica para atualizar.", "danger");
      return;
    }

    const data = {
      medicoes: medidas,
      origem: "usuario",
      createdAt: timestamp(),
      usuarioId: user?.id ?? null,
      schemaVersion: 1
    };

    let medicoesRef;

    if (tipoEntidade === "Canteiro") {
      medicoesRef = db
        .collection("hortas")
        .doc(entidade.hortaId)
        .collection("canteiros")
        .doc(entidade.id)
        .collection("medicoes");
    } else if (tipoEntidade === "Planta") {
      medicoesRef = db
        .collection("plantas")
        .doc(entidade.id)
        .collection("medicoes");
    } else {
      showToast("Tipo de entidade inválido.", "danger");
    }

    await medicoesRef.add(data);
    setForm({});
    showToast("Medição registrada com sucesso.");

  } catch (error) {
    showToast("Erro ao salvar a medição. Tente novamente.", "danger");
  }
};

  const caracteristicasArr = tipoEntidade === "Canteiro" ? 
                                caracteristicas_canteiro :
                                tipoEntidade === "Planta" ?
                                caracteristicas_planta :
                                [];
  return (
    <div className="p-3"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
          {caracteristicasArr.map((c) => {
            const item = form[c.id] ?? { valor: 0, atualizar: false };
            return (
              <Form.Group className="mb-2" key={c.id}>
                <Form.Label>
                  {c.nome}
                </Form.Label>
                <InputGroup>
                  <Form.Check
                    label="Atualizar"
                    checked={item.atualizar}
                    onChange={(e) => setForm({...form, [c.id]: {...item, atualizar: e.currentTarget.checked}})}
                  />
                  <Form.Control
                    type="number"
                    value={item.valor}
                    onChange={(e) => setForm({...form, [c.id]: {...item, valor: Number(e.currentTarget.value), atualizar: true}})}
                  />
                  <InputGroup.Text>{c.unidade || "un"}</InputGroup.Text>
                  <Form.Control
                    type="number"
                    min={0}
                    max={100}
                    title="Confiança (0–100)"
                    value={item.confianca || 100}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [c.id]: {
                          ...item,
                          confianca: Math.min(100, Math.max(0, Number(e.currentTarget.value)))
                        }
                      })
                    }
                    style={{ maxWidth: 90 }}
                  />
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            )
          })}
      <Button
        variant="success"
        className="mt-3 w-100"
        disabled={loadingCatalogos}
        onClick={aplicarInspecao}
      >
        Aplicar inspeção
      </Button>
    </div>
  );
}
