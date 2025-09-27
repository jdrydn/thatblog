import DataLoader from 'dataloader';

import type * as allModels from './models';

export function createLoaders(models: typeof allModels) {
  const SystemBySelf = new DataLoader<string, allModels.SystemItem>(
    async () => {
      let system: allModels.SystemItem;

      const getResult = await models.System.get({}).go();
      if (getResult.data) {
        system = getResult.data;
      } else {
        const createResult = await models.System.create({}).go();
        system = createResult.data;
      }

      return [system];
    },
    {
      maxBatchSize: 1,
    },
  );

  return {
    System: Object.freeze({
      load() {
        return SystemBySelf.load('SELF');
      },
      clear() {
        SystemBySelf.clear('SELF');
      },
    }),
  };
}
