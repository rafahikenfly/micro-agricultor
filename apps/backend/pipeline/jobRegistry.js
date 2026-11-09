import { currentStateInspector } from "../scheduler/currentStateInspector.js";
import { evolucaoDiaria } from "../scheduler/evolucaoDiaria.js";
import { mediaTaskInspector } from "../scheduler/mediaTaskInspector.js";
import { plantStageInspector } from "../scheduler/plantStageInspector.js";
import { reportTaskInspector } from "../scheduler/reportTaskInspector.js";
import { taskStateInspector } from "../scheduler/taskStateInspector.js"

import { distribuidorDeTarefas } from "../scheduler/distribuidorDeTarefas.js"

export const jobRegistry = {
  currentStateInspector,
  mediaTaskInspector,
  taskStateInspector,
  plantStageInspector,
  reportTaskInspector,
  evolucaoDiaria,             // Evolui as características de todas as entidades que têm algum tipo de evolução temporal no estado
  distribuidorDeTarefas,      // Analisa todas as tarefas pendentes e atribui um agente para elas
};