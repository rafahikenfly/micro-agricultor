export function createCacheService() {
  let cache = {};

  async function get(key, crud, filters = [], orderBy = null) {
    if (!cache[key]) {
      const list = await crud.get(filters, orderBy);
      const map = new Map(list.map(item => [item.id, item]));

      cache[key] = { list, map };
    }

    return cache[key];
  }

  function clearCache(key) {
    if (!key) {
      cache = {};
      return;
    }
    delete cache[key];
  }

  return {
    get,
    clearCache,
    hasCache: key => !!cache[key],
  };
}