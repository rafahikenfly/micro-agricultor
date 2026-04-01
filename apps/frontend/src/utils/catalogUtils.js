export const resolveSelection = (selection, tipoEntidadeId, cache) => {
  if (!selection || !tipoEntidadeId || !cache) return [];
  return selection
    .getIdsByType(tipoEntidadeId)
    .map(id => cache.map.get(id))
    .filter(Boolean);
};

export const resolvePrimarySelection = (selection, caches) => {
  if (!selection?.primary || !caches) return null;
  
  const [tipo, id] = selection.primary.split(":");

  return caches?.[tipo]?.map?.get(id) ?? null;
};