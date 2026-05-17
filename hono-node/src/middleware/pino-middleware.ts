import { randomUUID } from "node:crypto";

import type { MiddlewareHandler } from "hono";

import type { HonoEnv } from "@/core/hono-env";
import { logger } from "@/core/logger";

export const pinoMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const requestId = c.req.header("x-request-id") ?? randomUUID();

  const childLogger = logger.child({ requestId });

  c.set("logger", childLogger);

  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  childLogger.info(
    {
      method: c.req.method,
      url: c.req.url,
      status: c.res.status,
      durationMs: ms,
    },
    "Request completed",
  );
};
