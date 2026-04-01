export function createBatchService({ createNativeBatch, maxOps = 450 }) {
  function create() {
    let batch = createNativeBatch();
    let opCount = 0;

    async function commitIfNeeded(force = false) {
      if (opCount >= maxOps || force) {
        await batch.commit();
        batch = createNativeBatch();
        opCount = 0;
      }
    }

    return {
      /**
       * Adiciona uma operação ao batch
       * fn recebe o batch nativo (firebase/admin)
       */
      add(fn) {
        fn(batch);
        opCount++;
      },

      /**
       * Commit explícito (encerra o batch atual)
       */
      async commit() {
        if (opCount === 0) return;
        await batch.commit();
        opCount = 0;
        batch = createNativeBatch();
      },

      /**
       * Commit automático se atingiu limite
       */
      async commitIfNeeded(force = false) {
        await commitIfNeeded(force);
      },

      /**
       * Debug / controle
       */
      getOpCount() {
        return opCount;
      }
    };
  };

  return {
    create
  };
}