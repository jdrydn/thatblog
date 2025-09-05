import DataLoader from 'dataloader';

import type { system, SystemItem } from './model';

export function createLoaders(models: { system: typeof system }) {
  const SystemBySelf = new DataLoader<string, SystemItem>(
    async () => {
      let system: SystemItem;

      const getResult = await models.system.get({}).go();
      if (getResult.data) {
        system = getResult.data;
      } else {
        const createResult = await models.system.create({}).go();
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
