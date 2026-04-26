import { useEffect, useState } from "react";
import { renderOptions, StandardInput } from "../../../utils/formUtils";
import { Button, Form, } from "react-bootstrap";
import { useAuth } from "../../../services/auth/authContext";
import { ISOToReadableString, toDateTimeLocal } from "../../../utils/dateUtils";
import { manejar, VARIANTE } from "micro-agricultor";
import { useCache } from "../../../hooks/useCache";
import { useToast } from "../../../services/toast/toastProvider";
import { resolvePrimarySelection, resolveSelection } from "../../../utils/catalogUtils";
import { pluralizar } from "../../../utils/uiUtils";
import { necessidadesService, entidadesService } from "../../../services/crudService";
import { batchService } from "../../../services/batchService";
import { eventosService, mutacoesService } from "../../../services/historyService";
import { useMapaEngine } from "../MapaEngine";
import Loading from "../../../components/Loading";

export default function PainelManejar({selection }) {
  if (!selection) return null;

  const { user } = useAuth();
  const { setShowPainel } = useMapaEngine();
  const { toastMessage } = useToast();
  const { cacheManejos, cacheEntidades, reading } = useCache(["manejos", "entidades"])

  const [primaryType, setPrimaryType] = useState(selection.primaryType());
  const [stringTimestamp, setStringTimestamp] = useState(toDateTimeLocal(new Date()));
  const [manejoSelecionado, setManejoSelecionado] = useState({})

  const [writing, setWriting] = useState(false);

  useEffect(()=>setPrimaryType(selection.primaryType()), [selection]);
  

  const list = resolveSelection(selection, primaryType, cacheEntidades?.[primaryType]);
  const last = resolvePrimarySelection(selection, cacheEntidades);
  const manejosAplicaveis = (cacheManejos?.list ?? []).filter(
    m => m.aplicavel?.[primaryType] === true
  );  

  const preparaManejar = async () => {
    // Recupera o timestamp
    const date = new Date(stringTimestamp);
    const timestamp = date.getTime();

    // Recupera as intervenções
    // TODO: apenas é possível aplicar o mesmo manejo a todas as entidades
    // talvez seja o caso de aplicar manejos diferentes de uma mesma classe
    // (exemplo: regar com intensidades diferentes entidades diferentes)
    const intervencoes = {};
    for (const entidade of list) {
      intervencoes[entidade.id] = manejoSelecionado.id
    }

    // Recupera o tipoEntidadeId
    // no monitoramento por característica, tipoEntidadeId é recebido como parâmetro
    if (!primaryType) {
      toastMessage({
        body: "Erro registrando o monitoramento. Tipo de entidade indefinido.",
        variant: VARIANTE.RED.variant,
      })
      return;
    }

    if (Object.keys(intervencoes).length === 0) {
      toastMessage({
        body: "Selecione ao menos um manejo para aplicar.",
        variant: VARIANTE.YELLOW.variant,
      });
      return;
    }

    // Monta o array de entidades
    // no manejo, as entidades são recebidas pela seleção e é montada a lista
    if (!list || list.length === 0) {
      toastMessage({
        body: "Erro registrando o manejo. Nenhuma entidade selecionada.",
        variant: VARIANTE.RED.variant,
      })
      return;
    }



    setWriting(true);
    try {
      await manejar({
        tipoEntidadeId: primaryType,
        entidades: list,
        manejo: manejoSelecionado,
        intervencoes,
        timestamp,
        user,
        services: {
          batch: batchService,
          eventos: eventosService,
          entidade: entidadesService(primaryType),
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
      setManejoSelecionado({});
      toastMessage({
        body: `Registrado o manejo ${manejoSelecionado.nome} em ${list.length} ${pluralizar(list.length,primaryType)}.`,
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

  if (reading) return <Loading variant="overlay" />
  return (
    <>
    <StandardInput label="Manejo" width="120px">
      <Form.Select
        value={manejoSelecionado.id || ""}
        onChange={(e) => setManejoSelecionado(cacheManejos?.map?.get(e.target.value))}
      >
        {renderOptions({
          list: manejosAplicaveis,
          loading: reading,
          placeholder: "Selecione o manejo",
        })}
      </Form.Select>
    </StandardInput>
      <StandardInput label="Data/hora" width="120px">
        <Form.Control
          type="datetime-local"
          value={stringTimestamp}
          onChange={(e)=> setStringTimestamp(e.target.value)}
        />
      </StandardInput>
      <div className="p-2 border rounded bg-light mb-3">
        <strong>Resumo do manejo</strong>
        <div>Data/Hora: {ISOToReadableString(stringTimestamp)}</div>
        <div>Manejo: {manejoSelecionado.nome || "-"}</div>
        <div>{pluralizar(list.length, "Alvo")}: {last ? list.length > 1 ? `${list.length} ${primaryType}s` : `${last?.nome}` : ": -"}</div>
        <div>Descrição: {manejoSelecionado.descricao || "-"}</div>
      </div>
      <div className="d-grid gap-2">
        <Button
          variant="success"
          disabled={!manejoSelecionado || list.length === 0}
          onClick={preparaManejar}
        >
          {list.length === 0 ? "Selecione entidades para manejar"
          : writing ? "Aplicando manejo..."
            : "Aplicar manejo"
          }
        </Button>
      </div>
    </>
  );
}
