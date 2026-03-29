export const RECURRING_TYPES = {
  NONE: "none",
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  ANNUALLY: "annually",
}

export const RECURRING = {
  [RECURRING_TYPES.NONE]: {id: RECURRING_TYPES.NONE, nome: "Nenhuma"},
  [RECURRING_TYPES.DAILY]: {id: RECURRING_TYPES.DAILY, nome: "Diário"},
  [RECURRING_TYPES.WEEKLY]: {id: RECURRING_TYPES.WEEKLY, nome: "Semanal"},
  [RECURRING_TYPES.MONTHLY]: {id: RECURRING_TYPES.MONTHLY, nome: "Mensal"},
  [RECURRING_TYPES.ANNUALLY]: {id: RECURRING_TYPES.ANNUALLY, nome: "Anual"},
}