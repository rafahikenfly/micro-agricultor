import { useEffect, useState } from "react"
import { Button, Form, Modal } from "react-bootstrap"
import { renderOptions, StandardCard, StandardInput } from "../../../utils/formUtils";
import { toDateTimeLocal } from "../../../utils/dateUtils";
import { RESOLVE_TYPES } from "@shared/types/RESOLVE_TYPES";
import { SOURCE_TYPES } from "@shared/types/SOURCE_TYPES";
import { VARIANT_TYPES } from "@shared/types/VARIANT_TYPES";
import { canteirosService } from "../../../services/crud/canteirosService";
import { plantasService } from "../../../services/crud/plantasService";
import { ENTITY_TYPES } from "@shared/types/ENTITY_TYPES";
import { useToast } from "../../../services/toast/toastProvider";
import { processarManejo } from "@shared/aplication/manejo";
import { useAuth } from "../../../services/auth/authContext";
import { useCalendarioEngine } from "../CalendarioEngine";
import { necessidadesService } from "../../../services/crud/necessidadesService";
import { historicoEfeitosService } from "../../../services/history/efeitosService";
import { eventosService } from "../../../services/history/eventosService";
import { concluirTarefa } from "@shared/aplication/tarefas.application";
import { tarefasService } from "../../../services/crud/tarefasService";

export const ManejarModal = ({show, tarefa, onClose, caracteristicas, manejos, canteiros, plantas, loading}) => {
  if (!show) return null

  const { toastMessage } = useToast();
  const { user } = useAuth();
  const engine = useCalendarioEngine();
  

  const [stringTimestamp, setStringTimestamp] = useState(toDateTimeLocal(new Date()));

  const [form, setForm] = useState({})
  
  const [caracteristica, setCaracteristica] = useState({})
  const [manejoSelecionado, setManejo] = useState({})
  const [writing, setWriting] = useState(false)

  // Constroi os dados do formulário
  useEffect(()=>{
    const formData = {}
    for (const entidadeId of (tarefa.contexto.entidadesId ?? [])) {
      formData[entidadeId] = {
        manejar: false,
      }
      //TODO: criar as entradas conforme manejo.entradas
    }
    setForm(formData)
  },[tarefa])

  useEffect(()=>{
    const caracteristicaManejada = 
      caracteristicas.find((c)=>c.id === tarefa?.contexto?.caracteristicaId)
    setCaracteristica(caracteristicaManejada)
  }, [tarefa])

  const catalogMap = {
    [ENTITY_TYPES.CANTEIRO]: canteiros,
    [ENTITY_TYPES.PLANTA]: plantas,
  }
  const servicesMap = {
    [ENTITY_TYPES.CANTEIRO]: canteirosService,
    [ENTITY_TYPES.PLANTA]: plantasService,
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
        variant: VARIANT_TYPES.YELLOW});
      return;
    }


    // Recupera o tipoEntidadeID
    const tipoEntidadeId = tarefa.contexto.tipoEntidadeId
    if (!tipoEntidadeId) {
      toastMessage({
        body: "Erro registrando o manejo",
        variant: VARIANT_TYPES.RED,
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
          entidade: servicesMap[tarefa.contexto.tipoEntidadeId],
          historicoEfeitos: historicoEfeitosService,
          necessidades: necessidadesService,
        }
      })
      //Conclui a tarefa
      concluirTarefa({
        tarefa,
        resolucao: {
          tipoResolucao: RESOLVE_TYPES.HANDLED,
          dataConclusao: timestamp,
          agente: {
            tipo: SOURCE_TYPES.USER,
            id: user.id,  
          },
        },
        user,
        tarefasService,
      })
      //Fecha modal
        toastMessage({
          body: `Manejo de ${entidades.length > 1 ? `${entidades.length} ${tarefa.contexto.tipoEntidadeId}s`: entidades[0].nome} registrado com sucesso.`,
          variant: VARIANT_TYPES.GREEN,
        });
      } catch (err) {
        console.error(err)
        toastMessage({
          body: `Erro ao registrar manejo.`,
          variant: VARIANT_TYPES.RED
        });
      } finally {
        setWriting(false);
        engine.setShowModalManejar(false);
      }
  }

  const manejoDesativado = (manejo) => {
    return !manejo.efeitos?.some(item => item.caracteristicaId === tarefa?.contexto?.caracteristicaId) ?? false
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
            onChange={(e) => setManejo(manejos.find((c)=>c.id === e.target.value))}
          >
            {renderOptions({
              list: manejos,
              loading: loading,
              placeholder: "Selecione o manejo",
              isOptionDisabled: manejoDesativado,
            })}
          </Form.Select>
        </StandardInput>
        {manejoSelecionado.id && tarefa?.contexto?.entidadesId?.map((entidadeId, i) => (
        <StandardCard
          key={entidadeId}
          header={catalogMap[tarefa.contexto.tipoEntidadeId].find((ent) => ent.id === entidadeId).nome ?? entidadeId}
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
            {!manejoSelecionado.temEntradas && <>Nenhuma entrada para {manejoSelecionado.nome}</>}
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