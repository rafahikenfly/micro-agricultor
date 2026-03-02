//import { montarLogEvento } from "@domain/evento.rules";
import { plantarVariedade } from "@domain/planta.rules";
import { db } from "../../../firebase";
import { eventosService } from "../../../services/history/eventosService";
import { plantasService } from "../../../services/crud/plantasService";
import { toggleSelecao } from "../../../utils/uiUtils";
import { MODOS_MAPA } from "../MapaContexto";
import { getCenterFromBox, getMapPointFromEvent, getMouseInMapSpace, getPreviewPoints, getResizeBox, pointNearBorder } from "../../../services/svg/PointFunctions";
import { salvarCanteiro } from "../../../services/application/canteiro.application";
import { ACTION_TYPES } from "../../../../shared/types/ACTION_TYPES";
import { salvarPlanta } from "../../../services/application/plantas.application";

export function createCanteiroInputHandler(engine, canteiro, user, showToast, svgRef, gRef) {
  return {
    async onClick(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      // modo edit, gerencia a seleção
      if (engine.isSelecting) {
        engine.selectSet("canteiro",
          (evt.ctrlKey || evt.metaKey) ? 
            toggleSelecao(engine.selectionCanteiros, canteiro.id) : // multi seleção (com CTRL)
            [ canteiro.id ]                                         // seleção única (sem CTRL)
        );
      }
      // modo place com entidade planta
      if (engine.isPlacing && engine.state.placing.tipoEntidadeId === "planta") {
        const { mousePos, placing, preview, } = engine.state;
        const { linhas, colunas, espacamentoLinha, espacamentoColuna } = placing.layout;

        const pontos = getPreviewPoints({
          mousePos,
          preview,
          linhas,
          colunas,
          espacamentoLinha,
          espacamentoColuna
        });

        let novaPlantaCount = 0;
        engine.previewFinish();
        engine.hidePreview();
        // TODO: batch create de planta ao inves de criar uma por uma (e pode ser até mesmo só um evento)
        for (const ponto of pontos) {
          try {
            const posicao = {}
            switch (placing?.metadata?.variedade?.aparencia?.geometria) {
              case "circle":
                posicao.x = ponto.x;
                posicao.y = ponto.y;
                break;
              case "rect":
                posicao.x = ponto.x + (preview.width/2);
                posicao.y = ponto.y + (preview.height/2);
                break;
              //TODO: case "ellipse": break;
              //TODO: case "polygon": break;
              default:
                throw new Error (`Geometria ${placing?.metadata?.variedade?.aparencia?.geometria} desconhecida.`)
            }
            // cria planta
            const novaPlanta = plantarVariedade({
              especie: placing?.metadata?.especie,
              variedade: placing?.metadata?.variedade,
              tecnica: placing?.metadata?.tecnica,
              canteiro,
              posicao,
            });
            novaPlanta.nome = `Nova planta ${novaPlantaCount}`;
            await salvarPlanta ({
              data: novaPlanta,
              timestamp: placing.timestamp,
              mutation: {actionType: ACTION_TYPES.CREATE, before: null, after: novaPlanta},
              user,
            });
            novaPlantaCount++;
          }
          catch (err) {
            console.error (err)
            //TODO: TOAST ERRO
          }
        }
        engine.previewReset();
        //TODO: TOAST SUCESSO
      }
    },
    onDoubleClick(evt) {
      evt.preventDefault();
      evt.stopPropagation();

      // Abre modal de edição da entidade
      engine.setPendingMutation({actionType: ACTION_TYPES.EDIT, before: canteiro})
      engine.selectModalData(canteiro);
      engine.openModalCanteiro();
    },
    // TODO: ATIVAR O PREVIEW QUANDO O GRID COUBER NA ENTIDADE
    onMouseEnter(evt) {
      evt.stopPropagation();
      if (engine.isPlacing) engine.openPreview()
    },
    // TODO: DESATIVAR O PREVIEW QUANDO O GRID NÃO COUBER MAIS NA ENTIDADE
    onMouseLeave(evt) {
      evt.stopPropagation();
      if (engine.isPlacing) engine.hidePreview();
    },
    onMouseDown(e, canteiro) {
      if (engine.isDrawing) {
        const mapPoint = getMouseInMapSpace(svgRef, gRef, e.clientX, e.clientY)
        const handle = pointNearBorder(mapPoint, canteiro, 8);
        if (handle) {
          const resizeData = {
            current: mapPoint,
            direction: handle,
            entidade: canteiro,
            tipoEntidadeId: "canteiro",
          };
          engine.resizeStart(resizeData)
        }
      }
    },
    onMouseMove(e) {
      if (engine.isResizing) {
        const mapPoint = getMouseInMapSpace(svgRef, gRef, e.clientX, e.clientY)
        engine.resizeUpdate(mapPoint);
      }
    },
    async onMouseUp(e) {
      if (engine.isResizing(canteiro.id)) {
        const before = engine.state.resize.entidade;
        const box = getResizeBox(before, engine.state.resize);
        const { posicao, dimensao } = getCenterFromBox(box);
        const after = {...before, posicao, dimensao};

        try { //TODO: SALVAR PENDING MUTATION E GERENCIAR NO MAPA?
          await salvarCanteiro ({
            data: {...before, posicao, dimensao},
            user,
            mutation: { actionType: ACTION_TYPES.RESIZE, before, after }
          });
        }
        catch (err) {
          console.error (err)
          //TODO TOAST ERRO
        }
        finally {
          engine.resizeFinish()
        }
      }
    }
  };
}