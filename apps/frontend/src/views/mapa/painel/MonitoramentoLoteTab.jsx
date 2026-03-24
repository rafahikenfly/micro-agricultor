import { useState } from "react";
import { Form, Button, } from "react-bootstrap";
import { useAuth } from "../../../services/auth/authContext";
import Loading from "../../../components/Loading";
import { ENTITY_TYPES, processarMonitoramento } from "micro-agricultor";
import { canteirosService } from "../../../services/crud/canteirosService";
import { plantasService } from "../../../services/crud/plantasService";
import { historicoEfeitosService } from "../../../services/history/efeitosService";
import { necessidadesService } from "../../../services/crud/necessidadesService";
import { eventosService } from "../../../services/history/eventosService";
import { useMapaEngine } from "../MapaEngine";
import { useCatalogos } from "../../../hooks/useCatalogos";

import { StandardCard, StandardInput } from "../../../utils/formUtils";

export default function MonitoramentoLoteTab({ entidades, tipoEntidadeId, showToast, stringTimestamp }) { 
  if (!entidades || entidades.length === 0) return null
  const { user } = useAuth();
  const engine = useMapaEngine();
  const { catalogoCaracteristicas, reading } = useCatalogos(["caracteristicas"]);

  const [form, setForm] = useState({});
  const [writing, setWriting] = useState(false);

  const monitorar = async () => {
    
    // Recupera o timestamp
    const date = new Date(stringTimestamp);
    const timestamp = date.getTime();

    // Recupera as medidas do formulário
    // O form da inserção global não carrega a entidade
    // form = {[caracteristicaId]: {atualizar, valor, confianca}}
    // ela é recuperada do selectionData
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
    if (Object.keys(medidas).length === 0) {
      //TODO: USETOAST
      showToast("Selecione ao menos uma característica para atualizar.", "danger");
      return;
    }
    
    // Recupera o tipoEntidadeId
    // no formulário global, tipoEntidadeId é recebido como parâmetro
    if (!tipoEntidadeId) {
      toastMessage({
        body: "Erro registrando o monitoramento. Tipo de entidade indefinido.",
        variant: VARIANT_TYPES.RED,
      })
      return;
    }

    // Monta o array de entidades
    // no formulario global, as entidades são recebidas como parâmetro
    if (!entidades || entidades.length === 0) {
      toastMessage({
        body: "Erro registrando o monitoramento. Nenhuma entidade selecionada.",
        variant: VARIANT_TYPES.RED,
      })
      return;
    }
    
    //TODO DAQUI PRA BAIXO!
    // Processa os monitoramentos com user, tipoEntidadeId, entidades, medidas e timestamp
    setWriting(true);
    const servicesMap = {
      [ENTITY_TYPES.CANTEIRO]: canteirosService,
      [ENTITY_TYPES.PLANTA]: plantasService,
    }
    try {
      await processarMonitoramento({
        user,
        tipoEntidadeId,
        timestamp,
        medidas,
        entidades,
        services: {
          eventos: eventosService,
          entidade: servicesMap[tipoEntidadeId],
          historicoEfeitos: historicoEfeitosService,
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
      engine.hideConfigPanel();
    } catch (err) {
      console.error(err)
      showToast({
        body: `Erro ao registrar monitoramento.`,
        variang: "danger"
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
        onClick={monitorar}
      >
        {writing ? "Aplicando monitoramento..."
          : "Aplicar monitoramento"
        }
      </Button>
    </>
  );
}
