import { Procedure, ProcedureType, ProcedureParams } from '@trpc/server';

import { createCallerFactory, router } from '@/backend-api/src/lib/trpc';
import { createContext } from './context';
import type { Context } from '@/backend-api/src/modules/types';

export function runProcedure<T extends ProcedureType, P extends ProcedureParams>(
  ctx: Context | undefined,
  procedure: Procedure<T, P>,
  input: P['_input_in'],
): Promise<P['_output_out']> {
  const createCaller = createCallerFactory(router({ procedure }));
  const caller = createCaller(ctx ?? createContext());
  return caller.procedure(input);
}
