import { criarCanteiro } from "@domain/canteiro.rules";
import { getCenterFromBox, getMouseInMapSpace, getResizeBox, getMapPointFromEvent, getMapPointFromPoint, getSVGPoint } from "../../../services/svg/PointFunctions";
import { salvarCanteiro } from "../../../services/application/canteiro.application";
import { ACTION_TYPES } from "../../../../shared/types/ACTION_TYPES";

export function createHortaInputHandler(engine, horta, user, svgRef, gRef) {
  return {
    onClick(e) {
        console.log(`Clicou na horta ${horta.nome} (${horta.id})`)
    },
    onMouseDown(e) {
      if (engine.showDrag) {
//        const mapPoint = getMapPointFromEvent(e, engine.state.transform)
        const mapPoint = getMouseInMapSpace(svgRef, gRef, e.clientX, e.clientY);
        engine.dragStart(mapPoint);
      }
    },
    onMouseMove(e) {
      if (engine.isDragging || engine.isResizing) {
//        const mapPoint = getMapPointFromEvent(e,engine.state.transform)
        const mapPoint = getMouseInMapSpace(svgRef, gRef, e.clientX, e.clientY);
        if (engine.isDragging) engine.dragUpdate(mapPoint) 
        if (engine.isResizing) engine.resizeUpdate(mapPoint); 
      }
    },
    async onMouseUp(e, horta) {
      if (engine.isDragging) {
        // recupera dados do drag/draw
        const { start, end } = engine.state.drag;
        const geometria = engine.state.draw.geometria; //TODO: Não é sempre do DRAW
        let posicao = {};
        let dimensao = {};

        // calcula geometria
        switch (geometria) { 
          case "circle":
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const radius = Math.sqrt(dx * dx + dy * dy);
            const diameter = radius * 2;
  
            posicao = {
              x: Math.round(start.x),
              y: Math.round(start.y),
              z: 0,
            };
  
            dimensao = {
              x: Math.round(diameter),
              y: Math.round(diameter),
              z: 0,
            };
            break;
          case "rect":
            const minX = Math.min(start.x, end.x);
            const minY = Math.min(start.y, end.y);
            const maxX = Math.max(start.x, end.x);
            const maxY = Math.max(start.y, end.y);
            const width = maxX - minX;
            const height = maxY - minY;
        
            posicao = {
                x: Math.round(minX + width / 2),
                y: Math.round(minY + height / 2),
                z: 0,
            }
            dimensao = {
                x: Math.round(width),
                y: Math.round(height),
                z: 0,
            }
            break;
          default:
            console.warn (`Geometria ${geometria} não programada em MapaHorta.handler.mouseUp.`)
            break;
        }
        
        // Novo canteiro do mapa herda as seguintes propriedades:
        // - horta (obrigatório)
        // descrição (padrão "Criado pelo mapa")
        // posição (do drag)
        // geometria (do draw)
        const novoCanteiro = criarCanteiro({
            horta,
            data: {
              descricao: "Criado a partir do mapa",
              posicao,
              dimensao,
              aparencia: {
                geometria
              },
            }
        })
        engine.dragFinish(); //esse finish não tem efeito prático, pq o reset também conclui
        engine.dragReset();
        engine.setPendingMutation({actionType: ACTION_TYPES.CREATE, before: null})
        engine.setModalData(novoCanteiro);
        engine.openModalCanteiro();
      }
      else if (engine.isResizing) {
        const entidade = engine.state.resize.entidade;
        const box = getResizeBox(entidade, engine.state.resize);
        const { posicao, dimensao } = getCenterFromBox(box);
        try {
          await salvarCanteiro ({
            data: {...entidade, posicao, dimensao},
            user,
          });
          //TODO TOAST SUCESSO
        }
        catch (err) {
          console.error (err)
          //TODO TOAST ERRO
        }
        finally {
          engine.resizeFinish()
        }
      }
    },
  }
}
