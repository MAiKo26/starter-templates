import pino from "pino";

import { envLogLevelToPino } from "@/core/log-level";
import { getRequestLogger } from "@/core/request-logger-store";
import { env } from "@/env";

function buildLoggerOptions(): pino.LoggerOptions {
  const level = envLogLevelToPino(env.LOG_LEVEL);
  const base: pino.LoggerOptions = {
    level,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "res.headers.set-cookie",
      ],
      remove: true,
    },
  };

  if (env.LOG_PRETTY) {
    return {
      ...base,
      transport: {
        target: "pino-pretty",
        options: { colorize: true },
      },
    };
  }

  return base;
}

export const logger = pino(buildLoggerOptions());

export function resolveApiLogger(explicit?: pino.Logger): pino.Logger {
  return explicit ?? getRequestLogger() ?? logger;
}
