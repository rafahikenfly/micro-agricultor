import { useState } from "react";
import { Form, Button, } from "react-bootstrap";
import { monitorar, VARIANTE } from "micro-agricultor";
import { useMapaEngine } from "../MapaEngine";
import { useToast } from "../../../services/toast/toastProvider";
import { useAuth } from "../../../services/auth/authContext";
import { useCache } from "../../../hooks/useCache";

import { eventosService, mutacoesService } from "../../../services/historyService";
import { batchService } from "../../../services/batchService";
import { necessidadesService, entidadesService } from "../../../services/crudService";

import { renderOptions, StandardCard, StandardInput } from "../../../utils/formUtils";
import Loading from "../../../components/Loading";
import { pluralizar } from "../../../utils/uiUtils";

export default function MonitoramentoPorEntidade({ entidades, tipoEntidadeId, stringTimestamp }) { 
  if (!entidades || entidades.length === 0) return null
  const { user } = useAuth();
  const { setShowPainel } = useMapaEngine();
  const { toastMessage } = useToast();
  const { cacheCaracteristicas, reading } = useCache(["caracteristicas"]);

  const [form, setForm] = useState({});
  const [writing, setWriting] = useState(false);

  const caracteristica = cacheCaracteristicas?.map.get(form.caracteristicaId)

  const preparaMonitorar = async () => {
    
    // Recupera o timestamp
    const date = new Date(stringTimestamp);
    const timestamp = date.getTime();

    // Recupera as medidas do formulário
    // O form do monitoramento por entidade não carrega a entidade, apenas os valores
    // form = {[caracteristicaId]: {valor, confianca}}
    const medidas = {};
    for (const [entidadeId, dados] of Object.entries(form)) {
      if (!dados.atualizar) continue

      medidas[entidadeId] = {
        [form.caracteristicaId]: {
          valor: dados.valor,
          confianca: dados.confianca,
        }
      };
    }
    
    // Verifica se há alguma medida para atualizar
    function countCaracteristicas(medidas) {
      const set = new Set();

      for (const caracteristicas of Object.values(medidas)) {
        if (!caracteristicas) continue;

        for (const caracteristicaId of Object.keys(caracteristicas)) {
          set.add(caracteristicaId);
        }
      }

      return set.size;
    }
    const totalCaracteristicasMonitoradas = countCaracteristicas(medidas)
    if (totalCaracteristicasMonitoradas === 0) {
      toastMessage({
        body: "Selecione ao menos uma característica para atualizar.",
        variant: VARIANTE.YELLOW.variant,
      });
      return;
    }
    
    // Recupera o tipoEntidadeId
    // no monitoramento por característica, tipoEntidadeId é recebido como parâmetro
    if (!tipoEntidadeId) {
      toastMessage({
        body: "Erro registrando o monitoramento. Tipo de entidade indefinido.",
        variant: VARIANTE.RED.variant,
      })
      return;
    }

    // Monta o array de entidades
    // no monitoramento por entidade, a entidade é recebidas como parâmetro (único elemento do array)
    if (!entidades || entidades.length === 0) {
      toastMessage({
        body: "Erro registrando o monitoramento. Nenhuma entidade selecionada.",
        variant: VARIANTE.RED.variant,
      })
      return;
    }
    
    //TODO DAQUI PRA BAIXO!
    // Processa os monitoramentos com user, tipoEntidadeId, entidades, medidas e timestamp
    setWriting(true);
    try {
     await monitorar({
        tipoEntidadeId,
        entidades,
        medidas,
        timestamp,
        user,
        services: {
          batch: batchService,
          eventos: eventosService,
          entidade: entidadesService(tipoEntidadeId),
          mutacoes: mutacoesService,
          necessidades: necessidadesService,
        }
      })

      //TODO: verificar todas as tarefas afetadas e se alguma foi concluída.
      // se sim, concluir:
      /**
        concluirTarefa({
          tarefa,
          resolucao: {
            tipoResolucao: RESOLVE_TYPES.MONITOR,
            dataConclusao: timestamp,
            agente: {
              tipo: SOURCE_TYPES.USER,
              id: user.id,  
            },
          },
          user,
          tarefasService,
        })
      */
     
      //Limpa seleção
      setForm({});
      toastMessage({
        body: `Registrado o monitoramento de ${totalCaracteristicasMonitoradas} ${pluralizar(totalCaracteristicasMonitoradas,"característica")} de ${entidades.length} ${pluralizar(totalCaracteristicasMonitoradas,tipoEntidadeId)}.`,
        variant: VARIANTE.GREEN.variant,
      });
      setShowPainel(false);
    } catch (err) {
      console.error(err)
      toastMessage({
        body: `Erro ao registrar monitoramento.`,
        variang: VARIANTE.RED.variant,
      });
    } finally {
      setWriting(false);
    }
  }

  if (reading) return <Loading variant="overlay"/>
  return (
    <>
      <StandardInput label="Característica" width="120px">
        <Form.Select
        value={form.caracteristicaId || ""}
        onChange={(e) => setForm({...form, caracteristicaId: e.target.value})}
        >
        {renderOptions({
            list: (cacheCaracteristicas?.list ?? []).filter((c)=>c.aplicavel[tipoEntidadeId]),
            loading: reading,
            placeholder: "Selecione a característica",
        })}
        </Form.Select>
      </StandardInput>

      {form.caracteristicaId && entidades.map((entidade) => {
        // Recupera valor atual do form, associando padrão se não tiver nada
        // TODO: recuperar valor atual se disponível
        const item = form?.[entidade.id] ?? { atualizar: false, valor: 0, confianca: 100 };
        return (
          <StandardCard
            key={entidade.id}
            header={entidade.nome}
            headerRight={
              <Form.Check
                type="switch"
                label="Atualizar"
                checked={item.atualizar}
                onChange={(e) =>
                  setForm({...form, [entidade.id]: {...item, atualizar: e.currentTarget.checked}})
                }
              />
            }
          >
            <StandardInput
              label="Valor"
              unidade={caracteristica?.medida.unidade ?? "-"}
              unidadeWidth="80px">
              <Form.Control
                type="number"
                value={item.valor}
                min={caracteristica?.medida.unidade.min || 0}
                max={caracteristica?.medida.unidade.max || 1024}
                onChange={(e) =>
                    setForm({
                    ...form,
                    [entidade.id]: {
                      ...item,
                      valor: Number(e.currentTarget.value),
                      atualizar: true,
                    }
                    })
                }
              />
            </StandardInput>
            <StandardInput label="Confiança" unidade="%" unidadeWidth="80px">
              <Form.Control
                type="number"
                min={0}
                max={100}
                value={item.confianca}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [entidade.id]: {
                      ...item,
                      confianca: Math.min(100, Math.max(0, Number(e.currentTarget.value))),
                      atualizar: true,
                    }
                  })
                }
              />
            </StandardInput>
          </StandardCard>
        )
      })}
      {form.caracteristicaId && <Button
        variant="success"
        className="mt-3 w-100"
        disabled={writing || !form.caracteristicaId}
        onClick={preparaMonitorar}
      >
        {writing ? "Aplicando monitoramento..."
          : `Monitorar ${caracteristica?.nome}`
        }
      </Button>}
    </>
  );
}
