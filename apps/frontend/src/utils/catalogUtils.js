export const resolveSelection = (selection, tipoEntidadeId, catalog) => {
  if (!selection || !tipoEntidadeId || !catalog) return [];
  return selection
    .getIdsByType(tipoEntidadeId)
    .map(id => catalog.map.get(id))
    .filter(Boolean);
};