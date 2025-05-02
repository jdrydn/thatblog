import DataLoader from 'dataloader';

import type { system, SystemItem } from './model';

const SELF_ID = 'SELF';

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

  const System = {
    load: () => SystemBySelf.load(SELF_ID),
    clear: () => SystemBySelf.clear(SELF_ID),
  };

  return {
    System,
  };
}
