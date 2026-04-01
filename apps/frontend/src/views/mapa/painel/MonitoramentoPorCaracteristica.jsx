import { useState } from "react";
import { Form, Button, } from "react-bootstrap";
import { useAuth } from "../../../services/auth/authContext";
import Loading from "../../../components/Loading";
import { ENTIDADE, monitorar, VARIANT_TYPES } from "micro-agricultor";
import { canteirosService } from "../../../services/crud/canteirosService";
import { plantasService } from "../../../services/crud/plantasService";
import { necessidadesService } from "../../../services/crud/necessidadesService";
import { eventosService, mutacoesService } from "../../../services/historyService";
import { batchService } from "../../../services/batchService";

import { useMapaEngine } from "../MapaEngine";
import { useCache } from "../../../hooks/useCache";

import { StandardCard, StandardInput } from "../../../utils/formUtils";
import { useToast } from "../../../services/toast/toastProvider";
import { pluralizar } from "../../../utils/uiUtils";

export default function MonitoramentoPorCaracteristica({ entidades, tipoEntidadeId, stringTimestamp }) { 
  if (!entidades || entidades.length === 0) return null
  const { user } = useAuth();
  const { setShowPainel } = useMapaEngine();
  const { toastMessage } = useToast();
  const { catalogoCaracteristicas, reading } = useCache(["caracteristicas"]);

  const [form, setForm] = useState({});
  const [writing, setWriting] = useState(false);

  const preparaMonitorar = async () => {
    
    // Recupera o timestamp
    const date = new Date(stringTimestamp);
    const timestamp = date.getTime();

    // Recupera as medidas do formulário
    // O form do monitoramento por característica não carrega a entidade, apenas os valores
    // form = {[caracteristicaId]: {valor, confianca}}
    const medidas = {};
    for (const [caracteristicaId, dados] of Object.entries(form)) {
      if (!dados.atualizar) continue;

      for (const entidade of entidades) {
        if (!medidas[entidade.id]) {
          medidas[entidade.id] = {};
        }

        medidas[entidade.id][caracteristicaId] = {
          valor: dados.valor,
          confianca: dados.confianca,
        };
      }
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
        variant: VARIANT_TYPES.YELLOW,
      });
      return;
    }
    
    // Recupera o tipoEntidadeId
    // no monitoramento por característica, tipoEntidadeId é recebido como parâmetro
    if (!tipoEntidadeId) {
      toastMessage({
        body: "Erro registrando o monitoramento. Tipo de entidade indefinido.",
        variant: VARIANT_TYPES.RED,
      })
      return;
    }

    // Monta o array de entidades
    // no monitoramento por caracteristica, as entidades são recebidas como parâmetro
    if (!entidades || entidades.length === 0) {
      toastMessage({
        body: "Erro registrando o monitoramento. Nenhuma entidade selecionada.",
        variant: VARIANT_TYPES.RED,
      })
      return;
    }
    
    // Processa os monitoramentos com user, tipoEntidadeId, entidades, medidas e timestamp
    setWriting(true);
    const servicesMap = {
      [ENTIDADE.canteiro.id]: canteirosService,
      [ENTIDADE.planta.id]: plantasService,
    }
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
          entidade: servicesMap[tipoEntidadeId],
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
        variant: VARIANT_TYPES.GREEN,
      });
      setShowPainel(false);
    } catch (err) {
      console.error(err)
      toastMessage({
        body: `Erro ao registrar monitoramento.`,
        variang: VARIANT_TYPES.RED,
      });
    } finally {
      setWriting(false);
    }
  }

  if (reading) return <Loading variant="overlay"/>
  return (
    <>
      {(catalogoCaracteristicas?.list ?? []).filter(c => c.aplicavel?.[tipoEntidadeId] === true).map((caracteristica) => {
        const item = form[caracteristica.id] ?? { valor: 0, atualizar: false, confianca: 100 };
        return (
          <StandardCard
            key={caracteristica.id}
            header={caracteristica.nome}
            headerRight={
              <Form.Check
                type="switch"
                label="Atualizar"
                checked={item.atualizar}
                onChange={(e) =>
                  setForm({...form, [caracteristica.id]: {...item, atualizar: e.currentTarget.checked}})
                }
              />
            }
          >
            <StandardInput label="Valor" width="120px" unidade={caracteristica.unidade} unidadeWidth="80px">
              <Form.Control
                type="number"
                value={item.valor}
                min={caracteristica.min || 0}
                max={caracteristica.max || 1024}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [caracteristica.id]: {
                      ...item,
                      valor: Number(e.currentTarget.value),
                      atualizar: true,
                    }
                  })
                }
              />
            </StandardInput>
            <StandardInput label="Confiança" width="120px" unidade="%" unidadeWidth="80px">
              <Form.Control
                type="number"
                min={0}
                max={100}
                value={item.confianca}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [caracteristica.id]: {
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
      <Button
        variant="success"
        className="mt-3 w-100"
        disabled={writing || entidades.length === 0}
        onClick={preparaMonitorar}
      >
        {writing ? "Aplicando monitoramento..."
          : "Aplicar monitoramento"
        }
      </Button>
    </>
  );
}
