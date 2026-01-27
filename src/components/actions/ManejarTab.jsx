import { useEffect, useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { db } from "../../firebase";
import { catalogosService } from "../../services/catalogosService";
import { renderOptions } from "../../utils/formUtils";
import { manejarCanteiro } from "../../domain/canteiro.rules";
import { manejarPlanta} from "../../domain/planta.rules";

export default function ManejarTab({ entidade, tipoEntidade }) {
  const [manejos, setManejos] = useState([]);
  const [manejoSelecionado, setManejoSelecionado] = useState(null);
  const [form, setForm] = useState({});
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);


  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    let ativo = true;
    setLoadingCatalogos(true);
  
    Promise.all([
      catalogosService.getManejos(),
    ]).then(([mans,]) => {
      if (!ativo) return;
  
      setManejos(mans);
      setLoadingCatalogos(false);
    });
  
    return () => { ativo = false };
  }, []);

  const selecionarManejo = (manejo) => {
    setManejoSelecionado(manejo);
    setForm({});
  };

  const aplicarManejo = async () => {
    setLoadingCatalogos(true);

    try {
      let entidadeManejada;
  
      if (tipoEntidade === "Canteiro") {
        entidadeManejada = manejarCanteiro(entidade, manejoSelecionado);
  
        await db
          .collection("canteiros")
          .doc(entidade.id)
          .update(entidadeManejada);
      }
  
      if (tipoEntidade === "Planta") {
        entidadeManejada = manejarPlanta(entidade, manejoSelecionado);
  
        await db
          .collection("plantas")
          .doc(entidade.id)
          .update(entidadeManejada);
      }
  
      // (opcional, mas altamente recomendado)
      await db.collection("manejosAplicados").add({
        tipoEntidade,
        entidadeId: entidade.id,
        manejoId: manejoSelecionado.id,
        manejoNome: manejoSelecionado.nome,
        snapshotAntes: entidade,
        snapshotDepois: entidadeManejada,
        timestamp: Date.now(),
      });
  
      setManejoSelecionado(null);
    } catch (err) {
      console.error("Erro ao aplicar manejo", err);
    } finally {
      setLoadingCatalogos(false);
    }
  };

  return (
    <div className="p-3"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <Form.Group className="mb-3">
        <Form.Label>Manejo</Form.Label>
        <Form.Select
          value={manejoSelecionado?.id ?? ""}
          onChange={(e) => selecionarManejo( manejos.find((m) => m.id === e.target.value) )}
        >
          {renderOptions({
            list: manejos.filter( (m) => m.tipoEntidade === tipoEntidade),
            loading: loadingCatalogos,
            placeholder: "Selecione o manejo",
          })}
        </Form.Select>
      </Form.Group>

      {manejoSelecionado && (
        <>
          <Alert variant="secondary">
            {manejoSelecionado.descricao}
          </Alert>

        {/*

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

          {manejoSelecionado?.entradas.map((en, idx) => (
            <Form.Group className="mb-2" key={en.idx}>
              <Form.Label>
                {en.nome}
              </Form.Label>
              {en.unidade &&
                <Form.Text muted>
                ({en.unidade})             
                </Form.Text>
              }
              <Form.Control
                type={en.tipo}
                required={en.obrigatorio}
                value={form[en.key]}
                onChange={(e) => onChange(idx, en.tipo === "number" ? Number(e.target.value) : e.target.value)}
              />
            </Form.Group>
          ))}
        */}
          <Button
            variant="success"
            className="mt-3 w-100"
            disabled={loadingCatalogos}
            onClick={aplicarManejo}
          >
            Aplicar manejo
          </Button>
        </>
      )}
    </div>
  );
}
