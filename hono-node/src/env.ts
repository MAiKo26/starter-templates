import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PORT: z.coerce.number().min(1).max(65535).default(8000),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    LOG_LEVEL: z
      .enum(["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"])
      .default("INFO"),
    LOG_PRETTY: z.coerce.boolean().default(false),
    DATABASE_URL: z.string().url(),
    PG_POOL_MAX: z.coerce.number().min(1).default(10),
    PG_POOL_MIN: z.coerce.number().min(1).default(1),
    CORS_ALLOWED_ORIGINS: z.string().min(1).default("http://localhost:3000"),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    AUTH_COOKIE_SECURE: z.coerce.boolean().default(false),
    AUTH_COOKIE_MAX_AGE_SECONDS: z.coerce
      .number()
      .int()
      .min(60)
      .default(604_800),
    MINIO_ENDPOINT: z.string().default("localhost"),
    MINIO_PORT: z.coerce.number().min(1).max(65535).default(9000),
    MINIO_ACCESS_KEY: z.string().default("minioadmin"),
    MINIO_SECRET_KEY: z.string().default("minioadmin"),
    MINIO_BUCKET_NAME: z.string().default("starter-blobs"),
    MINIO_SECURE: z.coerce.boolean().default(false),
    REDIS_URL: z.string().default("redis://localhost:6379"),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().min(1000).default(60_000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().min(1).default(100),
  },
  clientPrefix: "PUBLIC_",
  client: {},
  runtimeEnv: process.env, // eslint-disable-line n/no-process-env
  emptyStringAsUndefined: true,
});
