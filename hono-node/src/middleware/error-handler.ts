import type { MiddlewareHandler } from "hono";

import { AppError } from "@/core/errors/app-error";
import type { HonoEnv } from "@/core/hono-env";
import { resolveApiLogger } from "@/core/logger";

const STATUS_CODES: Record<
  number,
  400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 501 | 503
> = {
  400: 400,
  401: 401,
  403: 403,
  404: 404,
  409: 409,
  422: 422,
  429: 429,
  500: 500,
  501: 501,
  503: 503,
};

export const errorHandler: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const logger = resolveApiLogger();

  try {
    await next();
  } catch (err) {
    if (err instanceof AppError) {
      logger.warn(
        { statusCode: err.statusCode, message: err.message },
        "Operational error",
      );
      const status = STATUS_CODES[err.statusCode] ?? 500;
      return c.json({ error: err.message }, status);
    }

    logger.error({ err }, "Unexpected error");
    return c.json({ error: "Internal server error" }, 500);
  }
};
