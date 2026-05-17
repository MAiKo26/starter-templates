import { serve } from "@hono/node-server";

import { logger } from "@/core/logger";
import { initializeBuckets, s3Client } from "@/core/s3-client";
import { env } from "@/env";
import { corsMiddleware } from "@/middleware/cors-middleware";
import { errorHandler } from "@/middleware/error-handler";
import { pinoMiddleware } from "@/middleware/pino-middleware";
import { rateLimiter } from "@/middleware/rate-limiter";
import app from "@/routes";

app.use(pinoMiddleware);
app.use(corsMiddleware);
app.use("*", rateLimiter);
app.use(errorHandler);

app.get("/health", async (c) => {
  const [dbOk, storageOk] = await Promise.all([
    (async () => {
      try {
        await app.request("/api/v1/projects?limit=1");
        return true;
      } catch {
        return false;
      }
    })(),
    (async () => {
      try {
        return await s3Client.bucketExists(env.MINIO_BUCKET_NAME);
      } catch {
        return false;
      }
    })(),
  ]);

  const status = dbOk && storageOk ? "ok" : "degraded";
  const statusCode = dbOk && storageOk ? 200 : 503;

  return c.json(
    {
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: dbOk ? "connected" : "disconnected",
        storage: storageOk ? "connected" : "disconnected",
      },
    },
    statusCode,
  );
});

await initializeBuckets();

const server = serve({
  fetch: app.fetch,
  port: env.PORT,
});

logger.info({ port: env.PORT }, "Server started");
logger.info({ url: `http://localhost:${env.PORT}/docs` }, "API docs");

const shutdown = () => {
  logger.info("Shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
