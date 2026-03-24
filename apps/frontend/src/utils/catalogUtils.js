export const resolveSelection = (selection, tipoEntidadeId, catalog) => {
  if (!selection || !tipoEntidadeId || !catalog) return [];
  return selection
    .getIdsByType(tipoEntidadeId)
    .map(id => catalog.map.get(id))
    .filter(Boolean);
};

export const resolvePrimarySelection = (selection, catalogs) => {
  if (!selection?.primary || !catalogs) return null;
  
  const [tipo, id] = selection.primary.split(":");

  return catalogs?.[tipo]?.map?.get(id) ?? null;
};