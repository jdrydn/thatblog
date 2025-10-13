import type { Application } from '@/src/modules/models';

export async function scenario(app: typeof Application, variant: 'GEOFF_TESTINGTON'): Promise<void> {
  switch (variant) {
    case 'GEOFF_TESTINGTON': {
      await app.transaction.write([]).go();
      break;
    }
  }
}
