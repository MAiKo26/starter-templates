import { AsyncLocalStorage } from "node:async_hooks";

import type pino from "pino";

const als = new AsyncLocalStorage<pino.Logger>();

export function runWithRequestLogger<T>(logger: pino.Logger, fn: () => T): T {
  return als.run(logger, fn);
}

export function getRequestLogger(): pino.Logger | undefined {
  return als.getStore();
}
