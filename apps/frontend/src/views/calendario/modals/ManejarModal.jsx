import { useEffect, useState } from "react"
import { Button, Form, Modal } from "react-bootstrap"
import { renderOptions, StandardCard, StandardInput } from "../../../utils/formUtils";
import { toDateTimeLocal } from "../../../utils/dateUtils";

import { useToast } from "../../../services/toast/toastProvider";
import { useAuth } from "../../../services/auth/authContext";
import { useCalendarioEngine } from "../CalendarioEngine";
import { eventosService, mutacoesService } from "../../../services/historyService";
import { necessidadesService, entidadesService } from "../../../services/crudService";

import { ENTIDADE } from "micro-agricultor";
import { useCache } from "../../../hooks/useCache";

const processarManejo = () => {console.warn("UNDER REVIEW")};

export const ManejarModal = ({show, data, onClose }) => {
  if (!show) return null

  const { toastMessage } = useToast();
  const { user } = useAuth();
  const { cacheCaracteristicas, cacheManejos, cacheCanteiros, cachePlantas, reading } = useCache([
    "caracteristicas",
    "manejos",
    "canteiros",
    "plantas",
  ])
  const engine = useCalendarioEngine();
  

  const [stringTimestamp, setStringTimestamp] = useState(toDateTimeLocal(new Date()));

  const [form, setForm] = useState({})
  
  const [caracteristica, setCaracteristica] = useState({})
  const [manejoSelecionado, setManejo] = useState({})
  const [writing, setWriting] = useState(false)

  // Constroi os dados do formulário
  useEffect(()=>{
    const formData = {}
    for (const entidadeId of (data.contexto.entidadesId ?? [])) {
      formData[entidadeId] = {
        manejar: false,
      }
      //TODO: criar as entradas conforme manejo.entradas
    }
    setForm(formData)
  },[data])

  useEffect(()=>{
    const caracteristicaManejada = 
      cacheCaracteristicas?.map.get(data?.contexto?.caracteristicaId)
    setCaracteristica(caracteristicaManejada)
  }, [data, cacheCaracteristicas])

  const catalogMap = {
    [ENTIDADE.canteiro.id]: cacheCanteiros?.list,
    [ENTIDADE.planta.id]: cachePlantas?.list,
  }

  const manejar = async (evt) => {    
    evt.preventDefault()
    // Recupera o timestamp
    const date = new Date(stringTimestamp);
    const timestamp = date.getTime();

    // Recupera as intervencoes, devolvendo o objeto {[entidadeId]: {entradas: [entradas]}}
    const intervencoes = Object.fromEntries(
      Object.entries(form)
        // pegar apenas objetos válidos
        .filter(([_, v]) => typeof v === "object" && v !== null)
        // manter apenas entidades com manejar === true
        .filter(([_, dados]) => dados?.manejar === true)
        // mapear para o formato final
        .map(([entidadeId, dados]) => [
          entidadeId,
          {entradas: dados.entradas ?? []}
        ])
    );


    // Verifica se há alguma medida para atualizar
    if (Object.keys(intervencoes).length === 0) {
      toastMessage({
        body: "Selecione ao menos uma entidade para manejar.",
        variant: VARIANTE.YELLOW.variant});
      return;
    }


    // Recupera o tipoEntidadeID
    const tipoEntidadeId = data.contexto.tipoEntidadeId
    if (!tipoEntidadeId) {
      toastMessage({
        body: "Erro registrando o manejo",
        variant: VARIANTE.RED.variant,
      })
      return;
    }

    // Monta o array de entidades
    const entidades = catalogMap[tipoEntidadeId].filter(d => intervencoes?.[d.id]);

    // Processa os monitoramentos com user, tipoEntidadeId, entidades, medidas e timestamp
    setWriting(true);
    try {
      await processarManejo({
        user,
        tipoEntidadeId,
        timestamp,
        intervencoes,
        entidades,
        manejo: manejoSelecionado,
        services: {
          eventos: eventosService,
          entidade: entidadesService(data.contexto.tipoEntidadeId),
          historicoEfeitos: mutacoesService,
          necessidades: necessidadesService,
        }
      })
      //Conclui a tarefa
      //TODO

      //Fecha modal
        toastMessage({
          body: `Manejo de ${entidades.length > 1 ? `${entidades.length} ${data.contexto.tipoEntidadeId}s`: entidades[0].nome} registrado com sucesso.`,
          variant: VARIANTE.GREEN.variant,
        });
      } catch (err) {
        console.error(err)
        toastMessage({
          body: `Erro ao registrar manejo.`,
          variant: VARIANTE.RED.variant
        });
      } finally {
        setWriting(false);
        engine.setShowModalManejar(false);
      }
  }

  const manejoDesativado = (manejo) => {
    return !manejo.efeitos?.some(item => item.caracteristicaId === data?.contexto?.caracteristicaId) ?? false
  }

  //TODO: NA MUDANÇA DO PARAMETRO, MUDAR TAMBÉM O ATUALIZAR
  return (
    <Modal show={show} onHide={onClose}>
      <Form onSubmit={(evt)=>manejar(evt)}>
        <Modal.Header closeButton>
          <Modal.Title>Manejar {caracteristica?.nome}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
        <StandardInput label="Data/hora" width="120px">
          <Form.Control
            type="datetime-local"
            value={stringTimestamp}
            onChange={(e)=> setStringTimestamp(e.target.value)}
          />
        </StandardInput>
        <StandardInput label="Manejo" width="120px">
          <Form.Select
            value={manejoSelecionado.id || ""}
            onChange={(e) => setManejo(cacheManejos?.map.get(e.target.value))}
          >
            {renderOptions({
              list: cacheManejos?.list,
              loading: reading,
              placeholder: "Selecione o manejo",
              isOptionDisabled: manejoDesativado,
            })}
          </Form.Select>
        </StandardInput>
        {manejoSelecionado.id && data?.contexto?.entidadesId?.map((entidadeId, i) => (
        <StandardCard
          key={entidadeId}
          header={catalogMap[data.contexto.tipoEntidadeId].find((ent) => ent.id === entidadeId).nome ?? entidadeId}
          headerRight={
              <Form.Check
                type="switch"
                label="Manejar"
                className="mb-0"
                checked={!!form[entidadeId]?.manejar}
                onChange={(e) => setForm({  ...form, [entidadeId]: {...form[entidadeId], manejar: e.target.checked} }) }
              />
            }
            >
            {manejoSelecionado.entradas?.map((entrada,idx)=> (
              <StandardInput
                key={`entrada-${idx}`}
                label={entrada.nome}
              >
                <Form.Control
                  type={entrada.tipo ?? "number"}
                  value={0}
                />
                </StandardInput>
            ))}
        </StandardCard>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="success" type="submit">{writing ? "Manejando..." : "Manejar"}</Button>
      </Modal.Footer>
      </Form>
    </Modal>

  )
}