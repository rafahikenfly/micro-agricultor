import { useEffect, useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { catalogosService } from "../../services/catalogosService";
import { renderOptions } from "../../utils/formUtils";
import { manejarCanteiro, monitorarCanteiro } from "../../domain/canteiro.rules";
import { manejarPlanta} from "../../domain/planta.rules";
import { useAuth } from "../../services/auth/authContext";
import { canteirosService } from "../../services/crud/canteirosService";
import { plantasService } from "../../services/crud/plantasService";
import { eventosService, } from "../../services/crud/eventosService";
import { historicoEfeitosService, } from "../../services/crud/historicoEfeitosService";
import { calcularEfeitosDoEvento, montarLogEvento } from "../../domain/evento.rules";
import { db } from "../../firebase";

export default function ManejarTab({ entidade, tipoEntidadeId, showToast }) {
  const { user } = useAuth();
  const [manejos, setManejos] = useState([]);
  const [manejoSelecionado, setManejoSelecionado] = useState(null);
  const [form, setForm] = useState({});
  const [reading, setReading] = useState(false);
  const [writing, setWriting] = useState(false);


  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getManejos(),
    ]).then(([mans,]) => {
      if (!ativo) return;
  
      setManejos(mans);
      setReading(false);
    });
  
    return () => { ativo = false };
  }, []);

  const selecionarManejo = (manejo) => {
    setManejoSelecionado(manejo);
    setForm({});
  };

  const aplicarManejo = async () => {
    setWriting(true);
    try {
      // Cria o eventoRef imediatamente para obter Id e monta o log (sem efeitos)
      let batch = db.batch();
      let opCount = 0;
      let entidadeManejada
      let entidadeRef
      const eventoRef = eventosService.criarRef()
      const evento = montarLogEvento({
        data: {
          manejoId: manejoSelecionado.id,
          manejoNome: manejoSelecionado.nome,
          efeitos: [],
        },
        tipoEventoId: "manejo",
        alvos: [{id: entidade.id, tipoEntidadeId: tipoEntidadeId}],
        origemId: user.id,
        origemTipo: "usuario",
      })

      // Aplica o monitoramento conforme o tipo de entidade
      // REPETIR DAQUI PARA MULTIPLAS ENTIDADES
      if (tipoEntidadeId === "canteiro") {
        entidadeManejada = manejarCanteiro ({
          canteiro: entidade,
          manejo: manejoSelecionado,
          eventoId: eventoRef.id
        });
        entidadeRef = canteirosService.forParent(entidade.hortaId).getRefById(entidade.id);
      } else if (tipoEntidadeId === "planta") {
        entidadeManejada = manejarPlanta ({
          planta: entidade,
          manejo: manejoSelecionado,
          eventoId: eventoRef.id
        });
        entidadeRef = plantasService.getRefById(entidade.id);;
      } else {
        console.error (`Tipo de entidade ${tipoEntidadeId} inválida para monitoramento`)
        showToast(`Monitoramento de entidade ${tipoEntidadeId} inválido.`, "danger");
        return;
      }

      // Calcula os efeitos da entidade monitorada
      const efeitosDoManejo = calcularEfeitosDoEvento({
        entidadeId: entidade.id,
        eventoId: eventoRef.id,
        tipoEventoId: "manejo",
        estadoAntes: entidade?.estadoAtual || {},
        estadoDepois: entidadeManejada?.estadoAtual || {},
        tipoEntidadeId : tipoEntidadeId,
      })
      // Se há efeitos no canteiro
      if (efeitosDoManejo.length) {
        // Atualiza estadoAtual da entidade pelo batch
        if (tipoEntidadeId === "canteiro") canteirosService.forParent(entidade.hortaId).batchUpdate(entidadeRef, { estadoAtual: entidadeManejada.estadoAtual, }, user, batch);
        if (tipoEntidadeId === "planta")   plantasService.batchUpdate(entidadeRef, { estadoAtual: entidadeManejada.estadoAtual, }, user, batch);
        opCount++;
      
        // Denormalização efeitos para o histórico e inclui historicoEfeitos no batch
        efeitosDoManejo.forEach((efeito) => {
          historicoEfeitosService.batchCreate(efeito, user, batch);
          opCount++;
        });
      }

      // REPETIR ATÉ AQUI PARA MULTIPLAS ENTIDADES
      // Adiciona os efeitos do canteiro ao evento e prepara para commit se há efeitos
      evento.efeitos = [...evento.efeitos, ...efeitosDoManejo]
      // Atualiza o evento pelo batch se houver efeitos
      eventosService.batchUpsert(eventoRef, evento, user, batch);
      opCount++;

      // Commit
      await batch.commit();
        showToast(opCount > 0 ? 
          `Manejo de ${entidade.nome} registrado com sucesso.` :
          `Nenhuma alteração detectada em ${entidade.nome}.`);

      //Limpa seleção
      setForm({});
      setManejoSelecionado(null);
    } catch (err) {
      console.error(err)
      showToast(`Erro ao salvar manejo de ${entidade.nome}: ${err}. Tente novamente.`, "danger");
    } finally {
      setWriting(false);
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
            list: manejos.filter( (m) => m.tipoEntidade === tipoEntidadeId),
            loading: reading,
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

        QUANDO PRECISAR DE ENTRADAS DO USUÁRIO, DESCOMENTAR ESSA PARTE
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
            disabled={writing}
            onClick={aplicarManejo}
          >
            {writing ? "Aplicando manejo..." : "Aplicar manejo"}
          </Button>
        </>
      )}
    </div>
  );
}
